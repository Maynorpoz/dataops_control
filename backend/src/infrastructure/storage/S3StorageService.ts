import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export class S3StorageService {
  private client: S3Client;
  private bucket: string;
  private simulated: boolean;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'dataops-backups-dev';
    this.simulated = !process.env.AWS_ACCESS_KEY_ID;

    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! }
        : undefined,
    });
  }

  async uploadWithStreaming(localPath: string, s3Key: string): Promise<string> {
    if (this.simulated) {
      console.log(`[S3StorageService] Simulated upload: ${localPath} → s3://${this.bucket}/${s3Key}`);
      return `https://${this.bucket}.s3.amazonaws.com/${s3Key}`;
    }

    const fileSize = fs.statSync(localPath).size;
    const PART_SIZE = 10 * 1024 * 1024; // 10 MB parts

    if (fileSize < PART_SIZE) {
      // Simple upload for small files
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: fs.createReadStream(localPath),
      }));
    } else {
      // Multipart upload for large files
      const createResp = await this.client.send(
        new CreateMultipartUploadCommand({ Bucket: this.bucket, Key: s3Key })
      );
      const uploadId = createResp.UploadId!;
      const parts: { ETag: string; PartNumber: number }[] = [];
      const stream = fs.createReadStream(localPath, { highWaterMark: PART_SIZE });
      let partNumber = 1;

      for await (const chunk of stream) {
        const partResp = await this.client.send(new UploadPartCommand({
          Bucket: this.bucket, Key: s3Key, UploadId: uploadId,
          PartNumber: partNumber, Body: chunk as Buffer,
        }));
        parts.push({ ETag: partResp.ETag!, PartNumber: partNumber++ });
      }

      await this.client.send(new CompleteMultipartUploadCommand({
        Bucket: this.bucket, Key: s3Key, UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      }));
    }

    return `https://${this.bucket}.s3.amazonaws.com/${s3Key}`;
  }
}

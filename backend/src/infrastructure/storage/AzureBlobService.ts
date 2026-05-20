import fs from 'fs';

// Azure Blob Storage service — falls back to simulation when connection string is absent
export class AzureBlobService {
  private container: string;
  private simulated: boolean;

  constructor() {
    this.container = process.env.AZURE_STORAGE_CONTAINER || 'dataops-backups';
    this.simulated = !process.env.AZURE_STORAGE_CONNECTION_STRING;
  }

  async uploadStream(localPath: string, blobName: string): Promise<string> {
    if (this.simulated) {
      console.log(`[AzureBlobService] Simulated upload: ${localPath} → azure://${this.container}/${blobName}`);
      return `https://storagesimulated.blob.core.windows.net/${this.container}/${blobName}`;
    }

    const { BlobServiceClient } = await import('@azure/storage-blob');
    const serviceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = serviceClient.getContainerClient(this.container);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const fileStream = fs.createReadStream(localPath);
    const fileSize = fs.statSync(localPath).size;

    await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 20);
    return blockBlobClient.url;
  }
}

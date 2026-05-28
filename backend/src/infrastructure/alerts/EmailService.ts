import nodemailer from 'nodemailer';
import { AlertLog } from '../../domain/entities/AlertLog';

const configured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const severityColor: Record<string, string> = {
  CRITICAL: '#dc2626',
  WARNING:  '#f59e0b',
  INFO:     '#3b82f6',
};

export const EmailService = {
  async send(alert: Partial<AlertLog>): Promise<void> {
    if (alert.severity === 'INFO') return;

    if (!configured || !transporter) {
      console.warn('[EmailService] SMTP_USER/SMTP_PASS no configurados — correo omitido para:', alert.rule_name);
      return;
    }

    const color = severityColor[alert.severity ?? 'WARNING'] ?? '#f59e0b';
    const subject = `[DataOps ${alert.severity}] ${alert.rule_name}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;padding:24px;border-radius:8px;">
        <div style="border-left:4px solid ${color};padding-left:16px;margin-bottom:20px;">
          <h2 style="color:${color};margin:0 0 4px 0;">
            ${alert.severity} — DataOps Control Center
          </h2>
          <p style="color:#94a3b8;margin:0;font-size:13px;">${new Date().toISOString()}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#64748b;padding:8px 0;font-size:13px;width:140px;">Regla disparada</td>
            <td style="color:#f1f5f9;padding:8px 0;font-size:13px;">${alert.rule_name}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:8px 0;font-size:13px;">Severidad</td>
            <td style="padding:8px 0;">
              <span style="background:${color};color:#fff;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:bold;">
                ${alert.severity}
              </span>
            </td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:8px 0;font-size:13px;">Detalle</td>
            <td style="color:#f1f5f9;padding:8px 0;font-size:13px;">${alert.message}</td>
          </tr>
          ${alert.condition_value != null ? `
          <tr>
            <td style="color:#64748b;padding:8px 0;font-size:13px;">Valor actual</td>
            <td style="color:#f1f5f9;padding:8px 0;font-size:13px;">${Number(alert.condition_value).toFixed(2)}</td>
          </tr>` : ''}
          ${alert.threshold_value != null ? `
          <tr>
            <td style="color:#64748b;padding:8px 0;font-size:13px;">Umbral configurado</td>
            <td style="color:#f1f5f9;padding:8px 0;font-size:13px;">${alert.threshold_value}</td>
          </tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;">
        <p style="color:#475569;font-size:12px;margin:0;">
          Este correo fue generado automáticamente por DataOps Control Center.<br>
          Puedes revisar el estado completo en el dashboard.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"DataOps Monitor" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL_TO || process.env.SMTP_USER,
      subject,
      html,
    });

    console.log(`[EmailService] Correo enviado: ${subject} → ${process.env.ALERT_EMAIL_TO || process.env.SMTP_USER}`);
  },
};

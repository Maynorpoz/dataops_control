import { AlertLog } from '../../domain/entities/AlertLog';

export const EmailSimulator = {
  async send(alert: Partial<AlertLog>): Promise<void> {
    if (alert.severity === 'INFO') return; // Only WARNING and CRITICAL get emails
    console.log(`[EmailSimulator] 📧 SEND to admin@dataops.local`);
    console.log(`  Subject: [${alert.severity}] ${alert.rule_name}`);
    console.log(`  Body: ${alert.message}`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);
  },
};

import { AlertLog } from '../../domain/entities/AlertLog';

let ioInstance: any = null;

export const DashboardNotifier = {
  setIo(io: any) {
    ioInstance = io;
  },

  notify(alert: Partial<AlertLog>) {
    if (!ioInstance) return;
    ioInstance.emit('alert', alert);
    console.log(`[DashboardNotifier] Alert emitted via Socket.IO: ${alert.rule_name} (${alert.severity})`);
  },
};

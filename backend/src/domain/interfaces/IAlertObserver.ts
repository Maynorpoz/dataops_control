import { AlertLog } from '../entities/AlertLog';

export interface IAlertObserver {
  notify(alert: Partial<AlertLog>): Promise<void>;
}

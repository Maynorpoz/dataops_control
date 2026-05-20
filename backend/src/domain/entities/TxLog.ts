export type LockType = 'SHARED' | 'EXCLUSIVE' | 'DEADLOCK' | 'TIMEOUT';

export interface TxLog {
  id: bigint;
  db_id: number;
  session_id: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  inicio: Date;
  fin: Date | null;
  wait_time: number | null;
  lock_type: LockType | null;
  resolved: boolean;
  created_at: Date;
}

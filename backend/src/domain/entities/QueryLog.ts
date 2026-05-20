export type QueryClass = 'FAST' | 'MEDIUM' | 'SLOW' | 'CRITICAL';

export interface QueryLog {
  id: bigint;
  db_id: number;
  query_text: string;
  duration_ms: number;
  rows_returned: number | null;
  index_used: string | null;
  execution_plan: object | null;
  classification: QueryClass;
  created_at: Date;
}

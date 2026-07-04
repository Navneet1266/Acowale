export interface QueryResult<T> {
  rows: T[];
  rowCount: number | null;
}

export interface Queryable {
  query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface PagedResponse<T> {
  items: T[];
  count: number;
  take: number;
  skip: number;
}

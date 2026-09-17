export class PagedResult<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  total: number;

  constructor(items: T[], pageNo: number, pageSize: number, total: number) {
    this.items = items;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.total = total;
  }
}

export interface PagedResultApiModel<T = any> {
  count: number;
  data: T[];
}

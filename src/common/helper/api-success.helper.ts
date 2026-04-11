export class ApiResponse<T> {
  public statusCode: number;
  public data: T;
  public message: string;
  public success: boolean;
  public page?: number;
  public total?: number;
  public lastPage?: number;

  constructor(
    statusCode: number,
    data: T,
    message: string = "success",
    page?: number,
    total?: number,
    lastPage?: number
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (page) this.page = page;
    if (total !== undefined) this.total = total;
    if (lastPage !== undefined) this.lastPage = lastPage;
  }
}
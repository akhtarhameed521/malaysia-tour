export class ApiError extends Error {
  public statusCode: number;
  public data: null;
  public success: boolean;
  public errorMessage: string | string[];

  constructor(
    statusCode: number,
    message: string | string[] = "Something went wrong"
  ) {
    console.log("ApiError initialized with message:", message);
    super(typeof message === "string" ? message : message.join(", "));
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errorMessage = message;

    Error.captureStackTrace(this, this.constructor);
  }
}
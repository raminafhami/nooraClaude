export default class CustomError extends Error {
  statusCode = 500;
  timestamp = new Date().toISOString();
  errors: any;
  path: any;
  constructor(
    statusCode: number,
    message: string,
    errors?: any,
    path?: string,
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.path = path;
    // Object.setPrototypeOf(this, CustomError.prototype);
  }
}

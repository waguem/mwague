export class MkdiError {
  message: string;
  errorCode: number;
  httpStatusCode: number;
  path: string;
  method: string;

  constructor({
    errorCode,
    httpStatusCode,
    message,
    path,
    method,
  }: {
    message: string;
    errorCode: number;
    httpStatusCode: number;
    path: string;
    method: string;
  }) {
    this.message = message;
    this.errorCode = errorCode;
    this.httpStatusCode = httpStatusCode;
    this.path = path;
    this.method = method;
  }

  toString() {
    return JSON.stringify(this);
  }
}

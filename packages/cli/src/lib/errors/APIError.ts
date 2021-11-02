export interface APIErrorResponse {
  message: string;
  errorCode: string;
  requestID: string;
}

export class APIError extends Error {
  public constructor(error: APIErrorResponse) {
    super(error.message);
    this.name = `APIError - ${error.errorCode}`;
  }
}

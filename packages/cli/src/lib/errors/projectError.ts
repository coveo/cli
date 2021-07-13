export class InvalidProjectError extends Error {
  public static readonly message = 'INVALID_PROJECT_ERROR';
  public constructor() {
    super(InvalidProjectError.message);
  }
}

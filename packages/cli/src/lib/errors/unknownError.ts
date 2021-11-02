export class UnknownError extends Error {
  public name = 'Unknown CLI Error';
  public constructor() {
    super();
  }
}

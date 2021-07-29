export class InvalidProjectError extends Error {
  public constructor(path: string, reason: string) {
    super(`${path} is not a valid project: ${reason}`);
  }
}

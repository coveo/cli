export class CLIBaseError extends Error {
  public name = 'CLI Error';
  public constructor(message?: string) {
    super(message);
  }
}

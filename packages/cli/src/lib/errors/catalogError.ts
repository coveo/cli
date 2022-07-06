import {CLIBaseError} from './CLIBaseError';

export class NonUniqueCatalogIdFieldError extends CLIBaseError {
  public name = 'Non unique catalog field error';
  public constructor() {
    super('Multiple unique fields found');
  }
}

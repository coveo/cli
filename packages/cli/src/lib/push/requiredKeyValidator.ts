import {SchemaValue} from '@coveo/bueno';
import {CaseInsensitiveDocument} from './caseInsensitiveDocument';

export class RequiredKeyValidator<T> {
  private keys: string[];
  private validations: {value: T; message: string | null}[] = [];

  public constructor(
    k: string[] | string,
    private doc: CaseInsensitiveDocument<T>,
    private schema: SchemaValue<T>
  ) {
    if (Array.isArray(k)) {
      this.keys = k;
    } else {
      this.keys = [k];
    }
    this.doValidations();
  }

  private doValidations() {
    this.validations = this.keys.map((k) => {
      const value = this.doc.documentRecord[k.toLowerCase()];
      const validationMessage = this.schema.validate(value);
      if (validationMessage) {
        return {
          value,
          message: `Document contains an invalid value for ${k}: ${validationMessage}`,
        };
      }
      return {value, message: null};
    });
  }

  public get isValid() {
    return this.validEntries.length > 0;
  }

  public get value() {
    if (this.isValid) {
      return this.validEntries[0].value;
    }
    return null;
  }

  public get explanation() {
    if (this.isValid) {
      return '';
    }
    return this.invalidEntries[0].message!;
  }

  private get validEntries() {
    return this.validations.filter((validation) => validation.message === null);
  }

  private get invalidEntries() {
    return this.validations.filter((validation) => validation.message !== null);
  }
}

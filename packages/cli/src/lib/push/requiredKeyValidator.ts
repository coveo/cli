import {PrimitivesValues, SchemaValue} from '@coveo/bueno';
import {CaseInsensitiveDocument} from './caseInsensitiveDocument';

export class RequiredKeyValidator<T extends PrimitivesValues> {
  private keys: string[];
  private validations: {value: T | unknown; message: string | null}[] = [];

  public constructor(
    k: string[] | string,
    private doc: CaseInsensitiveDocument<PrimitivesValues>,
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
      if (this.isValueCorrectType(value)) {
        return {value, message: null};
      }
      return {
        value: value as unknown,
        message: `Document contains an invalid value for ${k}: ${this.getValidationMessage(
          value
        )}`,
      };
    });
  }

  public get isValid() {
    return this.validEntries.length > 0;
  }

  public get value() {
    if (this.isValid) {
      return this.validEntries[0].value as T;
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

  private getValidationMessage(value: PrimitivesValues) {
    return this.schema.validate(value as T);
  }

  private isValueCorrectType(value: PrimitivesValues): value is T {
    const validationMessage = this.getValidationMessage(value);
    if (validationMessage) {
      return false;
    }
    return true;
  }
}

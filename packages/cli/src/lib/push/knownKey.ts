import {isNullOrUndefined} from '@coveo/bueno';
import {CaseInsensitiveDocument} from './caseInsensitiveDocument';

export class KnownKeys<T> {
  private keys: string[];
  public constructor(
    k: string | string[],
    private doc: CaseInsensitiveDocument<T>
  ) {
    if (Array.isArray(k)) {
      this.keys = k;
    } else {
      this.keys = [k];
    }
  }

  public get value() {
    const found = this.keys.find(
      (k) => !isNullOrUndefined(this.doc.documentRecord[k.toLowerCase()])
    );
    if (found) {
      return this.doc.documentRecord[found.toLowerCase()];
    }

    return null;
  }

  public whenExists(cb: (v: T) => void) {
    if (!isNullOrUndefined(this.value)) {
      cb(this.value);
    }
  }
}

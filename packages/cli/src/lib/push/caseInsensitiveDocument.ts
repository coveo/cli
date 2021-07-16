export class CaseInsensitiveDocument<T> {
  public documentRecord: Record<string, T> = {};
  public constructor(doc: Record<string, T>) {
    Object.entries(doc).forEach(([k, v]) => {
      this.documentRecord[k.toLowerCase()] = v;
    });
  }
}

export declare abstract class ItemType<
  ArgsType,
  RawDataType,
  ReturnDataType extends BaseReturnDataType,
  _ManifestData extends BaseManifestData
> {
  protected abstract getData(...args: any[]): Promise<RawDataType[]>;
  protected abstract process(raw: RawDataType): Promise<ReturnDataType[]>;
  public abstract call(args: ArgsType): Promise<ReturnDataType[]>;
}
export interface BaseReturnDataType {
  ClickableUri: string;
  Uri: string;
  Title?: string;
}

export interface BaseManifestData {
  ItemType: string;
  Path: string;
}

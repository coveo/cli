export declare abstract class ItemType<ArgsType, RawDataType, ReturnDataType> {
  protected abstract getData(): Promise<RawDataType>;
  protected abstract process(raw: RawDataType): Promise<ReturnDataType>;
  public abstract call(raw: ArgsType): Promise<ReturnDataType>;
}

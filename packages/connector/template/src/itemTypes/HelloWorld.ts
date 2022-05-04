import {ItemType} from '@coveo/connector-sdk';

export interface Args {}
export interface RawData {}
export interface ReturnedData {}

export default class HelloWorld
  implements ItemType<Args, RawData, ReturnedData>
{
  protected getData(): Promise<RawData> {
    throw new Error('Method not implemented.');
  }
  protected process(raw: RawData): Promise<ReturnedData> {
    throw new Error('Method not implemented.');
  }
  public call(args: Args): Promise<ReturnedData> {
    throw new Error('Method not implemented.');
  }
  public static call(args: Args): Promise<ReturnedData> {
    return new HelloWorld().call(args);
  }
}

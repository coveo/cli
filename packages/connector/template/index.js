module.exports.ItemTypeClass = (name) =>
  `
import {ItemType} from '@coveo/connector-sdk';

export interface Args {}
export interface RawData {}
export interface ReturnedData {}

export default class ${name}
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
    return new ${name}().call(args);
  }
}
`;

module.exports.RouteFile = (name) =>
  `
import {Handler} from '@netlify/functions';
import ${name}, {Args} from '../../dataTypes/${name}';

const getArgs: (
  event: Parameters<Handler>[0],
  context: Parameters<Handler>[1]
) => Args = (event, context) => {
  return event.queryStringParameters;
};

export const handler: Handler = async (event, context) => {
  const data = await ${name}.call(getArgs(event, context));
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
`;

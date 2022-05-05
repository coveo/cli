module.exports.ItemTypeClass = (name) =>
  `
import {
  ItemType,
  BaseReturnDataType,
  BaseManifestData,
} from "baguette-connector-sdk";

export interface Args {}
export interface RawData {}
export interface ReturnedData extends BaseReturnDataType {}

export interface ManifestData extends BaseManifestData {
  ItemType: \`\${typeof ${name}.ItemType}\`;
  Path: \`/.netlify/functions/\${Lowercase<typeof ${name}.ItemType>}\`;
}

export default class ${name} extends ItemType<
  Args,
  RawData,
  ReturnedData,
  ManifestData
> {
  private static readonly ItemType: string = "${name}"
  protected getData(): Promise<RawData[]> {
    throw new Error('Method not implemented.');
  }
  protected process(raw: RawData[]): Promise<ReturnedData[]> {
    throw new Error('Method not implemented.');
  }
  public call(args: Args): Promise<ReturnedData[]> {
    throw new Error('Method not implemented.');
  }
  public static call(args: Args): Promise<ReturnedData[]> {
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
  return event.queryStringParameters as unknown as Args;
};

export const handler: Handler = async (event, context) => {
  const data = await ${name}.call(getArgs(event, context));
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
`;

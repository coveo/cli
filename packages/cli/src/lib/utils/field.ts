import PlatformClient, {FieldModel} from '@coveord/platform-client';

// Ther is already a similar method in the push-api-client that we could leverage instead
export const listAllFieldsFromOrg = async (
  client: PlatformClient,
  page = 0,
  fields: FieldModel[] = []
): Promise<FieldModel[]> => {
  const list = await client.field.list({
    page,
    perPage: 1000,
  });

  fields.push(...list.items);

  if (page < list.totalPages - 1) {
    return listAllFieldsFromOrg(client, page + 1, fields);
  }

  return fields;
};

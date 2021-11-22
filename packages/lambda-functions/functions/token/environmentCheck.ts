export function environmentCheck() {
  return !(
    process.env.ORGANIZATION_ID === undefined ||
    process.env.API_KEY === undefined ||
    process.env.USER_EMAIL === undefined
  );
}

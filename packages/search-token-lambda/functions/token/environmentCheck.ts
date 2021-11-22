export function environmentCheck() {
  return Boolean(
    process.env.ORGANIZATION_ID && process.env.API_KEY && process.env.USER_EMAIL
  );
}

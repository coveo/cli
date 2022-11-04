import PlatformClient from '@coveo/platform-client';

(async () => {
  const client = new PlatformClient({
    environment: process.env.PLATFORM_ENV,
    organizationId: process.env.ORG_ID,
    accessToken: process.env.PLATFORM_API_KEY,
  });
  await client.organization.resume();
})();

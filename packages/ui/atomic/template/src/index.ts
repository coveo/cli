import {waitForAtomic} from './utils/atomic';

async function main() {
  await waitForAtomic();
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;

  const platformUrl = process.env.PLATFORM_URL!;
  const organizationId = process.env.ORGANIZATION_ID!;
  const accessToken = process.env.API_KEY!;
  await searchInterface.initialize({
    accessToken,
    organizationId,
    platformUrl,
  });

  searchInterface.executeFirstSearch();
}

main();

async function renewAccessToken() {
  const tokenServerPort = process.env.ATOMIC_APP_SERVER_PORT;
  const url = `${window.location.protocol}//${window.location.hostname}:${tokenServerPort}/token`;
  const response = await fetch(url);
  const {token} = await response.json();
  return token;
}

async function main() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.querySelector('#search');

  const platformUrl = process.env.ATOMIC_APP_PLATFORM_URL;
  const organizationId = process.env.ATOMIC_APP_ORGANIZATION_ID;
  await searchInterface.initialize({
    accessToken: await renewAccessToken(),
    renewAccessToken,
    organizationId,
    platformUrl,
  });

  searchInterface.executeFirstSearch();
}

main();

export async function waitForAtomic() {
  return customElements.whenDefined('atomic-search-interface');
}

function getEndpointToLocalServer() {
  return `./token`;
}

export default function getTokenEndpoint() {
  return (
    import.meta.env.VITE_COVEO_TOKEN_ENDPOINT || getEndpointToLocalServer()
  );
}

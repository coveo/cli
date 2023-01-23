import "fetch-undici-polyfill";

import { generateToken } from "./searchTokenGenerator.js";
import type { ViteDevServer } from "vite";
import isEnvValid from "../commons/isEnvValid.js";

export default (config: Record<string, string>) => {
  if (!isEnvValid(config)) {
    console.error(
      'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.'
    );
    return { name: "coveo-invalid" };
  }
  return {
    name: "coveo-search-token",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/token", generateToken(config));
    },
  };
};

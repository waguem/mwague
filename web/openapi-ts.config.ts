import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./lib/client",
  },
  client: "axios",
  input: process.env.OPENAPI_INPUT || "./openapi.yaml",
});

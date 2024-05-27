import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./lib/client",
  },
  client: "axios",
  input: "http://localhost:8080/api/v1/openapi.json",
});

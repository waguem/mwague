import { defineConfig } from "@hey-api/openapi-ts";

console.log("process.env.OPENAPI_INPUT", process.env.OPENAPI_INPUT);
export default defineConfig({
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./lib/client",
  },
  client: "axios",
  input: process.env.OPENAPI_INPUT || "./openapi.yaml",
});

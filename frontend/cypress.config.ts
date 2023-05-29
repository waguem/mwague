import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      console.log("Hello");
    },
    baseUrl: "http://localhost:3000",
  },
  env: {
    MAILDEV_PROTOCOL: "http",
    MAILDEV_HOST: "localhost",
    MAILDEV_SMTP_PORT: "1025",
    MAILDEV_API_PORT: "1080",
  },
});

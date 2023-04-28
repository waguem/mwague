import type common from "public/locales/en/common.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof common;
    };
  }
}

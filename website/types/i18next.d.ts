import type common from "@/app/public/locales/en/common.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof common;
    };
  }
}

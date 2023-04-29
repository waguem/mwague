import type common from "@/app/public/locales/en/common.json";
import type indesx from "@/app/public/locales/en/index.json";
declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof common;
      index: typeof index;
    };
  }
}

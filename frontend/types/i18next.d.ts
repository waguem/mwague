import type index from "@/app/i18n/locales/en/index.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      index: typeof index;
    };
  }
}

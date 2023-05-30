import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { getOptions } from "./settings";

const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
    .init(getOptions(lng, ns));
  return i18nInstance;
};

export async function useTranslation(lng: string, ns: any = undefined, options: any = {}) {
  const i18nInstance = await initI18next(lng, ns);
  const n = Array.isArray(ns) ? ns[0] : ns;
  const keyPrefix = options.keyPrefix;
  return {
    //@ts-ignore
    t: i18nInstance.getFixedT(lng, n, keyPrefix),
    i18n: i18nInstance,
  };
}

export const fallbackLng = "en";
export const languages = [fallbackLng, "fr"];
export const defaultNS = "index";
export function getOptions(lng: string = fallbackLng, ns = defaultNS) {
  return {
    debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

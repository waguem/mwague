export const fallbackLng = "en";
export const languages = [fallbackLng, "fr"];
export const defaultNS = "index";
export function getOptions(lng: string = fallbackLng, ns = defaultNS) {
  return {
    // debug: process.env.NODE_ENV === "development" ,
    debug: false,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

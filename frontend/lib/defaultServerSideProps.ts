import { languages } from "@/app/i18n/settings";
export async function getDefaultServerSideProps() {
  return languages.map((lng) => ({ lng }));
}

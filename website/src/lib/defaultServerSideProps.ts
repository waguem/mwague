import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getDefaultServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale)),
  },
});

export const getServerSideProps = getDefaultServerSideProps;

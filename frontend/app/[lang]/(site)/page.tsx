"use client";
import Header from "@/ui/Header";
import { Hero } from "@/ui/Hero";
import { useTranslation } from "@/app/i18n";
type PageProps = {
  params: {
    lang: string;
  };
};
export default async function HomePage(props: PageProps) {
  const { t } = await useTranslation(props.params.lang, "index");
  return (
    <>
      <Header />
      <main>
        <div>
          <h1>{t("Welcome")}</h1>
        </div>
        <Hero />
      </main>
    </>
  );
}

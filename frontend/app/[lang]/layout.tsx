import "@/styles/global.css";
import "focus-visible";
import { dir } from "i18next";
import { Inter } from "next/font/google";
export { getDefaultServerSideProps as generateStaticParams } from "@/lib/defaultServerSideProps";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Minkadi App",
  description: "Minkadi App",
};

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html className="h-full bg-gray-50 antialiased" lang={lang} dir={dir(lang)}>
      <head />
      <body className="flex h-full flex-col">{children}</body>
    </html>
  );
}

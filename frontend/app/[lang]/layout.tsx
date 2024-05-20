import "@/styles/global.css";
import "focus-visible";
import { dir } from "i18next";
import { Providers } from "./Providers";
import SessionGuard from "@/components/SessionGuard";

export const metadata = {
  title: "Minkadi App",
  description: "Minkadi App",
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html className="h-full bg-gray-50 antialiased" lang={lang} dir={dir(lang)}>
      <head />
      <body className="flex h-full flex-col">
        <Providers>
          <SessionGuard>{children}</SessionGuard>
        </Providers>
      </body>
    </html>
  );
}

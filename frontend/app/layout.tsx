import "@/styles/global.css";
import "focus-visible";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Minkadi App",
  description: "Minkadi App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full bg-gray-50 antialiased" lang="en">
      <body className="flex h-full flex-col">{children}</body>
    </html>
  );
}

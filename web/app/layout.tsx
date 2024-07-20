import ProviderComponent from "@/components/layouts/provider-component";
import { Nunito } from "next/font/google";
// import { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import "@mantine/notifications/styles.css";
import "@mantine/core/styles.layer.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import "react-perfect-scrollbar/dist/css/styles.css";

import "../styles/tailwind.css";

// export const metadata = {
//   title: {
//     template: "%s | MWAGUE",
//     default: "Mwague Trading",
//   },
// };

const nunito = Nunito({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={nunito.variable}>
        <MantineProvider defaultColorScheme="auto">
          <ProviderComponent>{children}</ProviderComponent>
        </MantineProvider>
      </body>
    </html>
  );
}

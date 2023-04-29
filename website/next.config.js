const { i18n } = require("./next-i18next.config");
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  i18n,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // async redirects(){
  //   if(process.env.MAINTENANCE_MODE!=="true"∏){
  //     return [];
  //   }
  //   return [
  //     {
  //       source: "/",
  //       destination:"/maintenance",
  //       permanent:false
  //     }
  //   ]
  // }
};
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});
module.exports = withBundleAnalyzer(nextConfig);
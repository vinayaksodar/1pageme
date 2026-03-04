import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/print/route": ["node_modules/@sparticuz/chromium/bin/**"],
    "/api/print": ["node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;

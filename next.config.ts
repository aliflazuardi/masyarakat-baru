import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: no server, deployable to Vercel, GitHub Pages or any CDN.
  output: "export",
  // Emit /route/index.html so plain static hosts resolve URLs without rewrites.
  trailingSlash: true,
  // The default image optimizer needs a server; static export serves images as-is.
  images: { unoptimized: true },
};

export default nextConfig;

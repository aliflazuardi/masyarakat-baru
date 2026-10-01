import type { NextConfig } from "next";

// Sub-path the site is served from, e.g. "/masyarakat-baru" on GitHub Pages
// (https://<user>.github.io/masyarakat-baru/). Empty for root-domain hosts like Vercel.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML export: no server, deployable to GitHub Pages, Vercel or any CDN.
  output: "export",
  basePath,
  // Emit /route/index.html so plain static hosts resolve URLs without rewrites.
  trailingSlash: true,
  // The default image optimizer needs a server; static export serves images as-is.
  images: { unoptimized: true },
};

export default nextConfig;

import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static HTML export: the site is a single prerendered marketing page, and
  // plain static files are the most reliable thing to serve through the Cloud
  // Agent port-forwarding proxy (no RSC streaming, no `Vary: rsc` handling,
  // no long `s-maxage` cache headers from the Next server).
  output: "export",
  // This subproject lives inside a larger monorepo; pin the tracing root to
  // this directory so Next.js does not pick up the parent lockfile.
  outputFileTracingRoot: path.join(__dirname),
  // Dev mode only: allow /_next/* asset and HMR requests when the dev server
  // is accessed through a forwarding proxy (e.g. Cloud Agent port forwarding)
  // instead of localhost. Production `next start` has no such restriction.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.cursor.sh",
    "*.cursor.com",
    "*.cursorapp.com",
  ],
  images: {
    // Required with `output: "export"`: there is no image optimization server,
    // so <Image> renders plain <img> tags pointing at the /public originals.
    unoptimized: true,
  },
};

export default nextConfig;

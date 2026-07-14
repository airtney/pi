import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This subproject lives inside a larger monorepo; pin the tracing root to
  // this directory so Next.js does not pick up the parent lockfile.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Local assets only; avatars/fonts were mirrored from the cursor.com CDN
    // into /public during reconstruction, so no remote patterns are needed.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

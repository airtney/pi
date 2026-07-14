import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ptht05hbb1ssoooe.public.blob.vercel-storage.com",
			},
			{
				protocol: "https",
				hostname: "cursor.com",
			},
		],
	},
};

export default nextConfig;

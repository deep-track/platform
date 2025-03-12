import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "images.unsplash.com",
				protocol: "https",
			},
		],
	},
};

export default nextConfig;

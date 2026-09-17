const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	async headers() {
		return [
			{
				source: "/fonts/:path*",
				headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
			},
		];
	},
	reactStrictMode: false,
	webpack: (config, {}) => {
		config.plugins.push(
			new CopyPlugin({
				patterns: [
					{
						from: path.join(__dirname, "node_modules/tinymce"),
						to: path.join(__dirname, "public/libs/tinymce"),
					},
					{
						from: path.join(__dirname, "src/lib/tinymce/plugins"),
						to: path.join(__dirname, "public/libs/tinymce/plugins"),
					},
				],
			}),
		);

		return config;
	},
};

module.exports = nextConfig;

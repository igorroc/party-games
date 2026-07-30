/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [{ protocol: "https", hostname: "api.dicebear.com", pathname: "/10.x/**" }],
	},
}

export default nextConfig

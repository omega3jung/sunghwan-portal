/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  transpilePackages: ["lucide-react"],

  experimental: {
    outputFileTracingIncludes: {
      "/documents": ["./docs/**/*.md", "./docs/**/README.md", "./README.md"],
    },
  },
};

export default nextConfig;

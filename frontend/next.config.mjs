/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",          // Frontend calls /api/...
        destination: "http://127.0.0.1:5000/:path*", // Redirect to Flask backend
      },
    ];
  },
};

export default nextConfig;

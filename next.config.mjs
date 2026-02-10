
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3001',
                pathname: '/uploads/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: 'http://localhost:3001/uploads/:path*', // Proxy to Admin App
            },
        ];
    },
};

export default nextConfig;

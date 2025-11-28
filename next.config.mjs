const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: `${process.env.AUTH_SERVICE_URL}/:path*`,
            },
        ];
    }
};

export default nextConfig;
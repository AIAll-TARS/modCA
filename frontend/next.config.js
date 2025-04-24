/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost', 'janis7ewski.org'],
        minimumCacheTTL: 60,
    },
    async rewrites() {
        return process.env.NODE_ENV === 'development'
            ? [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:8000/api/:path*', // Backend API URL
                },
                {
                    source: '/ws/:path*',
                    destination: 'http://localhost:8000/ws/:path*', // WebSocket URL
                },
            ]
            : []; // In production, we use vercel.json rewrites
    },
    // Production optimizations
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Enable static optimization where possible
    experimental: {
        optimizeCss: true,
    },
    optimizeFonts: true, // Enable font optimization for production
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        // Add production-specific optimizations
        if (process.env.NODE_ENV === 'production') {
            config.optimization = {
                ...config.optimization,
                minimize: true,
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000,
                    maxSize: 244000,
                    minChunks: 1,
                    maxAsyncRequests: 30,
                    maxInitialRequests: 30,
                    cacheGroups: {
                        defaultVendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            reuseExistingChunk: true,
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true,
                        },
                    },
                },
            };
        }
        return config;
    },
    // Add security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig; 
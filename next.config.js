/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        // Fixes npm packages that depend on `fs` module
        if (!isServer) {
            config.resolve.fallback.fs = false;
            config.resolve.fallback.path = false;
            config.resolve.fallback.crypto = false;
        }
        return config;
    },
};

module.exports = nextConfig;

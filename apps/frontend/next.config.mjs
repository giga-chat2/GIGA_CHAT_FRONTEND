/** @type {import('next').NextConfig} */
const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 86400;
const nextConfig = {
    reactStrictMode: true,
    onDemandEntries: {
        maxInactiveAge: SECONDS_PER_DAY * MS_PER_SECOND,
        pagesBufferLength: 100,
      },
};

export default nextConfig;

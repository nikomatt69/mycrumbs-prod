const { withExpo } = require('@expo/next-adapter');
const withPlugins = require('next-compose-plugins');
const withMillion = require('./million.js');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',

});
const allowedBots =
  '.*(bot|telegram|baidu|bing|yandex|iframely|whatsapp|facebook|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|facebookbot|googlebot|bot).*';

/** @type {import('next').NextConfig} */

const nextConfig = withBundleAnalyzer({
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,

  transpilePackages: ['data', 'react-native-reanimated', 'react-native', 'expo'],
  experimental: {
    scrollRestoration: true,
  
  },
  async rewrites() {
    return [
      {
        source: '/sitemaps/:match*',
        destination: 'https://mycrumbs.xyz/api/sitemap/:match*',
      },
      {
        source: '/u/:match*',
        destination: `https://og.mycrumbs.xyz/u/:match*`,
        has: [{ type: 'header', key: 'user-agent', value: allowedBots }],
      },
      {
        source: '/posts/:match*',
        destination: `https://og.mycrumbs.xyz/posts/:match*`,
        has: [{ type: 'header', key: 'user-agent', value: allowedBots }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/discord',
        destination: 'https://discord.com/invite/B8eKhSSUwX',
        permanent: true,
      },
      {
        source: '/donate',
        destination: 'https://giveth.io/project/hey?utm_source=hey',
        permanent: true,
      },
      {
        source: '/gitcoin',
        destination:
          'https://explorer.gitcoin.co/#/round/10/0x8de918f0163b2021839a8d84954dd7e8e151326d/0x8de918f0163b2021839a8d84954dd7e8e151326d-2',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin' },
        ],
      },
    ];
  },
});

module.exports = withPlugins(
  [
    [withExpo],

  ],
  nextConfig
);
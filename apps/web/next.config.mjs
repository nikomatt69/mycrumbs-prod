

import { withExpo } from '@expo/next-adapter';
import  MillionLint  from "@million/lint";
import  million  from "million/compiler";




const allowedBots =
  '.*(bot|telegram|baidu|bing|yandex|iframely|whatsapp|facebook|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|facebookbot|googlebot|bot).*';

/** @type {import('next').NextConfig} */
const nextConfig = withExpo( {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  
  reactStrictMode: true,
  transpilePackages: [
    'data',
    'react-native-reanimated',
    'react-native',
    'expo'
  ],
  experimental: {
    scrollRestoration: true,
  
  },
  async rewrites() {
    return [
      {
        source: '/sitemaps/:match*',
        destination: 'https://mycrumbs.xyz/api/sitemap/:match*'
      },
      {
        destination: `https://og.mycrumbs.xyz/u/:match*`,
        has: [{ key: 'user-agent', type: 'header', value: allowedBots }],
        source: '/u/:match*'
      },
      {
        destination: `https://og.mycrumbs.xyz/posts/:match*`,
        has: [{ key: 'user-agent', type: 'header', value: allowedBots }],
        source: '/posts/:match*'
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/discord',
        destination: 'https://discord.com/invite/B8eKhSSUwX',
        permanent: true
      },
      {
        source: '/donate',
        destination: 'https://giveth.io/project/hey?utm_source=hey',
        permanent: true
      },
      {
        source: '/gitcoin',
        destination:
          'https://explorer.gitcoin.co/#/round/10/0x8de918f0163b2021839a8d84954dd7e8e151326d/0x8de918f0163b2021839a8d84954dd7e8e151326d-2',
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin' },
        ],
        source: '/(.*)'
      }
    ];
  }
  
});

const millionConfig = {
  auto: true,
};

export default million.next(MillionLint.next({ rsc: true })(nextConfig), millionConfig);
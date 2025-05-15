import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USERNAME: process.env.NEO4J_USERNAME,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  },
  experimental: {
    allowedDevOrigins: ['localhost', '192.168.1.248', '172.20.10.10', 'local-origin.dev', 'd5ab-82-77-154-148.ngrok-free.app/relevance-analyze', 'd5ab-82-77-154-148.ngrok-free.app'],
  },
};

export default nextConfig;

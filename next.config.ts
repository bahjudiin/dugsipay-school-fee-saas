import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config - let Next.js use defaults
  // Turbopack will be used if available, otherwise webpack falls back
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
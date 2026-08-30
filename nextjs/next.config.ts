import type { NextConfig } from "next";

/**
 * Домены, с которых next/image может грузить картинки.
 *
 * ProductListResource / SliderResource / CategoryResource возвращают
 * абсолютные URL через asset() — т.е. с домена Laravel.
 *
 * Локально: http://127.0.0.1:8000
 * Прод:     https://etis.kz
 */
const remoteHosts: { protocol: "http" | "https"; hostname: string; port?: string }[] = [
  { protocol: "http", hostname: "127.0.0.1", port: "8000" },
  { protocol: "http", hostname: "localhost", port: "8000" },
  { protocol: "https", hostname: "etis.kz" },
  { protocol: "https", hostname: "www.etis.kz" },
  { protocol: "https", hostname: "api.etis.kz" },
];
const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteHosts.map((h) => ({
      protocol: h.protocol,
      hostname: h.hostname,
      port: h.port ?? "",
      pathname: "/assets/images/**",
    })),
  },

  // Оптимизации сборки
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;

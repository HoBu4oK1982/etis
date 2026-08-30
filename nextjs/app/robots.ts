import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/sitemap-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
        ],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap.txt`],
    host: SITE_URL,
  };
}

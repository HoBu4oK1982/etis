import { buildSiteMapEntries } from "@/lib/seo/sitemap-data";

export const revalidate = 3600;

export async function GET() {
  const entries = await buildSiteMapEntries();
  const body = `${entries.map((entry) => entry.url).join("\n")}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

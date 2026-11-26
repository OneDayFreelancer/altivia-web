import type { APIRoute } from 'astro';
import { getSpaces, spaceHref } from '@/data/spaces';

/** Solo páginas públicas e indexables. */
export const GET: APIRoute = async ({ site }) => {
  const paths = [
    '/',
    '/alquilar/',
    '/publicar/',
    ...(await getSpaces()).map((s) => `${spaceHref(s)}/`),
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};

# SEO Strategy & Documentation

Hire Car heavily relies on technical SEO to drive organic marketplace liquidity. The architecture specifically caters to Google Discoverability rules for marketplaces.

## Route Strategy
- `/locations/[city]`: Programmatic SEO (PSEO) hubs targeting high-volume generic keywords (e.g., "Car Hire Sydney").
- `/cars/[slug]`: Specific long-tail landing pages for exact makes and models.
- `/vendors/[slug]`: Authority pages for the rental companies.

## Metadata Strategy
Every public page dynamically generates metadata using Next.js `generateMetadata`.
Titles map to standard transactional formats: `[Vehicle Name] – Car Hire in [City] | Hire Car`.

## Sitemap Strategy
The application dynamically builds a chunked XML sitemap at `src/app/sitemap.ts`.
- It utilizes `generateSitemaps()` to split the catalog into 1,000 URLs per file to prevent Vercel execution timeouts and ensure Google parses the entire 20k+ vehicle catalog safely.
- **Root URL**: `https://www.hirecar.com.au/sitemap.xml`

## Robots.txt
Protected paths (`/admin`, `/customer`, `/vendor`, `/api`) are blocked via `robots.txt` to preserve Crawl Budget for actual listings.

## Structured Data (JSON-LD)
Rich snippets are injected natively into the HTML:
- **`Product` & `Offer`**: Found on vehicle detail pages to show pricing and availability directly in Google Search results.
- **`BreadcrumbList`**: Found on `/locations/[city]` to assist Google in understanding the geographic taxonomy of the site.

## Caching (ISR)
The SEO pages leverage Incremental Static Regeneration (`export const revalidate = 3600`). This ensures Time to First Byte (TTFB) is exceptionally fast (CDN edge delivery) while refreshing stale database data hourly.

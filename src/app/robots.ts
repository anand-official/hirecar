import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/vendor/dashboard",
          "/vendor/leads",
          "/vendor/onboarding",
          "/vendor/upgrade",
          "/auth/",
          "/api/",
          "/messages/",
        ],
      },
    ],
    sitemap: "https://www.hirecar.com.au/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/transactional areas, and thin/duplicate search &
      // order-lookup result pages, out of the index.
      disallow: [
        "/admin",
        "/checkout",
        "/cart",
        "/login",
        "/signup",
        "/account",
        "/track-order?*",
        "/shop?*query=*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

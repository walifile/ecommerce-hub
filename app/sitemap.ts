import type { MetadataRoute } from "next";
import { getCatalogData } from "@/lib/ecommerce-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { products, categories } = await getCatalogData();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/track-order`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms-and-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Category-filtered shop views — meaningful, crawlable landing pages.
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => category.productCount > 0)
    .map((category) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => product.status === "published")
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}

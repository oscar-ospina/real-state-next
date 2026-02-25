import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const allProperties = await db.query.properties.findMany({
    where: eq(properties.isAvailable, true),
    columns: { id: true, updatedAt: true },
  });

  const propertyEntries: MetadataRoute.Sitemap = allProperties.map(
    (property) => ({
      url: `${baseUrl}/property/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyEntries,
  ];
}

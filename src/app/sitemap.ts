import type { MetadataRoute } from "next";
import { getCatalog, getClients } from "@/lib/clients/catalog";
import { SURFACES } from "@/lib/clients/schema";

const BASE_URL = "https://clients.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getCatalog().generatedAt);

  return [
    { url: BASE_URL, lastModified, priority: 1 },
    ...SURFACES.map((surface) => ({
      url: `${BASE_URL}/${surface}`,
      lastModified,
      priority: 0.8,
    })),
    ...getClients().map((client) => ({
      url: `${BASE_URL}/clients/${client.id}`,
      lastModified,
      priority: 0.7,
    })),
  ];
}

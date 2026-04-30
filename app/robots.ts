import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/panier/", "/commander/"],
    },
    sitemap: "https://www.tsara-rural.fr/sitemap.xml",
  }
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/product",
          "/product/*",
          "/providers",
          "/providers/*",
          "/blog",
          "/blog/*",
          "/docs",
          "/docs/*",
        ],
        disallow: [
          "/dashboard/*",
          "/api/*",
          "/login",
          "/register/*",
          "/*?*", // Disallow query parameters
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

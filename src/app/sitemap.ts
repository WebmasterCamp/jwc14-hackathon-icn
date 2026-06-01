import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          th: `${baseUrl}?lang=th`,
          en: `${baseUrl}?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/equipment?lang=th`,
          en: `${baseUrl}/equipment?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/providers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          th: `${baseUrl}/providers?lang=th`,
          en: `${baseUrl}/providers?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          th: `${baseUrl}/blog?lang=th`,
          en: `${baseUrl}/blog?lang=en`,
        },
      },
    },
  ];

  try {
    // Dynamic equipment pages
    const equipment = await prisma.equipment.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const equipmentPages: MetadataRoute.Sitemap = equipment.map((item) => ({
      url: `${baseUrl}/equipment/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          th: `${baseUrl}/equipment/${item.id}?lang=th`,
          en: `${baseUrl}/equipment/${item.id}?lang=en`,
        },
      },
    }));

    // Dynamic provider pages
    const providers = await prisma.provider.findMany({
      where: { verified: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const providerPages: MetadataRoute.Sitemap = providers.map((provider) => ({
      url: `${baseUrl}/providers/${provider.id}`,
      lastModified: provider.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          th: `${baseUrl}/providers/${provider.id}?lang=th`,
          en: `${baseUrl}/providers/${provider.id}?lang=en`,
        },
      },
    }));

    // Dynamic blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          th: `${baseUrl}/blog/${post.slug}?lang=th`,
          en: `${baseUrl}/blog/${post.slug}?lang=en`,
        },
      },
    }));

    // Blog category archives
    const blogCategories = await prisma.blogCategory.findMany({
      select: { slug: true, updatedAt: true },
    });

    const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map(
      (category) => ({
        url: `${baseUrl}/blog/category/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.5,
      })
    );

    return [
      ...staticPages,
      ...equipmentPages,
      ...providerPages,
      ...blogPages,
      ...blogCategoryPages,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages only if database query fails
    return staticPages;
  }
}

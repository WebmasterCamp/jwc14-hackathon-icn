import type { Metadata } from "next";

export interface SEOConfig {
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  noindex?: boolean;
}

const SITE_NAME = "Sparkgo";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Generate comprehensive SEO metadata for Next.js pages
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    titleTh,
    description,
    descriptionTh,
    keywords = [],
    image = DEFAULT_IMAGE,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    locale = "th",
    noindex = false,
  } = config;

  const currentLocale = locale === "th" ? "th_TH" : "en_US";
  const displayTitle = locale === "th" && titleTh ? titleTh : title;
  const displayDescription = locale === "th" && descriptionTh ? descriptionTh : description;
  const fullTitle = `${displayTitle} | ${SITE_NAME}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  const metadata: Metadata = {
    title: displayTitle,
    description: displayDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description: displayDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: currentLocale,
      type: type as any,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: displayTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: displayDescription,
      images: [image],
    },
  };

  // Add article-specific metadata
  if (type === "article" && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
    };
  }

  // Add robots directive
  if (noindex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  // Add alternates for canonical and hreflang
  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
      languages: {
        th: `${canonicalUrl}?lang=th`,
        en: `${canonicalUrl}?lang=en`,
      },
    };
  }

  return metadata;
}

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(path: string): string {
  // Remove trailing slash and query parameters
  const cleanPath = path.split("?")[0].replace(/\/$/, "");
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate breadcrumb list structured data
 */
export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip HTML tags, then common Markdown syntax so excerpts/meta descriptions
  // are clean prose (content may be authored in Markdown).
  const text = content
    .replace(/<[^>]*>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1") // inline/code fences
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/[*_~]/g, "") // emphasis / strikethrough markers
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  // Cut at word boundary
  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");

  return lastSpace > 0 ? `${trimmed.substring(0, lastSpace)}...` : `${trimmed}...`;
}

/**
 * Generate URL-safe slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Thai characters with transliteration (basic)
    .replace(/[ก-๙]/g, (char) => {
      // Simple Thai to Latin mapping (you can expand this)
      const thaiToLatin: Record<string, string> = {
        "ก": "k", "ข": "kh", "ค": "kh", "ง": "ng",
        "จ": "ch", "ฉ": "ch", "ช": "ch", "ซ": "s",
        "ด": "d", "ต": "t", "ถ": "th", "ท": "th",
        "น": "n", "บ": "b", "ป": "p", "ผ": "ph",
        "ฝ": "f", "พ": "ph", "ฟ": "f", "ภ": "ph",
        "ม": "m", "ย": "y", "ร": "r", "ล": "l",
        "ว": "w", "ศ": "s", "ษ": "s", "ส": "s",
        "ห": "h", "อ": "o", "ฮ": "h",
      };
      return thaiToLatin[char] || "";
    })
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate alt text for equipment images
 */
export function generateEquipmentImageAlt(equipmentName: string, index?: number): string {
  if (index !== undefined) {
    return `${equipmentName} - รูปที่ ${index + 1}`;
  }
  return equipmentName;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";
const SITE_NAME = "Sparkgo";

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Thai", "English"],
    },
    sameAs: [
      // Add social media links here when available
    ],
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/equipment?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Product structured data for a catalog product offered by one or
 * more shops. Emits an AggregateOffer (lowPrice/highPrice/offerCount) plus a
 * per-seller Offer for each shop.
 */
export function generateProductSchema(product: {
  slug: string;
  name: string;
  nameTh?: string;
  description?: string;
  descriptionTh?: string;
  images: string[];
  brand?: string;
  category: { name: string; nameTh: string };
  offers: Array<{
    price: number;
    sellerName: string;
    availableStock: number;
    condition: string;
  }>;
}) {
  const displayName = product.nameTh || product.name;
  const displayDescription =
    product.descriptionTh || product.description || displayName;

  const prices = product.offers.map((o) => o.price);
  const hasOffers = prices.length > 0;
  const anyInStock = product.offers.some((o) => o.availableStock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: displayDescription,
    image: product.images.map((img) => img),
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers: hasOffers
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "THB",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: product.offers.length,
          availability: anyInStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          offers: product.offers.map((o) => ({
            "@type": "Offer",
            price: o.price,
            priceCurrency: "THB",
            availability:
              o.availableStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: `https://schema.org/${
              o.condition === "NEW" ? "NewCondition" : "UsedCondition"
            }`,
            seller: { "@type": "Organization", name: o.sellerName },
          })),
        }
      : undefined,
    category: product.category.nameTh || product.category.name,
    url: `${SITE_URL}/products/${product.slug}`,
  };
}

/**
 * Generate ItemList structured data for equipment listings
 */
export function generateItemListSchema(
  items: Array<{
    slug: string;
    name: string;
    nameTh?: string;
    images: string[];
    fromPrice: number;
  }>,
  listName: string = "อุปกรณ์การศึกษา"
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.nameTh || item.name,
        image: item.images[0],
        url: `${SITE_URL}/products/${item.slug}`,
        offers: {
          "@type": "Offer",
          price: item.fromPrice,
          priceCurrency: "THB",
        },
      },
    })),
  };
}

/**
 * Generate LocalBusiness structured data for providers
 */
export function generateLocalBusinessSchema(provider: {
  id: string;
  companyName: string;
  description?: string;
  address?: string;
  province?: string;
  rating: number;
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.companyName,
    description: provider.description,
    image: provider.logo,
    address: provider.address ? {
      "@type": "PostalAddress",
      streetAddress: provider.address,
      addressRegion: provider.province,
      addressCountry: "TH",
    } : undefined,
    aggregateRating: provider.rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: provider.rating,
      bestRating: 5,
    } : undefined,
    url: `${SITE_URL}/providers/${provider.id}`,
  };
}

/**
 * Generate BlogPosting structured data
 */
export function generateBlogPostingSchema(post: {
  slug: string;
  title: string;
  titleTh?: string;
  excerpt?: string;
  excerptTh?: string;
  featuredImage?: string;
  publishedAt?: Date | null;
  updatedAt: Date;
  author: {
    name?: string;
    avatar?: string;
  };
  readingTime?: number;
}) {
  const displayTitle = post.titleTh || post.title;
  const displayExcerpt = post.excerptTh || post.excerpt || displayTitle;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: displayTitle,
    description: displayExcerpt,
    image: post.featuredImage || `${SITE_URL}/og-image.png`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || "Sparkgo Team",
      image: post.author.avatar,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
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

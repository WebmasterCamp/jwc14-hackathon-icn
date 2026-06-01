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
 * Generate Product structured data for equipment
 */
export function generateProductSchema(equipment: {
  id: string;
  name: string;
  nameTh?: string;
  description?: string;
  descriptionTh?: string;
  images: string[];
  rentPriceMonthly: number;
  leaseToOwnPrice?: number;
  condition: string;
  category: { name: string; nameTh: string };
  provider: { companyName: string; rating: number };
  availableStock: number;
}) {
  const displayName = equipment.nameTh || equipment.name;
  const displayDescription = equipment.descriptionTh || equipment.description || displayName;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: displayDescription,
    image: equipment.images.map((img) => img),
    brand: {
      "@type": "Brand",
      name: equipment.provider.companyName,
    },
    offers: {
      "@type": "Offer",
      price: equipment.rentPriceMonthly,
      priceCurrency: "THB",
      availability:
        equipment.availableStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: equipment.rentPriceMonthly,
        priceCurrency: "THB",
        unitText: "เดือน",
      },
      seller: {
        "@type": "Organization",
        name: equipment.provider.companyName,
      },
    },
    aggregateRating: equipment.provider.rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: equipment.provider.rating,
      bestRating: 5,
    } : undefined,
    category: equipment.category.nameTh || equipment.category.name,
    itemCondition: `https://schema.org/${equipment.condition === "NEW" ? "NewCondition" : "UsedCondition"}`,
    url: `${SITE_URL}/equipment/${equipment.id}`,
  };
}

/**
 * Generate ItemList structured data for equipment listings
 */
export function generateItemListSchema(
  items: Array<{
    id: string;
    name: string;
    nameTh?: string;
    images: string[];
    rentPriceMonthly: number;
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
        url: `${SITE_URL}/equipment/${item.id}`,
        offers: {
          "@type": "Offer",
          price: item.rentPriceMonthly,
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

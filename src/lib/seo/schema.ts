import { SEO_BASE_URL } from "./constants";

type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SEO_BASE_URL}${item.path}`,
    })),
  };
}

export function buildItemListSchema(vehicleSlugs: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: vehicleSlugs.map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SEO_BASE_URL}/cars/${slug}`,
    })),
  };
}

export function buildFaqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function buildCollectionPageSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: `${SEO_BASE_URL}${input.url}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Hire Car",
      url: SEO_BASE_URL,
    },
  };
}

export function buildProductSchema(input: {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  pricePerDayAud: number;
  vendorName: string;
  city?: string;
  state?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    image: input.imageUrl ?? "",
    description: input.description,
    sku: input.slug,
    offers: {
      "@type": "Offer",
      url: `${SEO_BASE_URL}/cars/${input.slug}`,
      priceCurrency: "AUD",
      price: input.pricePerDayAud,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: input.vendorName,
      },
    },
  };
}

export function serializeSchemas(schemas: object[]) {
  return JSON.stringify(schemas);
}

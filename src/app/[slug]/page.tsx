import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import {
    Store, Globe, Briefcase, ArrowLeft, Phone, Mail, MapPin,
    Clock, Star, ShoppingBag, Wrench, HelpCircle, Instagram,
    Facebook, MessageSquare, Search, ExternalLink, Wifi,
} from "lucide-react";

import Link from "next/link";

/* ─── types ─────────────────────────────────────── */

interface ProductItem { id: string; name: string; description?: string; image?: string; images?: string[]; price?: number; currency?: string; sku?: string; availability?: string; featured?: boolean; }
interface ServiceItem { id: string; name: string; description?: string; price?: number; currency?: string; areaServed?: string; }
interface ReviewItem { id: string; author: string; rating: number; body: string; datePublished?: string; }
interface FAQItem { id: string; question: string; answer: string; }

interface StoreDoc {
    name: string;
    slug: string;
    industry: string;
    businessType: string;
    status: string;
    title?: string;
    subtitle?: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    openingHours?: string;
    facilities?: string;
    about?: string;
    logoUrl?: string;
    coverPhotoUrl?: string;
    themeColor?: string;
    secondaryColor?: string;
    socialLinks?: { whatsapp?: string; instagram?: string; facebook?: string; google?: string };
    products?: ProductItem[];
    services?: ServiceItem[];
    reviews?: ReviewItem[];
    faq?: FAQItem[];
    createdAt: Date;
}

/* ─── schema.org JSON-LD builders ───────────────── */

function buildJsonLd(store: StoreDoc) {
    const baseUrl = `https://bized.app/${store.slug}`;
    const schemas: object[] = [];

    // 1. LocalBusiness
    const localBiz: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: store.name,
        url: baseUrl,
        ...(store.description && { description: store.description }),
        ...(store.logoUrl && { image: store.logoUrl }),
        ...(store.phone && { telephone: store.phone }),
        ...(store.email && { email: store.email }),
        ...(store.website && { sameAs: store.website }),
        ...(store.openingHours && { openingHours: store.openingHours }),
    };
    if (store.address || store.city || store.country) {
        localBiz.address = {
            "@type": "PostalAddress",
            ...(store.address && { streetAddress: store.address }),
            ...(store.city && { addressLocality: store.city }),
            ...(store.country && { addressCountry: store.country }),
        };
    }
    // Attach aggregate review if reviews exist
    if (store.reviews?.length) {
        const total = store.reviews.reduce((s, r) => s + r.rating, 0);
        localBiz.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: (total / store.reviews.length).toFixed(1),
            reviewCount: store.reviews.length,
            bestRating: 5,
        };
        localBiz.review = store.reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
            ...(r.datePublished && { datePublished: r.datePublished }),
        }));
    }
    schemas.push(localBiz);

    // 2. Products
    if (store.products?.length) {
        store.products.forEach((p) => {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name,
                ...(p.description && { description: p.description }),
                ...(p.image && { image: p.image }),
                ...(p.sku && { sku: p.sku }),
                offers: {
                    "@type": "Offer",
                    price: p.price || 0,
                    priceCurrency: p.currency || "KES",
                    availability: `https://schema.org/${p.availability || "InStock"}`,
                },
            });
        });
    }

    // 3. Services
    if (store.services?.length) {
        store.services.forEach((s) => {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "Service",
                name: s.name,
                ...(s.description && { description: s.description }),
                provider: { "@type": "LocalBusiness", name: store.name },
                ...(s.areaServed && { areaServed: s.areaServed }),
                ...(s.price && {
                    offers: { "@type": "Offer", price: s.price, priceCurrency: s.currency || "KES" },
                }),
            });
        });
    }

    // 4. FAQ
    if (store.faq?.length) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: store.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        });
    }

    return schemas;
}

/* ─── page ──────────────────────────────────────── */

import { StorefrontClient } from "./StorefrontClient";

export default async function StorefrontLandingPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const client = await clientPromise;
    const db = client.db();
    const store = (await db.collection("stores").findOne({ slug })) as StoreDoc | null;

    if (!store) notFound();

    const jsonLd = buildJsonLd(store);

    return (
        <>
            {/* JSON-LD for SEO */}
            {jsonLd.map((schema, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            ))}

            <StorefrontClient store={JSON.parse(JSON.stringify(store))} />
        </>
    );
}


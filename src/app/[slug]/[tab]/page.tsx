import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { StorefrontClient } from "../StorefrontClient";

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

export default async function StorefrontTabPage({
    params,
}: {
    params: Promise<{ slug: string; tab: string }>;
}) {
    const { slug, tab } = await params;

    // Validate allowed tabs - map common names to system IDs
    const allowedTabs = ["home", "shop", "services", "inbox"];
    if (!allowedTabs.includes(tab)) notFound();

    const client = await clientPromise;
    const db = client.db();
    const store = (await db.collection("stores").findOne({ slug })) as StoreDoc | null;

    if (!store) notFound();

    return <StorefrontClient store={JSON.parse(JSON.stringify(store))} initialTab={tab} />;
}

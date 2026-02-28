import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import Script from "next/script";

interface ProductItem {
    id: string;
    name: string;
    description?: string;
    image?: string;
    images?: string[];
    price?: number;
    currency?: string;
    sku?: string;
    gtin?: string;
    brand?: string;
    availability?: string;
    featured?: boolean;
    condition?: string;
    material?: string;
    color?: string;
    productSlug?: string;
    metaTitle?: string;
    metaDescription?: string;
    imageAltTexts?: string[];
}

interface StoreDoc {
    _id: any;
    name: string;
    slug: string;
    logoUrl?: string;
    products?: ProductItem[];
    themeColor?: string;
    [key: string]: any;
}

export default async function ProductStorefrontPage({
    params,
}: {
    params: Promise<{ slug: string; idOrSlug: string }>;
}) {
    const { slug, idOrSlug } = await params;

    const client = await clientPromise;
    const db = client.db();
    const store = (await db.collection("stores").findOne({ slug })) as StoreDoc | null;

    if (!store) notFound();

    const product = store.products?.find(
        (p) => p.id === idOrSlug || p.productSlug === idOrSlug
    );

    if (!product) notFound();

    // Prepare JSON-LD
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [product.image],
        "description": product.metaDescription || product.description,
        "brand": {
            "@type": "Brand",
            "name": product.brand || store.name
        },
        "sku": product.sku,
        "gtin13": product.gtin,
        "itemCondition": product.condition === "Used"
            ? "https://schema.org/UsedCondition"
            : product.condition === "Refurbished"
                ? "https://schema.org/RefurbishedCondition"
                : "https://schema.org/NewCondition",
        "offers": {
            "@type": "Offer",
            "url": `https://${store.slug}.bized.app/p/${product.productSlug || product.id}`,
            "priceCurrency": product.currency || "KES",
            "price": product.price,
            "availability": product.availability === "OutOfStock"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": store.name
            }
        },
        "color": product.color,
        "material": product.material
    };

    return (
        <>
            <Script
                id="product-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetail
                product={JSON.parse(JSON.stringify(product))}
                store={JSON.parse(JSON.stringify(store))}
                slug={slug}
            />
        </>
    );
}

// Optional: Generate Metadata for SEO titles
export async function generateMetadata({ params }: { params: Promise<{ slug: string; idOrSlug: string }> }) {
    const { slug, idOrSlug } = await params;
    const client = await clientPromise;
    const db = client.db();
    const store = (await db.collection("stores").findOne({ slug })) as StoreDoc | null;

    if (!store) return {};

    const product = store.products?.find(
        (p) => p.id === idOrSlug || p.productSlug === idOrSlug
    );

    if (!product) return { title: store.name };

    return {
        title: product.metaTitle || `${product.name} | ${store.name}`,
        description: product.metaDescription || product.description,
        openGraph: {
            title: product.metaTitle || product.name,
            description: product.metaDescription || product.description,
            images: product.image ? [product.image] : [],
        },
    };
}

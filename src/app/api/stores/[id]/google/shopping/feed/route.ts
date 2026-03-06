import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/stores/[id]/google/shopping/feed
 * 
 * Generates a Google Merchant Center compatible product feed in TSV format.
 * This URL can be added to Google Merchant Center as a scheduled fetch feed.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return new NextResponse("Invalid store ID", { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(id),
        });

        if (!store) {
            return new NextResponse("Store not found", { status: 404 });
        }

        const products = store.products || [];
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${store.slug}.bized.app`;

        // Define TSV header
        const headers = [
            "id",
            "title",
            "description",
            "link",
            "image_link",
            "availability",
            "price",
            "brand",
            "condition"
        ];

        // Format rows
        const rows = products.map((product: any) => {
            const price = `${(product.price || 0).toFixed(2)} ${store.currency || 'KES'}`;
            const link = `${baseUrl}/product/${product.id}`;
            const imageLink = product.image || (product.images && product.images[0]) || '';
            const availability = (product.isSoldOut || product.status === 'out of stock' || product.quantity === 0)
                ? "out of stock"
                : "in stock";

            return [
                product.sku || `${store.slug}-${product.id}`,
                product.name?.replace(/\t/g, ' ') || '',
                (product.description || product.name)?.replace(/\t/g, ' ').slice(0, 5000) || '',
                link,
                imageLink,
                availability,
                price,
                product.brand || store.name?.replace(/\t/g, ' ') || 'Bized Store',
                (product.condition?.toLowerCase()) || "new"
            ].join('\t');
        });

        const tsv = [headers.join('\t'), ...rows].join('\n');

        return new NextResponse(tsv, {
            headers: {
                "Content-Type": "text/tab-separated-values",
                "Content-Disposition": `attachment; filename="google_shopping_${store.slug}.tsv"`,
            },
        });

    } catch (error) {
        console.error("Error generating Google Shopping feed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

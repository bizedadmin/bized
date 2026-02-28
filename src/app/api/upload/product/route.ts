import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const slug = formData.get("slug") as string;

        if (!file || !slug) {
            return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
        }

        // Initialize Firebase Admin
        const app = initAdmin();
        const storage = getStorage(app);
        const bucket = storage.bucket();

        // Product images should be unique to avoid overwrites
        const uniqueId = Math.random().toString(36).substring(2, 9) + "-" + Date.now();
        const fileName = `products/${slug}/${uniqueId}.webp`;
        const fileRef = bucket.file(fileName);

        // Convert file to buffer for upload
        const buffer = Buffer.from(await file.arrayBuffer());

        await fileRef.save(buffer, {
            metadata: {
                contentType: "image/webp",
                cacheControl: "public, max-age=31536000, immutable", // Cache heavily
            },
            public: true,
        });

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("Product upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

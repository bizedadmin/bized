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

        // One logo per business: always save as optimized WebP
        const fileName = `logos/${slug}_logo.webp`;
        const fileRef = bucket.file(fileName);

        // Delete existing logos for this slug (to clean up old formats if any)
        const [existingFiles] = await bucket.getFiles({ prefix: `logos/${slug}_logo` });
        for (const f of existingFiles) {
            if (f.name !== fileName) {
                await f.delete();
            }
        }

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
        console.error("Logo upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

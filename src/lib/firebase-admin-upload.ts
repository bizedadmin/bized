import { adminStorage } from './firebase-admin';

/**
 * Uploads a buffer to Firebase Storage and returns the public download URL.
 * @param buffer The file buffer
 * @param path The path in storage (e.g., "businesses/slug/image.webp")
 * @returns Promise that resolves to the public download URL
 */
export async function uploadToFirebaseAdmin(buffer: Buffer, path: string): Promise<string> {
    const bucket = adminStorage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    const file = bucket.file(`bized/${path}`);

    await file.save(buffer, {
        metadata: {
            contentType: 'image/webp',
        },
    });

    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '01-01-2100', // Example: Expires in year 2100
    });

    return url;
}

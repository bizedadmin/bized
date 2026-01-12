import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file object (from input type="file")
 * @param path The path in storage (e.g., "users/123/avatar.png")
 * @returns Promise that resolves to the public download URL
 */
export async function uploadToFirebase(file: File, path: string): Promise<string> {
    if (!storage) throw new Error("Firebase Storage is not initialized");

    const storageRef = ref(storage, path);

    // 1. Upload the file
    await uploadBytes(storageRef, file);

    // 2. Get the public URL
    const url = await getDownloadURL(storageRef);

    return url;
}

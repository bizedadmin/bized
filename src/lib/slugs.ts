import User from "@/models/User";
import dbConnect from "./db";

/**
 * Generates a unique slug for a user based on their name.
 * @param name The user's name
 * @returns A unique slug string
 */
export async function generateUniqueUserSlug(name: string): Promise<string> {
    await dbConnect();

    // 1. Create base slug
    let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens

    if (!baseSlug) {
        baseSlug = 'user';
    }

    // 2. Check for collisions
    let slug = baseSlug;
    let counter = 1;
    let exists = true;

    while (exists) {
        const user = await User.findOne({ slug });
        if (!user) {
            exists = false;
        } else {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    return slug;
}

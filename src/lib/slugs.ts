import User from "@/models/User";
import Business from "@/models/Business";
import dbConnect from "./db";

/**
 * Generates a unique slug for a user or business based on their name.
 * It checks both User and Business collections to prevent collisions.
 * @param name The name to slugify
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

    // 2. Check for collisions in BOTH collections
    let slug = baseSlug;
    let counter = 1;
    let exists = true;

    while (exists) {
        const [user, business] = await Promise.all([
            User.findOne({ slug }),
            Business.findOne({ slug })
        ]);

        if (!user && !business) {
            exists = false;
        } else {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    return slug;
}

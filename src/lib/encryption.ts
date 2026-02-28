import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (64 hex chars)

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a string in the format: iv.authTag.encryptedContent
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
    }

    if (!text) return "";

    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}.${authTag.toString("hex")}.${encrypted}`;
}

/**
 * Decrypts a string encrypted with AES-256-GCM.
 * Supports legacy plain-text fallback if the format doesn't match.
 */
export function decrypt(cipherText: string): string {
    if (!ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
    }

    if (!cipherText) return "";

    const parts = cipherText.split(".");

    // Fallback for plain-text keys (legacy or unencrypted)
    if (parts.length !== 3) {
        return cipherText;
    }

    try {
        const [ivHex, authTagHex, encrypted] = parts;
        const key = Buffer.from(ENCRYPTION_KEY, "hex");
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        // If decryption fails, it might be a malformed key or wrong password
        // Return original if it looks like plain text, or empty if it was intended to be encrypted
        return cipherText;
    }
}

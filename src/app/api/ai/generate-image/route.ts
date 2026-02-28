import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, storeId } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        if (!storeId || !ObjectId.isValid(storeId)) {
            return NextResponse.json({ error: "Invalid Store ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });

        if (!store || !store.aiConfig) {
            return NextResponse.json(
                { error: "AI Configuration not found. Please configure your OpenAI key in Settings." },
                { status: 404 }
            );
        }

        const aiConfig = store.aiConfig;
        const provider = aiConfig.provider || "openai";
        let apiKey = provider === "google" ? aiConfig.googleApiKey : aiConfig.openaiApiKey;

        if (apiKey) {
            apiKey = decrypt(apiKey);
        }

        if (!apiKey || apiKey === "••••••••") {
            return NextResponse.json(
                { error: "Valid API Key not found. Please re-enter your key in Settings > AI Configuration." },
                { status: 400 }
            );
        }

        if (provider === "google") {
            // Google Gemini (Google AI Studio) doesn't natively support image generation (Imagen) via the simple REST API yet in the same way.
            return NextResponse.json(
                { error: "Image generation is currently only supported via OpenAI BYOK. Please switch provider or use OpenAI." },
                { status: 400 }
            );
        }

        // OpenAI DALL-E implementation
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "OpenAI Image Generation failed");
        }

        const data = await response.json();
        const base64Image = data.data[0].b64_json;

        return NextResponse.json({ result: `data:image/png;base64,${base64Image}` });

    } catch (error) {
        console.error("AI Image Generation Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to generate image" }, { status: 500 });
    }
}

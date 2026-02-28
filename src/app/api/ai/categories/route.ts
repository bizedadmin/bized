import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { industry, businessType, storeId } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

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
                { error: "AI Configuration not found for this store. Please configure your keys in Settings." },
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

        const promptParams = `Suggested product categories for a business in the "${industry || 'Retail'}" industry, specifically a "${businessType || 'Store'}".
        Provide a hierarchical list of standard product categories and subcategories.
        Return an array of category objects, each with "name" (string, e.g. "Electronics") and "subcategories" (array of strings, e.g. ["Smartphones", "Laptops"]).
        Format the response EXACTLY as a JSON object with a single "categories" array property: {"categories": [{"name": "Electronics", "subcategories": ["Phones", "Laptops"]}, {"name": "Clothing", "subcategories": ["Men", "Women"]}]}`;

        let result: { categories: any[] } = { categories: [] };

        if (provider === "google") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const response = await model.generateContent([promptParams]);
            const textResponse = response.response.text();

            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                result = JSON.parse(cleanedText);
            } catch {
                console.error("Failed to parse Gemini JSON:", cleanedText);
                throw new Error("Failed to parse AI response");
            }

        } else {
            // OpenAI implementation
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: promptParams
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "OpenAI request failed");
            }

            const data = await response.json();
            result = JSON.parse(data.choices[0].message.content);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("AI Category Analysis Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to analyze categories" }, { status: 500 });
    }
}

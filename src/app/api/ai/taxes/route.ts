import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { country, storeId } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

        if (!country) {
            return NextResponse.json({ error: "Country is required" }, { status: 400 });
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

        const promptParams = `Provide a list of the standard and reduced sales tax / VAT / GST rates applicable for businesses in ${country}. 
        Return an array of tax objects, each with exactly "name" (string, e.g. "Standard VAT") and "rate" (number, e.g. 16).
        Format the response EXACTLY as a JSON object with a single "taxes" array property: {"taxes": [{"name": "Standard VAT", "rate": 16}, ...]}`;

        let result: { taxes: any[] } = { taxes: [] };

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

        // Add UUIDs to each tax
        result.taxes = result.taxes.map((t: any) => ({
            ...t,
            id: crypto.randomUUID(),
            isDefault: false
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error("AI Tax Analysis Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to analyze taxes" }, { status: 500 });
    }
}

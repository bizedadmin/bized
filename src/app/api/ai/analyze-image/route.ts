import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { image, storeId } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
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

        let base64Data = "";
        let mimeType = "image/png";

        if (image.startsWith("http")) {
            // It's a URL, fetch it and convert to base64
            try {
                const imgRes = await fetch(image);
                if (!imgRes.ok) throw new Error("Failed to fetch image from URL");
                const buffer = await imgRes.arrayBuffer();
                base64Data = Buffer.from(buffer).toString("base64");
                mimeType = imgRes.headers.get("content-type") || "image/png";
            } catch (err) {
                console.error("Image Fetch Error:", err);
                throw new Error("Failed to process image from provided URL");
            }
        } else {
            base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
            if (image.includes("base64,")) {
                mimeType = image.split(":")[1]?.split(";")[0] || "image/png";
            }
        }

        const promptParams = `Analyze this image for an e-commerce storefront. Provide:
        1. A catchy product title (max 5 words)
        2. A compelling, sales-oriented description (2-3 sentences)
        3. A list of 5 SEO-friendly tags (comma separated)
        4. The brand name if visible
        5. A suggested price numeric value (in the business's currency)
        6. SEO Meta Title (Catchy, keyword-rich, max 60 chars)
        7. SEO Meta Description (Compelling, max 160 chars)
        8. Product Slug (URL-friendly version of the name, e.g., "cool-product-name")
        9. Condition (New, Used, or Refurbished)
        10. Material (Cotton, Leather, etc. if identifiable)
        11. Color (Primary color(s) visible)
        12. Image Alt Text (A descriptive alt text for this specific image)
        
        Format the response EXACTLY as a JSON object: {"title": "...", "description": "...", "tags": ["tag1", "tag2"], "brand": "...", "price": 0, "metaTitle": "...", "metaDescription": "...", "productSlug": "...", "condition": "...", "material": "...", "color": "...", "imageAltText": "..."}`;

        let result = {
            title: "",
            description: "",
            tags: [],
            brand: "",
            price: 0,
            metaTitle: "",
            metaDescription: "",
            productSlug: "",
            condition: "New",
            material: "",
            color: "",
            imageAltText: ""
        };

        if (provider === "google") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                },
            };

            const response = await model.generateContent([promptParams, imagePart]);
            const textResponse = response.response.text();

            // Clean up backticks in case Gemini returns markdown json format
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
                    model: "gpt-4o-mini", // Cost-effective model with vision capabilities
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: promptParams },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Data}`
                                    }
                                }
                            ]
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
        console.error("AI Image Analysis Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to analyze image" }, { status: 500 });
    }
}

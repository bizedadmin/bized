import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url, storeId } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
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

        // Fetch the URL content (Simplified WebMCP-like behavior)
        // In a full WebMCP setup, we would use an MCP server to browse.
        // For now, we fetch the HTML and pass it to AI for extraction.
        let htmlContent = "";
        try {
            const fetchRes = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            htmlContent = await fetchRes.text();
            // Truncate HTML to avoid token limits while keeping important bits (head, meta, structural body)
            htmlContent = htmlContent.substring(0, 15000);
        } catch (fetchErr) {
            console.error("Fetch Error:", fetchErr);
            return NextResponse.json({ error: "Failed to access the URL. The site might be blocking automated access." }, { status: 500 });
        }

        const promptParams = `Analyze this HTML content from the URL: ${url}
        Extract the following product details for an e-commerce platform:
        1. Product Name (title)
        2. Detailed description (sales-oriented)
        3. Price (numeric)
        4. Brand (if applicable)
        5. SKU (if visible)
        6. A list of image URLs (look for og:image, product gallery images, or primary <img> tags)
        7. SEO Meta Title (Catchy, keyword-rich, max 60 chars)
        8. SEO Meta Description (Compelling, max 160 chars)
        9. Product Slug (URL-friendly version of the name, e.g., "cool-product-name")
        10. Condition (New, Used, or Refurbished)
        11. Material (if applicable, e.g., Cotton, Leather, Plastic)
        12. Color (if applicable)
        13. Image Alt Texts (A list of descriptive alt texts for each image found)
        
        Format the response EXACTLY as a JSON object: 
        {"name": "...", "description": "...", "price": 0, "brand": "...", "sku": "...", "images": ["url1", "url2"], "metaTitle": "...", "metaDescription": "...", "productSlug": "...", "condition": "...", "material": "...", "color": "...", "imageAltTexts": ["alt1", "alt2"]}`;

        let result = {
            name: "",
            description: "",
            price: 0,
            brand: "",
            sku: "",
            images: [],
            metaTitle: "",
            metaDescription: "",
            productSlug: "",
            condition: "New",
            material: "",
            color: "",
            imageAltTexts: []
        };

        if (provider === "google") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const response = await model.generateContent([promptParams, htmlContent]);
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
                            content: `${promptParams}\n\nHTML CONTENT:\n${htmlContent}`
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
        console.error("AI URL Import Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to import from URL" }, { status: 500 });
    }
}

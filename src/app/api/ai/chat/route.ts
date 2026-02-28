import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, business, context } = await req.json();
        const { decrypt } = await import("@/lib/encryption");
        const clientPromise = (await import("@/lib/mongodb")).default;
        const { ObjectId } = await import("mongodb");

        if (!business?._id || !ObjectId.isValid(business._id)) {
            return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(business._id),
            ownerId: session.user.id
        });

        if (!store || !store.aiConfig) {
            return NextResponse.json({
                message: "Hello! To enable my capabilities, please configure your AI API Key in Settings > AI Configuration."
            });
        }

        const aiConfig = store.aiConfig;
        const provider = aiConfig.provider || "openai";
        let apiKey = provider === "google" ? aiConfig.googleApiKey : aiConfig.openaiApiKey;

        if (apiKey) {
            apiKey = decrypt(apiKey);
        }

        if (!apiKey || apiKey === "••••••••") {
            return NextResponse.json({
                message: provider === "google"
                    ? "Hello! To enable my Gemini-powered capabilities, please configure your Google AI API Key in Settings > AI Configuration."
                    : "Hello! To enable my full capabilities, please configure your OpenAI API Key in Settings > AI Configuration."
            });
        }

        // Prepare system prompt for "Sales AI Agent"
        const businessContext = `
            Business Name: ${business?.name}
            Industry: ${business?.industry}
            Description: ${business?.description}
            Address: ${business?.address}, ${business?.city}, ${business?.country}
            WhatsApp: ${business?.socialLinks?.whatsapp || 'Not set'}
            Current View Context: ${JSON.stringify(context || {})}
        `;

        const systemPrompt = `
            ${aiConfig.systemPrompt || "You are a proactive Sales AI Agent for Bized."}
            
            BUSINESS CONTEXT:
            ${businessContext}

            YOUR MISSION:
            1. Help the business owner GROW. Don't just answer questions; suggest improvements.
            2. OPTIMIZE FOR CHANNELS:
               - WHATSAPP: When generating promos, use emojis, keep it punchy, and include a clear CTA.
               - GOOGLE: When writing descriptions, focus on SEO keywords and clarity for search results.
            3. CONTEXT-AWARE ACTIONS:
               - If the user is editing a product or store info, look for ways to make it more "salesy".
               - If the user asks to change something, always include a "suggestedChanges" object in your JSON response.

            RESPONSE FORMAT:
            You must ALWAYS return a valid JSON object:
            {
              "message": "Your helpful response string here",
              "suggestedChanges": { "field1": "new value", "field2": "new value" }, // NULL if no changes
              "quickActions": ["Action 1", "Action 2"] // Optional: buttons for the user to click
            }
        `;

        if (provider === "google") {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am your Bized Sales AI Assistant. I will return all responses in the requested JSON format." }],
                    }
                ]
            });

            const result = await chat.sendMessage(messages[messages.length - 1].content);
            const responseText = result.response.text();
            const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanedText);
                return NextResponse.json(parsed);
            } catch (err) {
                console.error("Gemini Chat Parse Error:", cleanedText);
                return NextResponse.json({ message: cleanedText, suggestedChanges: null, quickActions: [] });
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
                        { role: "system", content: systemPrompt },
                        ...messages
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "OpenAI request failed");
            }

            const data = await response.json();
            const content = JSON.parse(data.choices[0].message.content);
            return NextResponse.json(content);
        }

    } catch (error) {
        console.error("AI Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

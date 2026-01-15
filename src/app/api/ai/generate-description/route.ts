import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Replicate from "replicate";
import { logApiError } from "@/lib/logger";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, slogan } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Service name is required" }, { status: 400 });
        }

        const prompt = `Generate a compelling, professional, and SEO-friendly service description for a service named "${name}"${slogan ? ` with the slogan "${slogan}"` : ""}. 
        
        Rules:
        1. Keep it between 60 and 150 words.
        2. Highlight the benefits of the service.
        3. Use a tone that is professional and inviting.
        4. Focus on value proposition.
        5. DO NOT include any introductory text like "Here is the description".
        6. Return ONLY the final description text.`;

        const output = await replicate.run(
            "meta/meta-llama-3-8b-instruct",
            {
                input: {
                    prompt,
                    max_new_tokens: 250,
                    temperature: 0.7,
                    system_prompt: "You are a professional marketing copywriter specializing in business services."
                }
            }
        );

        const description = Array.isArray(output) ? output.join("").trim() : String(output).trim();
        const cleanDescription = description.replace(/^["']|["']$/g, '');

        return NextResponse.json({ description: cleanDescription });

    } catch (error) {
        console.error("Error generating description:", error);
        await logApiError(req, error, 500, { requestBody: "DESCRIPTION_GENERATION_PAYLOAD" });

        return NextResponse.json(
            { message: "Failed to generate description" },
            { status: 500 }
        );
    }
}

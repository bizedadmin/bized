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

        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
        }

        // Use a fast LLM to refine the prompt
        // Using Llama 3 8B which is very fast and good for this
        const output = await replicate.run(
            "meta/meta-llama-3-8b-instruct",
            {
                input: {
                    prompt: `You are an expert AI image prompt engineer. 
Your task is to take a simple image description and expand it into a high-quality, detailed prompt for a professional image generator (like Flux or Midjourney).

Expand this prompt: "${prompt}"

Rules:
1. Make it descriptive and professional.
2. Include details about lighting, texture, and composition.
3. Maintain the original intent but make it visually stunning.
4. DO NOT include any introductory text or conversational filler.
5. Return ONLY the final expanded prompt text.
6. Keep the final result between 30 and 60 words.`,
                    max_new_tokens: 150,
                    temperature: 0.7,
                    system_prompt: "You are a helpful assistant that specializes in image prompt engineering."
                }
            }
        );

        // Replicate output for LLMs is usually an array of strings (tokens)
        const refinedPrompt = Array.isArray(output) ? output.join("").trim() : String(output).trim();

        // Clean up any potential quotes the model might add
        const cleanPrompt = refinedPrompt.replace(/^["']|["']$/g, '');

        return NextResponse.json({ refinedPrompt: cleanPrompt });

    } catch (error) {
        console.error("Error refining prompt:", error);
        await logApiError(req, error, 500, { requestBody: "PROMPT_REFINEMENT_PAYLOAD" });

        return NextResponse.json(
            { message: "Failed to refine prompt" },
            { status: 500 }
        );
    }
}

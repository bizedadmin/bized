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

        const {
            prompt,
            style,
            aspectRatio,
            numImages = 1,
            negativePrompt = "",
            overlay,
            image
        } = await req.json();

        if (!prompt) {
            return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
        }

        // Map our styles to Replicate prompt enhancers
        let enhancedPrompt = prompt;
        switch (style) {
            case "photorealistic":
                enhancedPrompt = `${prompt}, photorealistic, 4k, highly detailed, professional photography, soft lighting`;
                break;
            case "anime":
                enhancedPrompt = `${prompt}, anime style, studio ghibli, vibrant colors, clean lines`;
                break;
            case "digital-art":
                enhancedPrompt = `${prompt}, digital art, concept art, trending on artstation, masterpiece`;
                break;
            case "oil-painting":
                enhancedPrompt = `${prompt}, oil painting, textured, classic art style`;
                break;
            case "cinematic":
                enhancedPrompt = `${prompt}, cinematic shot, dramatic lighting, movie scene, 8k`;
                break;
            case "minimalist":
                enhancedPrompt = `${prompt}, minimalist, clean background, modern design, simple`;
                break;
        }

        // Add Text Overlay Instructions if present
        if (overlay) {
            const { title, titleSize, description, descriptionSize, align, position, bgColor, textColor } = overlay;

            let textOverlayPrompt = "";
            if (title) {
                const sizeMap = { S: "small", M: "medium", L: "large" };
                textOverlayPrompt += `The image MUST feature the text "${title}" in a clear, bold, high-quality font. The font size should be ${sizeMap[titleSize as keyof typeof sizeMap] || "large"}. `;
            }
            if (description) {
                const descSizeMap = { S: "tiny", M: "small", L: "medium" };
                textOverlayPrompt += `Include a secondary subtitle text: "${description}". The subtitle font size should be ${descSizeMap[descriptionSize as keyof typeof descSizeMap] || "small"}. `;
            }
            if (title || description) {
                textOverlayPrompt += `Position all text at the ${position} ${align} of the frame. `;
                textOverlayPrompt += `The text color MUST be ${textColor}. `;
                if (bgColor && bgColor !== 'transparent' && bgColor !== '#ffffff') {
                    textOverlayPrompt += `The background supporting the text should have a ${bgColor} theme. `;
                }
            }
            enhancedPrompt = `${enhancedPrompt}. ${textOverlayPrompt}`;
        }

        let model = numImages > 1 ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

        // Use asiryan/flux-schnell for supported img2img input
        if (image) {
            model = "asiryan/flux-schnell";
        }

        const input: any = {
            prompt: enhancedPrompt,
            aspect_ratio: aspectRatio,
            output_format: "webp",
            output_quality: 90,
            num_outputs: numImages,
            ...(image && {
                image,
                prompt_strength: 0.8, // Allow significant change but keep base structure
                num_inference_steps: 4
            })
        };

        const output = await replicate.run(model as any, { input }) as string[];

        // Replicate raw output can be an array of URLs or a single URL string
        const imageUrls = Array.isArray(output) ? output : [output];
        const sanitizedUrls = imageUrls.map(item => String(item));

        return NextResponse.json({ images: sanitizedUrls });

    } catch (error) {
        console.error("Error generating image:", error);

        // Log to Admin System
        await logApiError(req, error, 500, { requestBody: "IMAGE_GENERATION_PAYLOAD" });

        // Check if API token is missing
        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("REPLICATE_API_TOKEN is missing from environment variables");
        }

        const errorMessage = error instanceof Error ? error.message : "Failed to generate image";

        return NextResponse.json(
            { message: `Generation failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}

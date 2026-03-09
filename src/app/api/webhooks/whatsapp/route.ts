import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/meta";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.TEST;
const PHONE_NUMBER_ID = process.env.NUM_ID;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp message webhook
        if (body.object === "whatsapp_business_account") {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const customerPhone = message.from;
                const messageText = message.text?.body?.toLowerCase();

                console.log(`Received message from ${customerPhone}: ${messageText}`);

                // TRIGGER: If they send anything (or specific keyword), trigger the Discovery Flow
                // In a production app, you'd check for flow_token or specific interactive responses

                // For now, let's respond with the 'Step 1: Welcome Pitch' Template
                // which contains the button to open the Discovery Flow.

                await sendWhatsAppMessage(PHONE_NUMBER_ID!, ACCESS_TOKEN!, customerPhone, {
                    type: "template",
                    template: {
                        name: "discovery_welcome_pitch", // This must match your approved template name in Meta
                        language: { code: "en_US" },
                        components: [
                            {
                                type: "button",
                                sub_type: "flow",
                                index: "0",
                                parameters: [
                                    {
                                        type: "action",
                                        action: {
                                            flow_token: `token_${customerPhone}`,
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Not a WhatsApp event" }, { status: 400 });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

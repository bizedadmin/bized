import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createWhatsAppFlow, updateFlowAssets, publishFlow } from "@/lib/meta";
import fs from "fs";
import path from "path";

const ACCESS_TOKEN = process.env.TEST;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || !(session.user as any).isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action, phase } = await req.json();

        // 1. Submit Design & Layout Assets to Meta
        if (action === "submit_design") {
            const wabaId = process.env.WABA_ID || "2414789415617698";

            // Map the phase to the corresponding JSON asset file on the server
            const fileName = phase === 1 ? "discovery_flow.json" : "operational_flow.json";
            const flowName = phase === 1 ? "merchant_discovery_v2" : "operational_config_v2";
            const category = phase === 1 ? "MARKETING" : "UTILITY";

            const filePath = path.join(process.cwd(), "src/assets/flows", fileName);
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: `JSON Asset not found on server: ${fileName}` }, { status: 404 });
            }

            // Read the real JSON design from the server filesystem
            const jsonContent = fs.readFileSync(filePath, "utf-8");
            const blob = new Blob([jsonContent], { type: "application/json" });

            // Execution Step A: Create the unique Flow Entry at Meta
            const flow = await createWhatsAppFlow(wabaId, ACCESS_TOKEN!, flowName, [category]);
            if (flow.error) throw new Error(`Meta Flow Creation Error: ${flow.error.message}`);

            const flowId = flow.id;

            // Execution Step B: Upload the UI Layout design (the JSON file) to that Flow
            const assetResponse = await updateFlowAssets(flowId, ACCESS_TOKEN!, "FLOW_JSON", blob);
            if (assetResponse.error) throw new Error(`Meta Asset Upload Error: ${assetResponse.error.message}`);

            // Execution Step C: Publish the flow so it moves to 'Meta Review'/Live status
            // Note: Flows must be in 'DRAFT' to publish. 
            const publishResponse = await publishFlow(flowId, ACCESS_TOKEN!);

            return NextResponse.json({
                success: true,
                flowId,
                status: "PUBLISHED",
                metaResponse: publishResponse
            });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error: any) {
        console.error("Onboarding API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

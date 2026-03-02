import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

/**
 * VERIFY BANK ACCOUNT (Paystack Only for now)
 * Path: /api/payments/verify-bank
 */
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bankCode = searchParams.get("bankCode");
    const accountNo = searchParams.get("accountNumber");

    if (!bankCode || !accountNo) {
        return NextResponse.json({ error: "Missing bankCode or accountNumber" }, { status: 400 });
    }

    try {
        const platform = await getPlatformSettings();
        const secretKey = platform.platformPartnerKeys?.paystack?.secretKey;

        if (!secretKey) {
            return NextResponse.json({ error: "Paystack platform configuration missing" }, { status: 500 });
        }

        const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNo}&bank_code=${bankCode}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });

        const data = await response.json();
        if (!data.status) {
            return NextResponse.json({ error: data.message || "Failed to verify account" }, { status: 400 });
        }

        return NextResponse.json({
            status: true,
            account_name: data.data.account_name
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

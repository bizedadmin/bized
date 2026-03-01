import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * M-Pesa GCI (Safaricom) Gateway Adapter
 * Handles STK Push (Express) payments.
 */
export class MpesaAdapter {
    private consumerKey: string;
    private consumerSecret: string;
    private shortCode: string;
    private passkey: string;
    private env: "sandbox" | "production";

    constructor(config: PaymentMethodConfig) {
        const settings = config.settings || {};
        this.consumerKey = decrypt(config.apiKey || "");
        this.consumerSecret = decrypt(config.webhookSecret || "");
        this.shortCode = config.gatewayAccountId || "";
        this.passkey = settings.passkey || "";
        this.env = settings.mode === "production" ? "production" : "sandbox";
    }

    private getBaseUrl() {
        return this.env === "production"
            ? "https://api.safaricom.co.ke"
            : "https://sandbox.safaricom.co.ke";
    }

    /**
     * Generates an OAuth Access Token from Safaricom.
     */
    async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
        const response = await fetch(`${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: { Authorization: `Basic ${auth}` }
        });
        const data = await response.json();
        return data.access_token;
    }

    /**
     * Triggers an STK Push (Lipa na M-Pesa Express) to the customer's phone.
     */
    async initiateStkPush(params: {
        phoneNumber: string;
        amount: number;
        orderId: string;
        callbackUrl: string;
    }) {
        const token = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
        const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString("base64");

        // Format phone: 2547XXXXXXXX
        let phone = params.phoneNumber.replace(/\+/g, "");
        if (phone.startsWith("0")) phone = "254" + phone.slice(1);
        if (phone.startsWith("7")) phone = "254" + phone;

        const response = await fetch(`${this.getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BusinessShortCode: this.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(params.amount),
                PartyA: phone,
                PartyB: this.shortCode,
                PhoneNumber: phone,
                CallBackURL: params.callbackUrl,
                AccountReference: params.orderId,
                TransactionDesc: `Payment for Order ${params.orderId}`,
            }),
        });

        const data = await response.json();
        if (data.ResponseCode !== "0") {
            throw new Error(`M-Pesa Error: ${data.ResponseDescription}`);
        }

        return data; // Contains CheckoutRequestID
    }
}

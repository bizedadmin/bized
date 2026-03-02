import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * Paystack Gateway Adapter
 * Uses Paystack REST API for transactions (Nigeria, Ghana, Kenya, SA).
 */
export class PaystackAdapter {
    private secretKey: string;
    private subaccount?: string;
    private baseUrl = "https://api.paystack.co";

    constructor(config: PaymentMethodConfig, platformConfig?: { secretKey: string; feePercent: number }) {
        // Use Platform keys if connectedAccountId is present
        const isConnectMode = !!(config.connectedAccountId && platformConfig?.secretKey);
        const key = isConnectMode ? platformConfig.secretKey : (config.apiKey ? decrypt(config.apiKey) : "");

        if (!key) {
            throw new Error("Paystack Secret Key is not configured (Direct or Connect).");
        }

        this.secretKey = key;
        this.subaccount = config.connectedAccountId; // In Paystack we store subaccount code here
    }

    /**
     * Initializes a transaction with Paystack.
     * Generates an authorization URL for the customer to pay through.
     */
    async initializeTransaction(params: {
        orderId: string;
        amount: number;
        currency: string;
        email: string;
        callbackUrl: string;
    }) {
        const payload: any = {
            amount: Math.round(params.amount * 100), // Paystack also uses kobo/cents
            email: params.email,
            currency: params.currency.toUpperCase(),
            reference: params.orderId, // Order ID as Paystack reference
            callback_url: params.callbackUrl,
            metadata: {
                orderId: params.orderId,
            },
        };

        // If in partner mode/splitting
        if (this.subaccount) {
            payload.subaccount = this.subaccount;
            // platformFeePercent logic can be handled by Paystack's subaccount split configuration
            // Or we can pass 'flat_fee' or 'percentage_charge' here if dynamic.
        }

        const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!data.status) {
            throw new Error(`Paystack Initialization Error: ${data.message}`);
        }

        return {
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        };
    }

    /**
     * Verifies a transaction status on Paystack if needed (polling mode).
     */
    async verifyTransaction(reference: string) {
        const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
            },
        });

        const data = await response.json();
        return data.data;
    }

    /**
     * Verifies the HMAC-SHA512 signature from a Paystack webhook.
     */
    static verifyWebhookSignature(body: string, xPaystackSignature: string, secretKey: string) {
        const crypto = require("crypto");
        const hash = crypto
            .createHmac("sha512", secretKey)
            .update(body)
            .digest("hex");

        return hash === xPaystackSignature;
    }

    /**
     * Refunds a Paystack transaction.
     */
    async refundTransaction(reference: string, amount?: number) {
        const response = await fetch(`${this.baseUrl}/refund`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transaction: reference,
                amount: amount ? Math.round(amount * 100) : undefined,
            }),
        });

        return await response.json();
    }
}

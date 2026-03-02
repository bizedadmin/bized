import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * PayPal Gateway Adapter
 * Handles communication with PayPal API using store-specific credentials.
 */
export class PayPalAdapter {
    private clientId: string;
    private clientSecret: string;
    private environment: string;

    constructor(config: PaymentMethodConfig) {
        if (!config.settings?.clientId) {
            throw new Error("PayPal Client ID is not configured.");
        }
        if (!config.apiKey) {
            throw new Error("PayPal Secret (apiKey) is not configured.");
        }

        this.clientId = config.settings.clientId;
        this.clientSecret = decrypt(config.apiKey);
        this.environment = config.settings.environment || "sandbox";
    }

    private getBaseUrl() {
        return this.environment === "production"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";
    }

    private async getAccessToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        const res = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Failed to get PayPal access token");
        return data.access_token;
    }

    /**
     * Creates a PayPal Order.
     */
    async createOrder(params: {
        orderId: string;
        amount: number;
        currency: string;
        returnUrl: string;
        cancelUrl: string;
    }) {
        const token = await this.getAccessToken();
        const res = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: params.orderId,
                        amount: {
                            currency_code: params.currency.toUpperCase(),
                            value: params.amount.toFixed(2),
                        },
                    },
                ],
                application_context: {
                    return_url: params.returnUrl,
                    cancel_url: params.cancelUrl,
                },
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create PayPal order");

        const approveLink = data.links.find((l: any) => l.rel === "approve");
        return {
            id: data.id,
            url: approveLink?.href,
        };
    }

    /**
     * Captures a PayPal Order.
     */
    async captureOrder(paypalOrderId: string) {
        const token = await this.getAccessToken();
        const res = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to capture PayPal order");
        return data;
    }
}

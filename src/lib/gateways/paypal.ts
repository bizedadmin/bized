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
    private partnerAccountId?: string;
    private platformFeePercent?: number;

    constructor(config: PaymentMethodConfig, platformConfig?: { clientId: string; secretKey: string; feePercent: number }) {
        const isPartnerMode = !!(config.connectedAccountId && platformConfig?.secretKey);

        // In partner mode, we use Platform's master keys
        this.clientId = isPartnerMode ? platformConfig.clientId : (config.settings?.clientId || "");
        this.clientSecret = isPartnerMode ? platformConfig.secretKey : (config.apiKey ? decrypt(config.apiKey) : "");

        if (!this.clientId || !this.clientSecret) {
            throw new Error("PayPal Client ID or Secret is not configured.");
        }

        this.environment = config.settings?.environment || "sandbox";
        this.partnerAccountId = config.connectedAccountId; // The merchant's connected PayPal account ID
        this.platformFeePercent = platformConfig?.feePercent;
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

        const purchaseUnit: any = {
            reference_id: params.orderId,
            amount: {
                currency_code: params.currency.toUpperCase(),
                value: params.amount.toFixed(2),
            }
        };

        // If in Partner Mode, apply fee splitting
        if (this.partnerAccountId && this.platformFeePercent) {
            const feeAmount = (params.amount * (this.platformFeePercent / 100)).toFixed(2);
            purchaseUnit.payment_instruction = {
                disbursement_mode: "INSTANT",
                platform_fees: [
                    {
                        amount: {
                            currency_code: params.currency.toUpperCase(),
                            value: feeAmount
                        },
                        // In some flows, you might need to specify the partner/payee
                    }
                ]
            };

            // Re-route the main payment to the business's merchant account
            purchaseUnit.payee = {
                merchant_id: this.partnerAccountId
            };
        }

        const res = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [purchaseUnit],
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

    /**
     * Refunds a PayPal capture.
     */
    async refundCapture(captureId: string, amount?: number, currency?: string) {
        const token = await this.getAccessToken();
        const body: any = {};
        if (amount && currency) {
            body.amount = {
                value: amount.toFixed(2),
                currency_code: currency.toUpperCase(),
            };
        }

        const res = await fetch(`${this.getBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to refund PayPal payment");
        return data;
    }
}

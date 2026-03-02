import Stripe from "stripe";
import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * Stripe Gateway Adapter
 * Handles communication with Stripe API using store-specific credentials.
 */
export class StripeAdapter {
    private stripe: Stripe;
    private connectedAccountId?: string;
    private platformFeePercent?: number;

    constructor(config: PaymentMethodConfig, platformConfig?: { secretKey: string; feePercent: number }) {
        // If we have a connected account AND platform keys, we use the Platform's Master Secret Key
        // Otherwise we use the merchant's own API key (Direct mode)
        const isConnectMode = !!(config.connectedAccountId && platformConfig?.secretKey);
        const secretKey = isConnectMode
            ? platformConfig.secretKey
            : (config.apiKey ? decrypt(config.apiKey) : "");

        if (!secretKey) {
            throw new Error("Stripe Secret Key is not configured (Direct or Connect).");
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: "2025-01-27" as any,
        });

        this.connectedAccountId = config.connectedAccountId;
        this.platformFeePercent = platformConfig?.feePercent;
    }

    /**
     * Creates a Checkout Session for a one-time payment.
     * Maps the order ID to client_reference_id for webhook tracking.
     */
    async createCheckoutSession(params: {
        orderId: string;
        amount: number;
        currency: string;
        customerEmail?: string;
        successUrl: string;
        cancelUrl: string;
    }) {
        const unitAmount = Math.round(params.amount * 100);

        const sessionOptions: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: params.currency.toLowerCase(),
                        product_data: {
                            name: `Order #${params.orderId}`,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: params.customerEmail,
            client_reference_id: params.orderId,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: {
                orderId: params.orderId,
            },
        };

        // If in Connect Mode, add split logic (Destination Charge)
        if (this.connectedAccountId && this.platformFeePercent) {
            const feeAmount = Math.round(unitAmount * (this.platformFeePercent / 100));
            sessionOptions.payment_intent_data = {
                application_fee_amount: feeAmount,
                transfer_data: {
                    destination: this.connectedAccountId,
                },
            };
        }

        const session = await this.stripe.checkout.sessions.create(sessionOptions);

        return {
            id: session.id,
            url: session.url,
        };
    }

    /**
     * Verifies a webhook signature from Stripe.
     */
    verifyWebhook(body: string, sig: string, webhookSecret: string) {
        return this.stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }

    /**
     * Refunds a payment.
     */
    async refundPayment(paymentIntentId: string, amount?: number) {
        return await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
        });
    }
}

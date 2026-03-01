import Stripe from "stripe";
import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * Stripe Gateway Adapter
 * Handles communication with Stripe API using store-specific credentials.
 */
export class StripeAdapter {
    private stripe: Stripe;

    constructor(config: PaymentMethodConfig) {
        if (!config.apiKey) {
            throw new Error("Stripe Secret Key (apiKey) is not configured.");
        }

        const decryptedKey = decrypt(config.apiKey);

        this.stripe = new Stripe(decryptedKey, {
            apiVersion: "2025-01-27" as any,
        });
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
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: params.currency.toLowerCase(),
                        product_data: {
                            name: `Order #${params.orderId}`,
                        },
                        unit_amount: Math.round(params.amount * 100), // Stripe uses cents
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
        });

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
}

import { StripeAdapter } from "./stripe";
import { PaystackAdapter } from "./paystack";
import { MpesaAdapter } from "./mpesa";
import { DpoAdapter } from "./dpo";
import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";

/**
 * Payment Gateway Resolver
 * Centralizes the logic to resolve the correct adapter for a given store.
 */
export async function getGatewayAdapter(storeId: string, gatewayName: string, db: any) {
    const method = await db.collection("store_payment_methods").findOne({ storeId, gateway: gatewayName });
    if (!method) {
        throw new Error(`Gateway "${gatewayName}" is not configured for store ${storeId}.`);
    }

    const config = method as unknown as PaymentMethodConfig;

    switch (gatewayName.toLowerCase()) {
        case "stripe":
            return new StripeAdapter(config);
        case "paystack":
            return new PaystackAdapter(config);
        case "m-pesa":
        case "mpesa":
            return new MpesaAdapter(config);
        case "dpo":
            return new DpoAdapter(config);
        default:
            throw new Error(`Unsupported payment gateway: ${gatewayName}`);
    }
}

export { StripeAdapter, PaystackAdapter, MpesaAdapter, DpoAdapter };

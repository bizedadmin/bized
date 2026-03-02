import { StripeAdapter } from "./stripe";
import { PaystackAdapter } from "./paystack";
import { MpesaAdapter } from "./mpesa";
import { DpoAdapter } from "./dpo";
import { AdyenAdapter } from "./adyen";
import { PayPalAdapter } from "./paypal";
import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { getPlatformSettings } from "../platform-settings";

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
    const platform = await getPlatformSettings();
    const platformConfig = {
        secretKey: (platform.platformPartnerKeys as any)?.[gatewayName.toLowerCase()]?.secretKey || "",
        feePercent: platform.platformCommission || 0
    };

    switch (gatewayName.toLowerCase()) {
        case "stripe":
            return new StripeAdapter(config, platformConfig);
        case "paystack":
            return new PaystackAdapter(config, platformConfig);
        case "m-pesa":
        case "mpesa":
            return new MpesaAdapter(config);
        case "dpo":
            return new DpoAdapter(config);
        case "adyen":
            return new AdyenAdapter(config);
        case "paypal":
            return new PayPalAdapter(config);
        default:
            throw new Error(`Unsupported payment gateway: ${gatewayName}`);
    }
}

export { StripeAdapter, PaystackAdapter, MpesaAdapter, DpoAdapter, AdyenAdapter, PayPalAdapter };

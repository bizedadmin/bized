import { PaymentMethodConfig } from "@/app/api/stores/[id]/payment-methods/route";
import { decrypt } from "@/lib/encryption";

/**
 * DPO (Direct Pay Online) Group Gateway Adapter
 * Handles XML-based requests for multi-currency transactions in Africa.
 */
export class DpoAdapter {
    private companyToken: string;
    private serviceType: string;
    private env: "sandbox" | "production";

    constructor(config: PaymentMethodConfig) {
        this.companyToken = decrypt(config.apiKey || "");
        this.serviceType = config.settings?.serviceType || "4131"; // Default ServiceType
        this.env = config.settings?.mode === "production" ? "production" : "sandbox";
    }

    private getBaseUrl() {
        return this.env === "production"
            ? "https://secure.directpay.online/API/v6/"
            : "https://secure1.sandbox.directpay.online/API/v6/";
    }

    /**
     * Creates a payment token for a new transaction.
     */
    async createToken(params: {
        amount: number;
        currency: string;
        orderId: string;
        customerEmail: string;
        redirectUrl: string;
        backUrl: string;
    }) {
        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <API3G>
                <CompanyToken>${this.companyToken}</CompanyToken>
                <Request>createToken</Request>
                <Transaction>
                    <PaymentAmount>${params.amount}</PaymentAmount>
                    <PaymentCurrency>${params.currency.toUpperCase()}</PaymentCurrency>
                    <CompanyRef>${params.orderId}</CompanyRef>
                    <RedirectURL>${params.redirectUrl}</RedirectURL>
                    <BackURL>${params.backUrl}</BackURL>
                    <CompanyRefUnique>0</CompanyRefUnique>
                    <PTL>5</PTL>
                </Transaction>
                <Services>
                    <Service>
                        <ServiceType>${this.serviceType}</ServiceType>
                        <ServiceDescription>Payment for Order ${params.orderId}</ServiceDescription>
                        <ServiceDate>${new Date().toISOString().split('T')[0]}</ServiceDate>
                    </Service>
                </Services>
            </API3G>
        `;

        const response = await fetch(this.getBaseUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xml.trim(),
        });

        const dataStr = await response.text();

        // Simple XML parsing (can use cheerio if needed)
        const tokenMatch = dataStr.match(/<TransToken>(.*?)<\/TransToken>/);
        const resultMatch = dataStr.match(/<Result>(.*?)<\/Result>/);
        const explanationMatch = dataStr.match(/<ResultExplanation>(.*?)<\/ResultExplanation>/);

        if (resultMatch?.[1] !== "000") {
            throw new Error(`DPO Error: ${explanationMatch?.[1] || "Payment initialization failed."}`);
        }

        const token = tokenMatch?.[1];
        const redirectUrl = this.env === "production"
            ? `https://secure.directpay.online/payv2.php?ID=${token}`
            : `https://secure1.sandbox.directpay.online/payv2.php?ID=${token}`;

        return { token, redirectUrl };
    }

    /**
     * Verifies a transaction status on DPO.
     */
    async verifyToken(token: string) {
        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <API3G>
                <CompanyToken>${this.companyToken}</CompanyToken>
                <Request>verifyToken</Request>
                <TransactionToken>${token}</TransactionToken>
            </API3G>
        `;

        const response = await fetch(this.getBaseUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xml.trim(),
        });

        const dataStr = await response.text();
        const resultMatch = dataStr.match(/<Result>(.*?)<\/Result>/);

        return {
            status: resultMatch?.[1] === "000" ? "Success" : "Failed",
            xml: dataStr
        };
    }
}

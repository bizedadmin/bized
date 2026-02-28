/**
 * Order Type Definitions — schema.org/Order compliant
 * ─────────────────────────────────────────────────────
 * Full reference: https://schema.org/Order
 */

// ─── Enums (schema.org OrderStatus vocabulary) ────────────────────────────────
export type OrderStatus =
    | "OrderPaymentDue"
    | "OrderProcessing"
    | "OrderShipped"
    | "OrderPickupAvailable"
    | "OrderDelivered"
    | "OrderCancelled"
    | "OrderReturned"
    | "OrderProblem";

export type PaymentStatus =
    | "PaymentDue"
    | "PaymentComplete"
    | "PaymentDeclined"
    | "PaymentPastDue"
    | "PaymentRefunded"
    | "PaymentAutoPay";

export type FulfillmentStatus =
    | "Pending"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Delivered"
    | "Failed"
    | "Returned";

export type OrderChannel = "Online" | "POS" | "WhatsApp" | "Phone" | "Manual";
export type DeliveryMode = "Delivery" | "Pickup" | "Download" | "Service";

// ─── Sub-documents ─────────────────────────────────────────────────────────────

/** schema.org/PostalAddress */
export interface PostalAddress {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;   // city
    addressRegion?: string;     // state/county
    postalCode?: string;
    addressCountry?: string;    // ISO 3166-1 alpha-2
}

/** schema.org/Person (customer) */
export interface OrderCustomer {
    "@type": "Person" | "Organization";
    name: string;
    telephone?: string;
    email?: string;
    address?: PostalAddress;
}

/** schema.org/OrderItem */
export interface OrderItem {
    "@type": "OrderItem";
    productId?: string;          // ref to products collection
    name: string;
    sku?: string;
    image?: string;
    orderQuantity: number;
    unitPrice: number;
    lineTotal: number;           // orderQuantity * unitPrice - lineDiscount
    lineDiscount?: number;
    taxRate?: number;
    orderItemStatus: OrderStatus;
    // For bookable / appointment products
    requiresBooking?: boolean;
    bookingTime?: string;        // ISO datetime of the appointment/slot
    scheduledTime?: string;      // for calendar display
    deliveryMode?: DeliveryMode;
}

/** schema.org/ParcelDelivery (one shipment within an order) */
export interface Fulfillment {
    "@type": "ParcelDelivery";
    fulfillmentId?: string;      // internal ref
    trackingNumber?: string;
    carrier?: string;            // e.g. "DHL", "FedEx"
    trackingUrl?: string;
    deliveryStatus: FulfillmentStatus;
    deliveryMode: DeliveryMode;
    itemIndexes: number[];       // which orderedItem[] indexes are in this shipment
    expectedArrivalFrom?: string;
    expectedArrivalUntil?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
    createdAt: string;
}

/**
 * schema.org/Invoice (one payment installment)
 * An order may have multiple partial invoices (deposits, final payments, etc.)
 */
export interface OrderInvoice {
    "@type": "Invoice";
    invoiceId?: string;          // internal ref
    invoiceNumber: string;       // e.g. "INV-001"
    paymentStatus: PaymentStatus;
    totalPaymentDue: number;
    priceCurrency: string;
    paymentDueDate?: string;
    description?: string;
    lineItems?: { description: string; amount: number }[];
    sentAt?: string;
    createdAt: string;
}

/**
 * schema.org/Payment (one payment transaction)
 * An order may have multiple payments (partial, installments, refunds)
 */
export interface OrderPayment {
    "@type": "PayAction";        // schema.org/PayAction
    paymentId?: string;
    amount: number;
    priceCurrency: string;
    paymentMethod: string;       // "CreditCard", "Cash", "BankTransfer", "Crypto"
    paymentStatus: PaymentStatus;
    paymentGateway?: string;     // "Stripe", "Paystack", "PayPal", "Manual"
    paymentRef?: string;         // gateway transaction ID
    invoiceId?: string;          // which invoice this payment applies to
    refundOf?: string;           // paymentId of original payment if this is a refund
    processedAt?: string;
    notes?: string;
    createdAt: string;
    createdBy?: string;
}

// ─── Root Order Document ───────────────────────────────────────────────────────

/** schema.org/Order */
export interface Order {
    "@context": "https://schema.org";
    "@type": "Order";

    // Identifiers
    _id?: string;
    orderNumber: string;         // e.g. "ORD-20260228-0001"
    storeId: string;

    // Status
    orderStatus: OrderStatus;

    // Customer
    customer: OrderCustomer;

    // Items
    orderedItem: OrderItem[];

    // Financials (schema.org)
    price: number;               // subtotal before tax/discount
    priceCurrency: string;       // ISO 4217
    taxTotal?: number;
    discountTotal?: number;
    shippingCost?: number;
    totalPayable: number;        // final amount due

    // Payment summary
    amountPaid: number;          // sum of PaymentComplete payments
    amountDue: number;           // totalPayable - amountPaid
    paymentStatus: PaymentStatus;

    // Fulfillment
    deliveryAddress?: PostalAddress;
    deliveryMode: DeliveryMode;
    fulfillmentStatus: FulfillmentStatus;

    // References to sub-collections (kept separate for scalability)
    // payments[], invoices[], fulfillments[] are stored in sub-collections

    // Channel
    orderChannel: OrderChannel;

    // Seller
    seller: {
        "@type": "Organization";
        storeId: string;
        name: string;
    };

    // Metadata
    notes?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export enum IndustryVertical {
    AUTOMOTIVE = "AUTOMOTIVE",
    BEAUTY_COSMETICS = "BEAUTY_COSMETICS",
    CLOTHING_STORE = "CLOTHING_STORE",
    EDUCATION = "EDUCATION",
    EVENT_PLANNER = "EVENT_PLANNER",
    FINANCE = "FINANCE",
    FOOD_BEVERAGE = "FOOD_BEVERAGE",
    GROCERY_STORE = "GROCERY_STORE",
    HEALTH_MEDICAL = "HEALTH_MEDICAL",
    HOTEL_LODGING = "HOTEL_LODGING",
    NON_PROFIT = "NON_PROFIT",
    PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES",
    PUBLIC_SERVICES = "PUBLIC_SERVICES",
    REAL_ESTATE = "REAL_ESTATE",
    RELIGIOUS_ORG = "RELIGIOUS_ORG",
    RETAIL_SHOPPING = "RETAIL_SHOPPING",
    TRAVEL_TRANSPORTATION = "TRAVEL_TRANSPORTATION",
    OTHER = "OTHER"
}

export interface Industry {
    id: IndustryVertical;
    name: string;
    description: string;
    icon: string;
}

export const INDUSTRIES: Industry[] = [
    {
        id: IndustryVertical.AUTOMOTIVE,
        name: "Automotive",
        description: "Car dealers, repair, parts, and washing services.",
        icon: "🚗"
    },
    {
        id: IndustryVertical.BEAUTY_COSMETICS,
        name: "Beauty, Cosmetics & Personal Care",
        description: "Salons, spas, cosmetics, and personal care.",
        icon: "💅"
    },
    {
        id: IndustryVertical.CLOTHING_STORE,
        name: "Clothing Store",
        description: "Apparel, fashion, and accessories retail.",
        icon: "👕"
    },
    {
        id: IndustryVertical.EDUCATION,
        name: "Education",
        description: "Schools, universities, tutoring, and courses.",
        icon: "🎓"
    },
    {
        id: IndustryVertical.EVENT_PLANNER,
        name: "Event Planner",
        description: "Weddings, parties, and corporate event services.",
        icon: "🎊"
    },
    {
        id: IndustryVertical.FINANCE,
        name: "Finance",
        description: "Banks, insurance, and investment services.",
        icon: "💰"
    },
    {
        id: IndustryVertical.FOOD_BEVERAGE,
        name: "Food & Beverage",
        description: "Restaurants, cafes, bars, and catering.",
        icon: "🍱"
    },
    {
        id: IndustryVertical.GROCERY_STORE,
        name: "Grocery Store",
        description: "Supermarkets, convenience stores, and food markets.",
        icon: "🛒"
    },
    {
        id: IndustryVertical.HEALTH_MEDICAL,
        name: "Health & Medical",
        description: "Doctors, clinics, hospitals, and pharmacies.",
        icon: "🏥"
    },
    {
        id: IndustryVertical.HOTEL_LODGING,
        name: "Hotel & Lodging",
        description: "Hotels, motels, and vacation rentals.",
        icon: "🏨"
    },
    {
        id: IndustryVertical.NON_PROFIT,
        name: "Non-Profit Organization",
        description: "Charities, NGOs, and community organizations.",
        icon: "🤝"
    },
    {
        id: IndustryVertical.PROFESSIONAL_SERVICES,
        name: "Professional Services",
        description: "Consulting, legal, accounting, and IT.",
        icon: "💼"
    },
    {
        id: IndustryVertical.PUBLIC_SERVICES,
        name: "Public Services",
        description: "Government, utilities, and transportation.",
        icon: "🏛️"
    },
    {
        id: IndustryVertical.REAL_ESTATE,
        name: "Real Estate",
        description: "Property sales, rentals, and management.",
        icon: "🏠"
    },
    {
        id: IndustryVertical.RELIGIOUS_ORG,
        name: "Religious Organization",
        description: "Churches, temples, and religious communities.",
        icon: "🙏"
    },
    {
        id: IndustryVertical.RETAIL_SHOPPING,
        name: "Shopping & Retail",
        description: "General stores, e-commerce, and boutiques.",
        icon: "🛍️"
    },
    {
        id: IndustryVertical.TRAVEL_TRANSPORTATION,
        name: "Travel & Transportation",
        description: "Airlines, tour agencies, and logistics.",
        icon: "✈️"
    },
    {
        id: IndustryVertical.OTHER,
        name: "Other",
        description: "Misc or unlisted business types.",
        icon: "✨"
    }
];

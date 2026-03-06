import { IndustryVertical } from "./industries";
import {
    Package,
    Calendar,
    LayoutDashboard,
    ChefHat,
    Wrench,
    Activity,
    GraduationCap,
    Hotel,
    Handshake,
    Briefcase,
    Gem,
    Ticket,
    ShoppingBag,
    Users,
    Stethoscope,
    Store,
    Plane,
    Building2,
    Home,
    PartyPopper
} from "lucide-react";

export type BusinessModule =
    | "inventory"
    | "booking"
    | "dining_tables"
    | "kitchen_display"
    | "service_history"
    | "patient_records"
    | "course_management"
    | "room_management"
    | "donation_tracking"
    | "project_management"
    | "membership"
    | "ticketing"
    | "fleet_management"
    | "property_management";

export interface ModuleDefinition {
    id: BusinessModule;
    name: string;
    description: string;
    icon: any;
    locked?: boolean;
    color?: string;
}

export const MODULE_DEFINITIONS: Record<BusinessModule, ModuleDefinition> = {
    inventory: {
        id: "inventory",
        name: "Advanced Inventory",
        description: "Track stock across multiple locations and variants.",
        icon: Package
    },
    booking: {
        id: "booking",
        name: "Reservations & Booking",
        description: "Allow customers to book appointments or tables.",
        icon: Calendar
    },
    dining_tables: {
        id: "dining_tables",
        name: "Table Management",
        description: "Digital floor plan and table status tracking.",
        icon: LayoutDashboard
    },
    kitchen_display: {
        id: "kitchen_display",
        name: "Kitchen Display (KDS)",
        description: "Send orders directly to the kitchen staff.",
        icon: ChefHat
    },
    service_history: {
        id: "service_history",
        name: "Service Records",
        description: "Track maintenance and repair history for assets.",
        icon: Wrench
    },
    fleet_management: {
        id: "fleet_management",
        name: "Fleet & Asset Tracking",
        description: "Monitor vehicle health, mileage, and maintenance logs.",
        icon: ShoppingBag
    },
    patient_records: {
        id: "patient_records",
        name: "Patient Records",
        description: "Secure health records and consultation notes.",
        icon: Activity
    },
    course_management: {
        id: "course_management",
        name: "Course Management",
        description: "Manage classes, students, and attendance.",
        icon: GraduationCap
    },
    room_management: {
        id: "room_management",
        name: "Room & Lodging",
        description: "Manage room availability, cleaning, and keys.",
        icon: Hotel
    },
    donation_tracking: {
        id: "donation_tracking",
        name: "Donations & Pledges",
        description: "Track donor history and campaign progress.",
        icon: Handshake
    },
    project_management: {
        id: "project_management",
        name: "Project Tracking",
        description: "Billable hours and project milestones.",
        icon: Briefcase
    },
    property_management: {
        id: "property_management",
        name: "Property Management",
        description: "Manage listings, tenants, and lease agreements.",
        icon: Home
    },
    membership: {
        id: "membership",
        name: "Memberships & Loyalty",
        description: "Recurring benefits and loyalty points.",
        icon: Gem
    },
    ticketing: {
        id: "ticketing",
        name: "Event Ticketing",
        description: "Sell tickets and validate entry with QR codes.",
        icon: Ticket
    }
};

export const DEFAULT_INDUSTRY_MODULES: Record<IndustryVertical, BusinessModule[]> = {
    [IndustryVertical.RETAIL_SHOPPING]: ["inventory"],
    [IndustryVertical.FOOD_BEVERAGE]: ["dining_tables", "kitchen_display", "booking"],
    [IndustryVertical.AUTOMOTIVE]: ["service_history", "fleet_management", "booking"],
    [IndustryVertical.BEAUTY_COSMETICS]: ["booking", "membership"],
    [IndustryVertical.CLOTHING_STORE]: ["inventory", "membership"],
    [IndustryVertical.EDUCATION]: ["course_management", "booking"],
    [IndustryVertical.EVENT_PLANNER]: ["ticketing", "project_management"],
    [IndustryVertical.FINANCE]: ["project_management"],
    [IndustryVertical.GROCERY_STORE]: ["inventory", "membership"],
    [IndustryVertical.HEALTH_MEDICAL]: ["patient_records", "booking"],
    [IndustryVertical.HOTEL_LODGING]: ["room_management", "booking"],
    [IndustryVertical.NON_PROFIT]: ["donation_tracking"],
    [IndustryVertical.PROFESSIONAL_SERVICES]: ["project_management", "booking"],
    [IndustryVertical.PUBLIC_SERVICES]: ["project_management"],
    [IndustryVertical.REAL_ESTATE]: ["property_management", "booking"],
    [IndustryVertical.RELIGIOUS_ORG]: ["donation_tracking"],
    [IndustryVertical.TRAVEL_TRANSPORTATION]: ["booking"],
    [IndustryVertical.OTHER]: ["inventory"]
};

export function getModulesForIndustry(industry: IndustryVertical): BusinessModule[] {
    return DEFAULT_INDUSTRY_MODULES[industry] || [];
}

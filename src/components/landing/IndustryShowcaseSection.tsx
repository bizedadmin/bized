"use client";

import { motion } from "framer-motion";
import {
    Utensils, Sparkles, Stethoscope, ShoppingBag,
    Wrench, Car, Briefcase, GraduationCap,
    Dumbbell, Home, Truck, BedDouble, Scissors,
    ChevronRight, Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

const googleCategories = [
    {
        industry: "Food & Drink",
        primaryCategory: "Restaurant",
        secondaryCategories: ["Pizza Restaurant", "Cafe", "Bakery", "Bar", "Fast Food"],
        icon: <Utensils className="w-5 h-5" />,
        color: "text-orange-600 bg-orange-50",
    },
    {
        industry: "Beauty & Spas",
        primaryCategory: "Beauty Salon",
        secondaryCategories: ["Hair Salon", "Nail Salon", "Barber Shop", "Day Spa", "Makeup Artist"],
        icon: <Scissors className="w-5 h-5" />,
        color: "text-pink-600 bg-pink-50",
    },
    {
        industry: "Health & Medical",
        primaryCategory: "Medical Center",
        secondaryCategories: ["Dentist", "Physiotherapist", "Chiropractor", "Pharmacy", "Clinic"],
        icon: <Stethoscope className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50",
    },
    {
        industry: "Shopping",
        primaryCategory: "Retail Store",
        secondaryCategories: ["Clothing Store", "Electronics", "Convenience Store", "Florist", "Furniture"],
        icon: <ShoppingBag className="w-5 h-5" />,
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        industry: "Home Services",
        primaryCategory: "Contractor",
        secondaryCategories: ["Plumber", "Electrician", "HVAC", "Locksmith", "Landscaper"],
        icon: <Home className="w-5 h-5" />,
        color: "text-cyan-600 bg-cyan-50",
    },
    {
        industry: "Automotive",
        primaryCategory: "Auto Service",
        secondaryCategories: ["Car Dealer", "Auto Repair", "Car Wash", "Towing", "Tire Shop"],
        icon: <Car className="w-5 h-5" />,
        color: "text-red-600 bg-red-50",
    },
    {
        industry: "Professional",
        primaryCategory: "Professional Services",
        secondaryCategories: ["Lawyer", "Accountant", "Consultant", "Insurance Agency", "Notary"],
        icon: <Briefcase className="w-5 h-5" />,
        color: "text-slate-600 bg-slate-50",
    },
    {
        industry: "Education",
        primaryCategory: "Education Center",
        secondaryCategories: ["Tutor", "Language School", "Music School", "Driving School", "Preschool"],
        icon: <GraduationCap className="w-5 h-5" />,
        color: "text-yellow-600 bg-yellow-50",
    },
    {
        industry: "Fitness",
        primaryCategory: "Gym",
        secondaryCategories: ["Personal Trainer", "Yoga Studio", "Pilates", "Martial Arts", "Crossfit"],
        icon: <Dumbbell className="w-5 h-5" />,
        color: "text-lime-600 bg-lime-50",
    },
    {
        industry: "Events",
        primaryCategory: "Event Services",
        secondaryCategories: ["Photographer", "Wedding Planner", "DJ", "Caterer", "Florist"],
        icon: <Sparkles className="w-5 h-5" />,
        color: "text-purple-600 bg-purple-50",
    },
    {
        industry: "Transport",
        primaryCategory: "Transportation",
        secondaryCategories: ["Taxi Service", "Moving Company", "Courier", "Logistics", "Limo Service"],
        icon: <Truck className="w-5 h-5" />,
        color: "text-indigo-600 bg-indigo-50",
    },
    {
        industry: "Lodging",
        primaryCategory: "Lodging",
        secondaryCategories: ["Hotel", "Motel", "Hostel", "Guest House", "Vacation Rental"],
        icon: <BedDouble className="w-5 h-5" />,
        color: "text-teal-600 bg-teal-50",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { ease: [0.2, 0, 0, 1] as const, duration: 0.5 }
    },
};

export function IndustryShowcaseSection() {
    return (
        <section className="py-24 px-4 bg-[var(--color-surface)] relative overflow-hidden">
            <div className="container max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-[var(--color-on-surface)]"
                    >
                        Built for growing businesses
                    </motion.h2>
                    <p className="text-lg text-[var(--color-on-surface)]/70 max-w-2xl mx-auto">
                        Powers every industry, from local favorites to global brands.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
                >
                    {googleCategories.map((category, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="break-inside-avoid relative pl-2 group"
                        >
                            {/* Industry Header (Root) */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm",
                                    category.color
                                )}>
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-on-surface)] tracking-tight">
                                    {category.industry}
                                </h3>
                            </div>

                            {/* Tree Structure */}
                            <div className="ml-5 pl-6 border-l-2 border-[var(--color-outline-variant)]/30 relative pb-2">
                                {/* Branch 1: Primary Category */}
                                <div className="relative mb-3">
                                    {/* Horizontal Connector */}
                                    <div className="absolute -left-6 top-3 w-4 h-[2px] bg-[var(--color-outline-variant)]/30 rounded-full" />

                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/40" />
                                        <h4 className="font-semibold text-[var(--color-on-surface)]">
                                            {category.primaryCategory}
                                        </h4>
                                    </div>
                                </div>

                                {/* Branch 2: Sub Categories */}
                                <ul className="space-y-2 mt-2 ml-4">
                                    {category.secondaryCategories.map((sec, i) => (
                                        <li key={i} className="flex items-center gap-3 relative">
                                            {/* Sub-branch connector */}
                                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-[var(--color-outline-variant)]/30" />
                                            <div className="w-1 h-1 rounded-full bg-[var(--color-on-surface)]/20" />
                                            <span className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors cursor-default">
                                                {sec}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

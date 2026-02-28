"use client";

import { motion } from "framer-motion";
import {
    Utensils, Sparkles, Stethoscope, ShoppingBag,
    Wrench, Car, Briefcase, GraduationCap,
    Dumbbell, Home, Truck, BedDouble, Scissors,
    Gamepad2, Gift, LifeBuoy, LineChart, Newspaper,
    Bus, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const industryCategories = [
    { name: "Food & Drink", icon: <Utensils className="w-10 h-10" />, color: "bg-orange-100/60 text-orange-900" },
    { name: "Beauty & wellness", icon: <Scissors className="w-10 h-10" />, color: "bg-pink-100/60 text-pink-900" },
    { name: "Health & Medical", icon: <Stethoscope className="w-10 h-10" />, color: "bg-blue-100/60 text-blue-900" },
    { name: "Retail & Shopping", icon: <ShoppingBag className="w-10 h-10" />, color: "bg-emerald-100/60 text-emerald-900" },
    { name: "Home Services", icon: <Home className="w-10 h-10" />, color: "bg-cyan-100/60 text-cyan-900" },
    { name: "Automotive", icon: <Car className="w-10 h-10" />, color: "bg-red-100/60 text-red-900" },
    { name: "Professional", icon: <Briefcase className="w-10 h-10" />, color: "bg-slate-100/60 text-slate-900" },
    { name: "Education", icon: <GraduationCap className="w-10 h-10" />, color: "bg-yellow-100/60 text-yellow-900" },
    { name: "Fitness & Gym", icon: <Dumbbell className="w-10 h-10" />, color: "bg-lime-100/60 text-lime-900" },
    { name: "Events & Weddings", icon: <Sparkles className="w-10 h-10" />, color: "bg-purple-100/60 text-purple-900" },
    { name: "Transport & Travel", icon: <Bus className="w-10 h-10" />, color: "bg-green-100/60 text-green-900" },
    { name: "Hotels & Lodging", icon: <BedDouble className="w-10 h-10" />, color: "bg-teal-100/60 text-teal-900" },
    { name: "Repair & Maint.", icon: <Wrench className="w-10 h-10" />, color: "bg-amber-100/60 text-amber-900" },
    { name: "Logistics", icon: <Truck className="w-10 h-10" />, color: "bg-indigo-100/60 text-indigo-900" },
    { name: "Digital Goods", icon: <Gamepad2 className="w-10 h-10" />, color: "bg-violet-100/60 text-violet-900" },
    { name: "Gifts & Flowers", icon: <Gift className="w-10 h-10" />, color: "bg-rose-100/60 text-rose-900" },
    { name: "Consulting", icon: <LifeBuoy className="w-10 h-10" />, color: "bg-sky-100/60 text-sky-900" },
];

export function MagazineIndustryShowcase() {
    return (
        <section className="py-24 px-4 bg-white">
            <div className="container max-w-7xl mx-auto">
                <div className="mb-12 space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        Built for growing businesses
                    </h2>
                    <p className="text-gray-500 font-medium">
                        Over 17+ industries powered by Bized native commerce.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {industryCategories.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.03 }}
                            className={cn(
                                "group relative aspect-[4/5] rounded-[24px] p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 cursor-pointer",
                                item.color
                            )}
                        >
                            <h3 className="text-base md:text-lg font-bold leading-tight tracking-tight">
                                {item.name}
                            </h3>

                            <div className="flex justify-end pr-1 pb-1">
                                <div className="transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 opacity-80 group-hover:opacity-100">
                                    {item.icon}
                                </div>
                            </div>

                            {/* Subtle background glow on hover */}
                            <div className="absolute inset-0 rounded-[24px] bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        </motion.div>
                    ))}

                    {/* A special larger "Featured" style card like Safaricom Business */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="col-span-2 rounded-[24px] bg-red-400 p-6 flex flex-col justify-between text-white shadow-lg shadow-red-100 group cursor-pointer transition-all hover:scale-[1.02]"
                    >
                        <h3 className="text-xl md:text-2xl font-black italic">Bized Enterprise</h3>
                        <div className="flex justify-between items-end">
                            <p className="text-sm font-bold opacity-80">Custom solutions for big brands</p>
                            <Wallet className="w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

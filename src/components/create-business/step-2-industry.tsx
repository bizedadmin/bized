"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { UtensilsCrossed, ShoppingBag, Scissors, Briefcase, Heart, GraduationCap, Home, Sparkles, Dumbbell, Building2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const INDUSTRIES = [
    // Food & Dining
    {
        category: "Food & Dining", types: [
            { id: "Restaurant", name: "Restaurant", icon: UtensilsCrossed },
            { id: "Bakery", name: "Bakery", icon: UtensilsCrossed },
            { id: "CafeOrCoffeeShop", name: "Café", icon: UtensilsCrossed },
            { id: "FastFoodRestaurant", name: "Fast Food", icon: UtensilsCrossed },
        ]
    },

    // Retail & Shopping
    {
        category: "Retail & Shopping", types: [
            { id: "Store", name: "General Store", icon: ShoppingBag },
            { id: "ClothingStore", name: "Clothing Store", icon: ShoppingBag },
            { id: "ElectronicsStore", name: "Electronics", icon: ShoppingBag },
            { id: "FurnitureStore", name: "Furniture Store", icon: ShoppingBag },
        ]
    },

    // Health & Beauty
    {
        category: "Health & Beauty", types: [
            { id: "BeautySalon", name: "Beauty Salon", icon: Scissors },
            { id: "HairSalon", name: "Hair Salon", icon: Scissors },
            { id: "DaySpa", name: "Day Spa", icon: Sparkles },
            { id: "Dentist", name: "Dentist", icon: Heart },
            { id: "MedicalClinic", name: "Medical Clinic", icon: Heart },
            { id: "Pharmacy", name: "Pharmacy", icon: Heart },
        ]
    },

    // Professional Services
    {
        category: "Professional Services", types: [
            { id: "ProfessionalService", name: "Professional Service", icon: Briefcase },
            { id: "AccountingService", name: "Accounting", icon: Briefcase },
            { id: "Attorney", name: "Attorney", icon: Briefcase },
            { id: "RealEstateAgent", name: "Real Estate", icon: Briefcase },
        ]
    },

    // Home Services
    {
        category: "Home Services", types: [
            { id: "Electrician", name: "Electrician", icon: Home },
            { id: "Plumber", name: "Plumber", icon: Home },
            { id: "GeneralContractor", name: "Contractor", icon: Home },
            { id: "HousePainter", name: "Painter", icon: Home },
        ]
    },

    // Sports & Recreation
    {
        category: "Sports & Recreation", types: [
            { id: "ExerciseGym", name: "Gym", icon: Dumbbell },
            { id: "SportsClub", name: "Sports Club", icon: Dumbbell },
            { id: "GolfCourse", name: "Golf Course", icon: Dumbbell },
        ]
    },

    // Education
    {
        category: "Education", types: [
            { id: "School", name: "School", icon: GraduationCap },
            { id: "Preschool", name: "Preschool", icon: GraduationCap },
            { id: "CollegeOrUniversity", name: "College/University", icon: GraduationCap },
        ]
    },

    // Other
    {
        category: "Other", types: [
            { id: "LocalBusiness", name: "Other Business", icon: Building2 },
            { id: "ChildCare", name: "Child Care", icon: Building2 },
            { id: "Library", name: "Library", icon: Building2 },
        ]
    },
]

export function Step2Industry() {
    const { data, updateData } = useWizard()
    const [expandedCategories, setExpandedCategories] = useState<string[]>([])

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">What type of business do you have?</Label>
                <p className="text-sm text-gray-500 mt-1">This helps us optimize for search engines and social media</p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {INDUSTRIES.map((category) => {
                    const isExpanded = expandedCategories.includes(category.category)
                    const hasSelectedInCategory = category.types.some(t => t.id === data.industry)

                    return (
                        <div key={category.category} className="border rounded-lg overflow-hidden">
                            {/* Category Header */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(category.category)}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                    "hover:bg-gray-50 dark:hover:bg-zinc-800",
                                    hasSelectedInCategory && "bg-blue-50 dark:bg-blue-900/20"
                                )}
                            >
                                <span className={cn(
                                    "font-semibold",
                                    hasSelectedInCategory ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {category.category}
                                </span>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {/* Category Items */}
                            {isExpanded && (
                                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-zinc-900/50">
                                    {category.types.map((industry) => {
                                        const Icon = industry.icon
                                        return (
                                            <button
                                                key={industry.id}
                                                type="button"
                                                onClick={() => {
                                                    updateData({ industry: industry.id, schemaOrgType: industry.id })
                                                }}
                                                className={cn(
                                                    "p-3 rounded-lg border-2 transition-all hover:border-gray-400 dark:hover:border-gray-600",
                                                    "flex items-center gap-3 text-left",
                                                    data.industry === industry.id
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-5 h-5 shrink-0",
                                                    data.industry === industry.id ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    data.industry === industry.id ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                                                )}>
                                                    {industry.name}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Calendar, ShoppingCart, CreditCard, Package, Truck, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const GOALS = [
    { id: "appointments", name: "Appointments", icon: Calendar, description: "Schedule and manage bookings" },
    { id: "sales", name: "Sales", icon: ShoppingCart, description: "Sell products or services" },
    { id: "payments", name: "Payments", icon: CreditCard, description: "Accept online payments" },
    { id: "orders", name: "Order Management", icon: Package, description: "Track and fulfill orders" },
    { id: "deliveries", name: "Deliveries", icon: Truck, description: "Manage delivery logistics" },
    { id: "online_presence", name: "Online Presence", icon: Globe, description: "Build your digital storefront" },
]

export function Step3Goals() {
    const { data, updateData } = useWizard()

    const toggleGoal = (goalId: string) => {
        const currentGoals = data.goals || []
        const newGoals = currentGoals.includes(goalId)
            ? currentGoals.filter(g => g !== goalId)
            : [...currentGoals, goalId]
        updateData({ goals: newGoals })
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">What are your business goals?</Label>
                <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOALS.map((goal) => {
                    const Icon = goal.icon
                    const isSelected = data.goals?.includes(goal.id)
                    return (
                        <button
                            key={goal.id}
                            type="button"
                            onClick={() => toggleGoal(goal.id)}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all hover:border-gray-400 dark:hover:border-gray-600",
                                "flex items-start gap-3 text-left",
                                isSelected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900"
                            )}
                        >
                            <Icon className={cn(
                                "w-6 h-6 mt-0.5 shrink-0",
                                isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                            )} />
                            <div className="flex-1">
                                <div className={cn(
                                    "font-medium",
                                    isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                                )}>
                                    {goal.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{goal.description}</div>
                            </div>
                            {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

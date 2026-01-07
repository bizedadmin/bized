"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Truck, Store, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"

const DELIVERY_OPTIONS = [
    { id: "delivery", name: "Delivery", icon: Truck, description: "Ship to customer", hasFee: true },
    { id: "pickup", name: "Pick up", icon: Store, description: "Customer collects", hasFee: false },
    { id: "dineIn", name: "Dine In", icon: UtensilsCrossed, description: "Eat at location", hasFee: false },
]

export function Step5Delivery() {
    const { data, updateData } = useWizard()

    const toggleMethod = (methodId: string) => {
        const currentMethods = data.deliveryMethods || []
        const exists = currentMethods.find(m => m.type === methodId)

        if (exists) {
            updateData({
                deliveryMethods: currentMethods.filter(m => m.type !== methodId)
            })
        } else {
            updateData({
                deliveryMethods: [...currentMethods, { type: methodId as any, fee: 0 }]
            })
        }
    }

    const updateFee = (methodId: string, fee: number) => {
        const currentMethods = data.deliveryMethods || []
        updateData({
            deliveryMethods: currentMethods.map(m =>
                m.type === methodId ? { ...m, fee } : m
            )
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">How will customers receive orders?</Label>
                <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
            </div>

            <div className="space-y-4">
                {DELIVERY_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = data.deliveryMethods?.some(m => m.type === option.id)
                    const method = data.deliveryMethods?.find(m => m.type === option.id)

                    return (
                        <div key={option.id} className="space-y-3">
                            <button
                                type="button"
                                onClick={() => toggleMethod(option.id)}
                                className={cn(
                                    "w-full p-4 rounded-lg border-2 transition-all hover:border-gray-400 dark:hover:border-gray-600",
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
                                        {option.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                                </div>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            {isSelected && option.hasFee && (
                                <div className="ml-12 space-y-2">
                                    <Label htmlFor={`fee-${option.id}`} className="text-sm">Delivery Fee</Label>
                                    <Input
                                        id={`fee-${option.id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={method?.fee || 0}
                                        onChange={(e) => updateFee(option.id, parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="w-40 bg-white dark:bg-zinc-900"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

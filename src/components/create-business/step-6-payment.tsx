"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Banknote, Smartphone, Building, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const PAYMENT_OPTIONS = [
    { id: "cash", name: "Cash on Delivery", icon: Banknote, description: "Accept cash payments", hasDetails: false },
    { id: "mpesa", name: "M-Pesa", icon: Smartphone, description: "Mobile money", hasDetails: true, detailLabel: "Business Number" },
    { id: "bank", name: "Bank Transfer", icon: Building, description: "Direct bank transfer", hasDetails: true, detailLabel: "Account Number" },
    { id: "card", name: "Card Payments", icon: CreditCard, description: "Credit/Debit cards", hasDetails: false },
]

export function Step6Payment() {
    const { data, updateData } = useWizard()

    const toggleMethod = (methodId: string) => {
        const currentMethods = data.paymentMethods || []
        const exists = currentMethods.find(m => m.type === methodId)

        if (exists) {
            updateData({
                paymentMethods: currentMethods.filter(m => m.type !== methodId)
            })
        } else {
            updateData({
                paymentMethods: [...currentMethods, { type: methodId as any, details: {} }]
            })
        }
    }

    const updateDetails = (methodId: string, details: any) => {
        const currentMethods = data.paymentMethods || []
        updateData({
            paymentMethods: currentMethods.map(m =>
                m.type === methodId ? { ...m, details } : m
            )
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">How will you accept payments?</Label>
                <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
            </div>

            <div className="space-y-4">
                {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = data.paymentMethods?.some(m => m.type === option.id)
                    const method = data.paymentMethods?.find(m => m.type === option.id)

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

                            {isSelected && option.hasDetails && (
                                <div className="ml-12 space-y-2">
                                    <Label htmlFor={`details-${option.id}`} className="text-sm">{option.detailLabel}</Label>
                                    <Input
                                        id={`details-${option.id}`}
                                        value={method?.details?.accountNumber || ""}
                                        onChange={(e) => updateDetails(option.id, { accountNumber: e.target.value })}
                                        placeholder={`Enter ${option.detailLabel?.toLowerCase()}`}
                                        className="bg-white dark:bg-zinc-900"
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

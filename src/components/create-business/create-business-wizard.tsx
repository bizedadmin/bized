"use client"

import { WizardProvider, useWizard } from "./wizard-context"
import { Step1NameLink } from "./step-1-name-link"
import { Step2Industry } from "./step-2-industry"
import { Step3Goals } from "./step-3-goals"
import { Step4Products } from "./step-4-products"
import { Step5Delivery } from "./step-5-delivery"
import { Step6Payment } from "./step-6-payment"
import { Step7WhatsApp } from "./step-7-whatsapp"
import { Step8BusinessHours } from "./step-8-business-hours"
import { MobilePreview } from "./mobile-preview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

function WizardContent() {
    const { data, currentStep, goNext, goBack } = useWizard()
    const router = useRouter()
    const [creating, setCreating] = useState(false)

    const steps = [
        { component: Step1NameLink, title: "Name & Link" },
        { component: Step2Industry, title: "Industry" },
        { component: Step3Goals, title: "Goals" },
        { component: Step4Products, title: "Products" },
        { component: Step5Delivery, title: "Delivery" },
        { component: Step6Payment, title: "Payment" },
        { component: Step7WhatsApp, title: "WhatsApp" },
        { component: Step8BusinessHours, title: "Business Hours" },
    ]

    const CurrentStepComponent = steps[currentStep - 1].component
    const isLastStep = currentStep === 8

    const handleNext = async () => {
        // Create business after Step 1
        if (currentStep === 1) {
            setCreating(true)
            try {
                const res = await fetch("/api/businesses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: data.name,
                        slug: data.slug,
                        phone: data.phone,
                        themeColor: data.themeColor,
                        secondaryColor: data.secondaryColor,
                        buttonColor: data.buttonColor,
                        businessCategories: data.businessCategories,
                        industry: data.businessCategories?.[0] || 'LocalBusiness',
                        schemaOrgType: data.businessCategories?.[0] || 'LocalBusiness',
                        setupCompleted: false, // Not fully completed yet
                        isDraft: false,
                        setupStep: 1,
                    })
                })

                if (res.ok) {
                    const business = await res.json()
                    // Redirect to page builder
                    router.push(`/business/page-builder?businessId=${business._id}`)
                } else {
                    console.error('Business creation failed with status:', res.status)
                    const errorText = await res.text()
                    console.error('Error response:', errorText)

                    let error
                    try {
                        error = JSON.parse(errorText)
                    } catch {
                        error = { message: errorText || 'Failed to create business' }
                    }

                    console.error('Business creation error:', error)
                    alert(error.message || "Failed to create business")
                }
            } catch (error) {
                console.error("Error creating business:", error)
                alert("An error occurred while creating your business")
            } finally {
                setCreating(false)
            }
        } else if (isLastStep) {
            // Submit the form (for remaining steps if we keep them)
            setCreating(true)
            try {
                const res = await fetch("/api/businesses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: data.name,
                        slug: data.slug,
                        phone: data.phone,
                        themeColor: data.themeColor,
                        secondaryColor: data.secondaryColor,
                        industry: data.industry,
                        schemaOrgType: data.industry || 'LocalBusiness',
                        goals: data.goals,
                        deliveryMethods: data.deliveryMethods,
                        paymentMethods: data.paymentMethods,
                        whatsappNumber: data.whatsappNumber,
                        whatsappConnected: data.whatsappConnected,
                        businessHours: data.businessHours,
                        setupCompleted: true,
                        isDraft: false,
                        setupStep: 8,
                    })
                })

                if (res.ok) {
                    const business = await res.json()

                    // Create products if any
                    if (data.products && data.products.length > 0) {
                        await Promise.all(
                            data.products.map(product =>
                                fetch(`/api/businesses/${business._id}/products`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(product)
                                })
                            )
                        )
                    }

                    // Redirect to business dashboard
                    router.push('/business/dashboard')
                } else {
                    console.error('Business creation failed with status:', res.status)
                    const errorText = await res.text()
                    console.error('Error response:', errorText)

                    let error
                    try {
                        error = JSON.parse(errorText)
                    } catch {
                        error = { message: errorText || 'Failed to create business' }
                    }

                    console.error('Business creation error:', error)
                    alert(error.message || "Failed to create business")
                }
            } catch (error) {
                console.error("Error creating business:", error)
                alert("An error occurred while creating your business")
            } finally {
                setCreating(false)
            }
        } else {
            goNext()
        }
    }

    const canProceed = () => {
        // Step 1: Name & Link required + Business Category
        if (currentStep === 1) {
            return data.name && data.slug && data.phone.code && data.phone.number &&
                data.businessCategories && data.businessCategories.length > 0
        }
        // Step 4: Products required (at least one)
        if (currentStep === 4) {
            return data.products && data.products.length > 0
        }
        // All other steps are optional
        return true
    }

    const handleSkip = () => {
        if (currentStep < 8) {
            goNext()
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                <div className="font-bold text-xl">Bized</div>
                <div className="text-sm text-gray-500">
                    Step {currentStep} of 8
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row">
                {/* Left Side - Form */}
                <div className="flex-1 p-6 md:p-12 lg:p-16 flex justify-center md:justify-end bg-white dark:bg-zinc-950">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{steps[currentStep - 1].title}</h1>
                            <div className="mt-2 flex gap-1">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 flex-1 rounded-full transition-colors ${idx < currentStep ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <CurrentStepComponent />

                        {/* Navigation */}
                        <div className="flex gap-3 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goBack}
                                    disabled={creating}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}

                            {/* Skip button for steps 2-8, except step 4 (Products) which is required */}
                            {currentStep > 1 && currentStep < 8 && currentStep !== 4 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleSkip}
                                    disabled={creating}
                                >
                                    Skip
                                </Button>
                            )}

                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!canProceed() || creating}
                                className="flex-1"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : currentStep === 1 ? (
                                    "Create Business"
                                ) : isLastStep ? (
                                    "Complete Setup"
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Preview */}
                <div className="flex-1 bg-blue-50 dark:bg-zinc-900/50 p-6 md:p-12 lg:p-16 flex justify-center md:justify-start items-start overflow-hidden relative">
                    <MobilePreview />
                </div>
            </main>
        </div>
    )
}

export function CreateBusinessWizard() {
    return (
        <WizardProvider>
            <WizardContent />
        </WizardProvider>
    )
}

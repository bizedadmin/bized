"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export interface WizardData {
    // Step 1
    name: string
    slug: string
    phone: { code: string; number: string }
    themeColor: string
    secondaryColor: string
    buttonColor?: string
    businessCategories?: string[]

    // Step 2
    industry: string
    schemaOrgType: string

    // Step 3
    goals: string[]

    // Step 4
    products: Array<{
        id?: string
        name: string
        description: string
        image?: string
        sku?: string
        url?: string
        offers: {
            price: number
            priceCurrency: string
            availability: string
        }
        category?: string
        type?: 'product' | 'service'
    }>

    // Step 5
    deliveryMethods: Array<{
        type: 'delivery' | 'pickup' | 'dineIn'
        fee?: number
    }>

    // Step 6
    paymentMethods: Array<{
        type: 'cash' | 'mpesa' | 'bank' | 'card'
        details?: Record<string, unknown>
    }>

    // Step 7
    whatsappNumber: string
    whatsappConnected: boolean

    // Step 8
    businessHours: Array<{
        day: string
        isOpen: boolean
        openTime: string
        closeTime: string
    }>

    // Display Settings
    showBookNow?: boolean
    showShopNow?: boolean
    showQuoteRequest?: boolean
}

interface WizardContextType {
    data: WizardData
    updateData: (updates: Partial<WizardData>) => void
    currentStep: number
    setCurrentStep: (step: number) => void
    goNext: () => void
    goBack: () => void
    draftId: string | null
    saveDraft: () => Promise<void>
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [draftId, setDraftId] = useState<string | null>(null)
    const [data, setData] = useState<WizardData>({
        name: "",
        slug: "",
        phone: { code: "", number: "" },
        themeColor: "#1f2937",
        secondaryColor: "#f3f4f6",
        buttonColor: "#1f2937",
        businessCategories: [],
        industry: "",
        schemaOrgType: "LocalBusiness",
        goals: [],
        products: [],
        deliveryMethods: [],
        paymentMethods: [],
        whatsappNumber: "",
        whatsappConnected: false,
        businessHours: [],
    })

    // Load existing draft on mount
    useEffect(() => {
        const loadDraft = async () => {
            try {
                const res = await fetch('/api/businesses/draft')
                if (res.ok) {
                    const draft = await res.json()
                    setDraftId(draft._id)
                    setData({
                        name: draft.name || "",
                        slug: draft.slug || "",
                        phone: draft.phone || { code: "", number: "" },
                        themeColor: draft.themeColor || "#1f2937",
                        secondaryColor: draft.secondaryColor || "#f3f4f6",
                        buttonColor: draft.buttonColor || draft.themeColor || "#1f2937",
                        businessCategories: draft.businessCategories || [],
                        industry: draft.industry || "",
                        schemaOrgType: draft.schemaOrgType || "LocalBusiness",
                        goals: draft.goals || [],
                        products: [], // Products are not loaded from draft to avoid stale data
                        deliveryMethods: draft.deliveryMethods || [],
                        paymentMethods: draft.paymentMethods || [],
                        whatsappNumber: draft.whatsappNumber || "",
                        whatsappConnected: draft.whatsappConnected || false,
                        businessHours: draft.businessHours || [],
                    })
                    setCurrentStep(draft.setupStep || 1)
                }
            } catch (error) {
                console.log('No draft found or error loading draft')
            }
        }
        loadDraft()
    }, [])

    const saveDraft = useCallback(async () => {
        // Only save if we have at least a name
        if (!data.name) return

        try {
            const res = await fetch('/api/businesses/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    setupStep: currentStep,
                })
            })

            if (res.ok) {
                const draft = await res.json()
                if (!draftId) {
                    setDraftId(draft._id)
                }
            }
        } catch (error) {
            console.error('Failed to save draft:', error)
        }
    }, [data, currentStep, draftId])

    // Auto-save draft every 30 seconds
    useEffect(() => {
        const interval = setInterval(saveDraft, 30000) // 30 seconds
        return () => clearInterval(interval)
    }, [saveDraft])

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }

    const goNext = () => {
        if (currentStep < 8) setCurrentStep(currentStep + 1)
    }

    const goBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    return (
        <WizardContext.Provider value={{ data, updateData, currentStep, setCurrentStep, goNext, goBack, draftId, saveDraft }}>
            {children}
        </WizardContext.Provider>
    )
}

export function useWizard() {
    const context = useContext(WizardContext)
    if (context === undefined) {
        throw new Error("useWizard must be used within a WizardProvider")
    }
    return context
}

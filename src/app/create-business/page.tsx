"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BusinessCategoryModal } from "@/components/create-business/business-category-modal"
import { Loader2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CreateBusinessPage() {
    const router = useRouter()
    const [creating, setCreating] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [phoneCode, setPhoneCode] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [businessCategories, setBusinessCategories] = useState<string[]>([])

    // Validation state
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [isCheckingSlug, setIsCheckingSlug] = useState(false)
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

    // Auto-detect location for phone code
    useEffect(() => {
        if (!phoneCode) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.country_calling_code) {
                        setPhoneCode(data.country_calling_code)
                    }
                })
                .catch(err => console.error("Failed to detect location", err))
        }
    }, [])

    // Check slug availability
    useEffect(() => {
        const checkSlug = async () => {
            if (!slug) {
                setSlugAvailable(null)
                return
            }
            setIsCheckingSlug(true)
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${slug}`)
                const result = await res.json()
                setSlugAvailable(result.available)
            } catch (error) {
                console.error("Failed to check slug", error)
            } finally {
                setIsCheckingSlug(false)
            }
        }

        const timeoutId = setTimeout(checkSlug, 500)
        return () => clearTimeout(timeoutId)
    }, [slug])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setName(newName)
        if (!isSlugManuallyEdited) {
            setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))
        setIsSlugManuallyEdited(true)
    }

    const shortenSlug = async () => {
        if (!name) return

        setIsCheckingSlug(true)
        const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
        const words = cleanName.split(/\s+/).filter(Boolean)

        if (words.length === 0) {
            setIsCheckingSlug(false)
            return
        }

        const candidates: string[] = []
        candidates.push(words[0])

        if (words.length > 1) {
            let current = words[0]
            for (let i = 1; i < words.length; i++) {
                current += words[i][0]
                candidates.push(current)
            }
        }

        let found = false
        for (const candidate of candidates) {
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${candidate}`)
                const result = await res.json()
                if (result.available) {
                    setSlug(candidate)
                    setIsSlugManuallyEdited(true)
                    found = true
                    break
                }
            } catch (error) {
                console.error("Check failed for candidate:", candidate)
            }
        }

        if (!found) {
            setSlug(candidates[candidates.length - 1])
            setIsSlugManuallyEdited(true)
        }

        setIsCheckingSlug(false)
    }

    const canProceed = () => {
        return name && slug && phoneCode && phoneNumber &&
            businessCategories && businessCategories.length > 0 &&
            slugAvailable === true
    }

    const handleCreateBusiness = async () => {
        if (!canProceed()) return

        setCreating(true)
        try {
            console.log('Creating business...')

            const res = await fetch("/api/businesses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    phone: { code: phoneCode, number: phoneNumber },
                    businessCategories,
                    industry: businessCategories[0] || 'LocalBusiness',
                    schemaOrgType: businessCategories[0] || 'LocalBusiness',
                    setupCompleted: false,
                    isDraft: false,
                    setupStep: 1,
                })
            })

            if (res.ok) {
                const business = await res.json()
                console.log('Business created:', business)

                // Redirect to page builder with business data
                router.push(`/business/page-builder?businessId=${business._id}`)
            } else {
                const errorText = await res.text()
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
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 bg-white sticky top-0 z-10">
                <div className="font-bold text-xl">Bized</div>
                <div className="text-sm text-gray-500">Create Your Business</div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight mb-2">Create Your Business</h1>
                        <p className="text-sm text-gray-600">Get started by providing your business details</p>
                    </div>

                    <div className="space-y-6">
                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Store name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                required
                                className="bg-white"
                                placeholder="My Awesome Store"
                            />
                        </div>

                        {/* Magic Link */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">Magic Link <span className="text-red-500">*</span></Label>
                            <div className={cn(
                                "flex items-center border rounded-md px-3 bg-white focus-within:ring-2 ring-blue-500/20 transition-colors",
                                slugAvailable === false ? "border-red-500" : slugAvailable === true ? "border-green-500" : ""
                            )}>
                                <span className="text-gray-500 text-sm whitespace-nowrap">bized.app/</span>
                                <input
                                    id="slug"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    className="flex-1 border-none bg-transparent h-10 px-2 text-sm focus:outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={shortenSlug}
                                    title="Auto-shorten link"
                                    className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                                >
                                    <Wand2 className="w-4 h-4" />
                                </button>
                            </div>
                            {isCheckingSlug ? (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                                </p>
                            ) : slug && slugAvailable === false ? (
                                <p className="text-xs text-red-500">This link is already taken.</p>
                            ) : slug && slugAvailable === true ? (
                                <p className="text-xs text-green-600">Link available!</p>
                            ) : null}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                            <div className="flex gap-3">
                                <Input
                                    value={phoneCode}
                                    onChange={(e) => setPhoneCode(e.target.value)}
                                    className="w-24 bg-white"
                                    placeholder="+1"
                                />
                                <Input
                                    id="phone"
                                    placeholder="Phone number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex-1 bg-white"
                                />
                            </div>
                        </div>

                        {/* Industry / Business Category */}
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
                            <div
                                onClick={() => setCategoryModalOpen(true)}
                                className="border rounded-md px-3 py-2 bg-white cursor-pointer hover:border-gray-400 transition-colors min-h-[40px] flex items-center"
                            >
                                {businessCategories && businessCategories.length > 0 ? (
                                    <span className="text-sm">{businessCategories[0]}</span>
                                ) : (
                                    <span className="text-sm text-gray-400">Select business category</span>
                                )}
                            </div>
                            {businessCategories && businessCategories.length > 1 && (
                                <p className="text-xs text-gray-500">
                                    +{businessCategories.length - 1} additional {businessCategories.length === 2 ? 'category' : 'categories'}
                                </p>
                            )}
                        </div>

                        {/* Create Button */}
                        <Button
                            type="button"
                            onClick={handleCreateBusiness}
                            disabled={!canProceed() || creating}
                            className="w-full mt-8"
                            size="lg"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Business...
                                </>
                            ) : (
                                "Create Business"
                            )}
                        </Button>
                    </div>

                    {/* Business Category Modal */}
                    <BusinessCategoryModal
                        open={categoryModalOpen}
                        onOpenChange={setCategoryModalOpen}
                        selectedCategories={businessCategories}
                        onCategoriesChange={setBusinessCategories}
                    />
                </div>
            </main>
        </div>
    )
}

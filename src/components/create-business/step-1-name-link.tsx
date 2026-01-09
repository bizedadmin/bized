"use client"

import { useWizard } from "./wizard-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { BusinessCategoryModal } from "./business-category-modal"
import { Loader2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const THEME_COLORS = [
    { name: "Black", value: "#1f2937" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Green", value: "#22c55e" },
    { name: "Teal", value: "#06b6d4" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
]

export function Step1NameLink() {
    const { data, updateData } = useWizard()
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [isCheckingSlug, setIsCheckingSlug] = useState(false)
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)

    useEffect(() => {
        // Detect user location and set phone code
        if (!data.phone.code) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(apiData => {
                    if (apiData.country_calling_code) {
                        updateData({ phone: { ...data.phone, code: apiData.country_calling_code } })
                    }
                })
                .catch(err => console.error("Failed to detect location", err))
        }
    }, [])

    useEffect(() => {
        const checkSlug = async () => {
            if (!data.slug) {
                setSlugAvailable(null)
                return
            }
            setIsCheckingSlug(true)
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${data.slug}`)
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
    }, [data.slug])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        updateData({ name: newName })
        if (!isSlugManuallyEdited) {
            updateData({ slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateData({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })
        setIsSlugManuallyEdited(true)
    }

    const shortenSlug = async () => {
        if (!data.name) return

        setIsCheckingSlug(true)
        const cleanName = data.name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
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
                    updateData({ slug: candidate })
                    setIsSlugManuallyEdited(true)
                    found = true
                    break
                }
            } catch (error) {
                console.error("Check failed for candidate:", candidate)
            }
        }

        if (!found) {
            updateData({ slug: candidates[candidates.length - 1] })
            setIsSlugManuallyEdited(true)
        }

        setIsCheckingSlug(false)
    }

    return (
        <div className="space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Store name <span className="text-red-500">*</span></Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={handleNameChange}
                    required
                    className="bg-white dark:bg-zinc-900"
                />
            </div>

            {/* Magic Link */}
            <div className="space-y-2">
                <Label htmlFor="slug">Magic Link <span className="text-red-500">*</span></Label>
                <div className={cn(
                    "flex items-center border rounded-md px-3 bg-white dark:bg-zinc-900 focus-within:ring-2 ring-blue-500/20 transition-colors",
                    slugAvailable === false ? "border-red-500" : slugAvailable === true ? "border-green-500" : ""
                )}>
                    <span className="text-gray-500 text-sm whitespace-nowrap">bized.app/</span>
                    <input
                        id="slug"
                        value={data.slug}
                        onChange={handleSlugChange}
                        className="flex-1 border-none bg-transparent h-10 px-2 text-sm focus:outline-none"
                        required
                    />
                    <button
                        type="button"
                        onClick={shortenSlug}
                        title="Auto-shorten link"
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md text-gray-500 transition-colors"
                    >
                        <Wand2 className="w-4 h-4" />
                    </button>
                </div>
                {isCheckingSlug ? (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                    </p>
                ) : data.slug && slugAvailable === false ? (
                    <p className="text-xs text-red-500">This link is already taken.</p>
                ) : data.slug && slugAvailable === true ? (
                    <p className="text-xs text-green-600">Link available!</p>
                ) : null}
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <div className="flex gap-3">
                    <Input
                        value={data.phone.code}
                        onChange={(e) => updateData({ phone: { ...data.phone, code: e.target.value } })}
                        className="w-24 bg-white dark:bg-zinc-900"
                    />
                    <Input
                        id="phone"
                        placeholder="Phone number"
                        value={data.phone.number}
                        onChange={(e) => updateData({ phone: { ...data.phone, number: e.target.value } })}
                        className="flex-1 bg-white dark:bg-zinc-900"
                    />
                </div>
            </div>

            {/* Industry / Business Category */}
            <div className="space-y-2">
                <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
                <div
                    onClick={() => setCategoryModalOpen(true)}
                    className="border rounded-md px-3 py-2 bg-white dark:bg-zinc-900 cursor-pointer hover:border-gray-400 transition-colors min-h-[40px] flex items-center"
                >
                    {data.businessCategories && data.businessCategories.length > 0 ? (
                        <span className="text-sm">{data.businessCategories[0]}</span>
                    ) : (
                        <span className="text-sm text-gray-400">Select business category</span>
                    )}
                </div>
                {data.businessCategories && data.businessCategories.length > 1 && (
                    <p className="text-xs text-gray-500">
                        +{data.businessCategories.length - 1} additional {data.businessCategories.length === 2 ? 'category' : 'categories'}
                    </p>
                )}
            </div>

            {/* Color Picker */}
            <div className="space-y-3 pt-2">
                <Label>Brand Color</Label>
                <ColorPicker
                    value={data.themeColor}
                    onChange={(color) => updateData({ themeColor: color })}
                    presets={THEME_COLORS}
                    className="w-full bg-white dark:bg-zinc-900"
                />
            </div>

            {/* Secondary Color Picker */}
            <div className="space-y-3">
                <Label>Background Color</Label>
                <p className="text-xs text-gray-500">Color behind the avatar</p>
                <ColorPicker
                    value={data.secondaryColor || "#f3f4f6"}
                    onChange={(color) => updateData({ secondaryColor: color })}
                    presets={[
                        { name: "Light Gray", value: "#f3f4f6" },
                        { name: "White", value: "#ffffff" },
                        { name: "Light Blue", value: "#dbeafe" },
                        { name: "Light Green", value: "#dcfce7" },
                        { name: "Light Yellow", value: "#fef9c3" },
                        { name: "Light Pink", value: "#fce7f3" },
                        { name: "Light Purple", value: "#f3e8ff" },
                    ]}
                    className="w-full bg-white dark:bg-zinc-900"
                />
            </div>

            {/* Button Color Picker */}
            <div className="space-y-3">
                <Label>Button Color</Label>
                <p className="text-xs text-gray-500">Color for action buttons</p>
                <ColorPicker
                    value={data.buttonColor || data.themeColor}
                    onChange={(color) => updateData({ buttonColor: color })}
                    presets={THEME_COLORS}
                    className="w-full bg-white dark:bg-zinc-900"
                />
            </div>

            {/* Business Category Modal */}
            <BusinessCategoryModal
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                selectedCategories={data.businessCategories || []}
                onCategoriesChange={(categories) => updateData({ businessCategories: categories })}
            />
        </div>
    )
}

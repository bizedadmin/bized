"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, X, Upload, Package, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const COMMON_CATEGORIES = [
    // Food & Beverage
    "Appetizers",
    "Main Courses",
    "Desserts",
    "Beverages",
    "Snacks",

    // Retail
    "Clothing",
    "Accessories",
    "Footwear",
    "Electronics",
    "Home Decor",
    "Furniture",

    // Beauty & Personal Care
    "Skincare",
    "Haircare",
    "Makeup",
    "Fragrances",

    // Services
    "Consultation",
    "Installation",
    "Maintenance",
    "Training",

    // Other
    "Books",
    "Toys",
    "Sports Equipment",
    "Art & Crafts",
]

interface CategoryModalProps {
    onSelect: (category: string) => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

function CategorySearchModal({ onSelect, open, onOpenChange }: CategoryModalProps) {
    const [search, setSearch] = useState("")
    const [customCategory, setCustomCategory] = useState("")

    const filteredCategories = COMMON_CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (category: string) => {
        onSelect(category)
        onOpenChange(false)
        setSearch("")
    }

    const handleAddCustom = () => {
        if (customCategory.trim()) {
            onSelect(customCategory.trim())
            onOpenChange(false)
            setCustomCategory("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleSelect(category)}
                                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <Label className="text-sm">Add Custom Category</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter category name"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                            />
                            <Button onClick={handleAddCustom} size="sm">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { CategorySearchModal }

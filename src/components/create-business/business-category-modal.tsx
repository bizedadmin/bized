"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const BUSINESS_CATEGORIES = [
    // Food & Dining
    "Restaurant",
    "Bakery",
    "Café",
    "Fast Food",
    "Bar & Grill",
    "Food Truck",

    // Retail & Shopping
    "General Store",
    "Clothing Store",
    "Electronics Store",
    "Furniture Store",
    "Bookstore",
    "Jewelry Store",
    "Pet Store",
    "Toy Store",
    "Sports Equipment",
    "Hardware Store",

    // Health & Beauty
    "Beauty Salon",
    "Hair Salon",
    "Barbershop",
    "Day Spa",
    "Nail Salon",
    "Dentist",
    "Medical Clinic",
    "Pharmacy",
    "Optician",

    // Professional Services
    "Accounting",
    "Legal Services",
    "Real Estate",
    "Insurance",
    "Consulting",
    "Marketing Agency",
    "Photography",
    "Event Planning",

    // Home Services
    "Electrician",
    "Plumber",
    "Contractor",
    "Painter",
    "Cleaning Service",
    "Landscaping",
    "Moving Company",

    // Automotive
    "Auto Repair",
    "Car Wash",
    "Auto Parts",
    "Car Dealership",

    // Technology
    "Software Company",
    "IT Services",
    "Computer Repair",
    "Web Design",
    "App Development",

    // Education
    "School",
    "Preschool",
    "College/University",
    "Tutoring",
    "Music School",
    "Dance Studio",

    // Sports & Recreation
    "Gym",
    "Yoga Studio",
    "Sports Club",
    "Golf Course",
    "Swimming Pool",

    // Entertainment
    "Movie Theater",
    "Museum",
    "Art Gallery",
    "Night Club",

    // Hospitality
    "Hotel",
    "Bed & Breakfast",
    "Hostel",

    // Other
    "Laundry Service",
    "Dry Cleaning",
    "Printing Services",
    "Courier Service",
    "Storage Facility",
    "Child Care",
    "Pet Grooming",
    "Veterinary",
    "Florist",
    "Gift Shop",
]

interface BusinessCategoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategories: string[]
    onCategoriesChange: (categories: string[]) => void
}

export function BusinessCategoryModal({
    open,
    onOpenChange,
    selectedCategories,
    onCategoriesChange
}: BusinessCategoryModalProps) {
    const [search, setSearch] = useState("")
    const [customCategory, setCustomCategory] = useState("")

    const filteredCategories = BUSINESS_CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(search.toLowerCase())
    )

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoriesChange(selectedCategories.filter(c => c !== category))
        } else {
            onCategoriesChange([...selectedCategories, category])
        }
    }

    const removeCategory = (category: string) => {
        onCategoriesChange(selectedCategories.filter(c => c !== category))
    }

    const addCustomCategory = () => {
        if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
            onCategoriesChange([...selectedCategories, customCategory.trim()])
            setCustomCategory("")
        }
    }

    const handleSave = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Business category</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Help customers find your business by industry.{" "}
                        <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Primary Category */}
                    {selectedCategories.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600">Primary category</Label>
                            <div className="relative">
                                <Input
                                    value={selectedCategories[0]}
                                    readOnly
                                    className="bg-gray-50 cursor-default"
                                />
                            </div>
                        </div>
                    )}

                    {/* Additional Categories */}
                    {selectedCategories.length > 1 && (
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600">Additional category</Label>
                            {selectedCategories.slice(1).map((category) => (
                                <div key={category} className="flex items-center gap-2">
                                    <Input
                                        value={category}
                                        readOnly
                                        className="bg-gray-50 cursor-default"
                                    />
                                    <button
                                        onClick={() => removeCategory(category)}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Another Category Button */}
                    {selectedCategories.length > 0 && selectedCategories.length < 5 && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-auto px-0"
                            onClick={() => {
                                // Scroll to search input
                                const searchInput = document.querySelector('input[placeholder="Search categories..."]') as HTMLInputElement
                                searchInput?.focus()
                            }}
                        >
                            + Add another category
                        </Button>
                    )}

                    {/* Search Categories */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Category List */}
                        <div className="max-h-[200px] overflow-y-auto border rounded-md">
                            {filteredCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b last:border-b-0",
                                        selectedCategories.includes(category) && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                            {filteredCategories.length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No categories found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custom Category Input */}
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="text-sm text-gray-600">Or add a custom category</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter category name"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={selectedCategories.length === 0}
                            className="flex-1"
                        >
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

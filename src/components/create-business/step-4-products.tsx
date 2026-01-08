"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X, Search, Upload, Package, Briefcase } from "lucide-react"
import { useState } from "react"
import { CategorySearchModal } from "./category-search-modal"
import { cn } from "@/lib/utils"

export function Step4Products() {
    const { data, updateData } = useWizard()
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        type: "product" as "product" | "service"
    })
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)

    const addProduct = () => {
        if (!newProduct.name || newProduct.price <= 0) return

        updateData({
            products: [...(data.products || []), {
                name: newProduct.name,
                description: newProduct.description,
                image: newProduct.image,
                category: newProduct.category,
                type: newProduct.type,
                offers: {
                    price: newProduct.price,
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock"
                },
                id: Date.now().toString()
            }]
        })
        setNewProduct({
            name: "",
            description: "",
            price: 0,
            category: "",
            image: "",
            type: "product"
        })
    }

    const removeProduct = (id: string) => {
        updateData({
            products: data.products?.filter(p => p.id !== id) || []
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImageUploading(true)

        // Simulate image upload - in production, upload to cloud storage
        const reader = new FileReader()
        reader.onloadend = () => {
            setNewProduct({ ...newProduct, image: reader.result as string })
            setImageUploading(false)
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">Add your products or services</Label>
                <p className="text-sm text-gray-500 mt-1">Add at least one product or service to continue</p>
            </div>

            {/* Product List */}
            {data.products && data.products.length > 0 && (
                <div className="space-y-3">
                    {data.products.map((product) => (
                        <div key={product.id} className="flex items-start gap-3 p-3 border rounded-lg bg-white dark:bg-zinc-900">
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="font-medium">{product.name}</div>
                                    {product.type === "service" && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                            Service
                                        </span>
                                    )}
                                </div>
                                {product.description && (
                                    <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                                )}
                                {product.category && (
                                    <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                                )}
                                <div className="text-sm font-medium text-blue-600 mt-1">${product.offers.price}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeProduct(product.id!)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md text-gray-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Form */}
            <div className="space-y-4 p-4 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                {/* Product/Service Toggle */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, type: "product" })}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-md border-2 transition-all flex items-center justify-center gap-2",
                            newProduct.type === "product"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-gray-200 dark:border-gray-700"
                        )}
                    >
                        <Package className="w-4 h-4" />
                        Product
                    </button>
                    <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, type: "service" })}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-md border-2 transition-all flex items-center justify-center gap-2",
                            newProduct.type === "service"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-gray-200 dark:border-gray-700"
                        )}
                    >
                        <Briefcase className="w-4 h-4" />
                        Service
                    </button>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-name">{newProduct.type === "product" ? "Product" : "Service"} Name</Label>
                    <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder={`e.g., ${newProduct.type === "product" ? "Classic Burger" : "Haircut"}`}
                        className="bg-white dark:bg-zinc-900"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <div className="relative">
                        <Input
                            id="product-category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            placeholder="Select or type category"
                            className="bg-white dark:bg-zinc-900 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setCategoryModalOpen(true)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            title="Search categories"
                        >
                            <Search className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-description">Description (Optional)</Label>
                    <Textarea
                        id="product-description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Brief description..."
                        className="bg-white dark:bg-zinc-900 resize-none"
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-price">Price</Label>
                        <Input
                            id="product-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.price || ""}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="bg-white dark:bg-zinc-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Image</Label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="product-image"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('product-image')?.click()}
                                disabled={imageUploading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {imageUploading ? "Uploading..." : newProduct.image ? "Change" : "Upload"}
                            </Button>
                        </div>
                    </div>
                </div>

                {newProduct.image && (
                    <div className="relative w-24 h-24">
                        <img
                            src={newProduct.image}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, image: "" })}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <Button
                    type="button"
                    onClick={addProduct}
                    variant="outline"
                    className="w-full"
                    disabled={!newProduct.name || newProduct.price <= 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {newProduct.type === "product" ? "Product" : "Service"}
                </Button>
            </div>

            <CategorySearchModal
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                onSelect={(category) => setNewProduct({ ...newProduct, category })}
            />
        </div>
    )
}

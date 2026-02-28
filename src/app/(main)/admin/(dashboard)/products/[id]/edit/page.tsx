"use client";

import React, { useState, useEffect } from "react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useBusiness, ProductItem } from "@/contexts/BusinessContext";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Package } from "lucide-react";

export default function EditProductPage() {
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams();
    const [product, setProduct] = useState<ProductItem | null>(null);

    useEffect(() => {
        if (!isLoading && currentBusiness) {
            const found = currentBusiness.products?.find(p => p.id === id);
            if (found) {
                setProduct(found);
            }
        }
    }, [currentBusiness, isLoading, id]);

    const handleSave = async (updatedProduct: ProductItem) => {
        if (!currentBusiness) return;
        setIsSubmitting(true);
        try {
            const products = currentBusiness.products || [];
            const updatedProducts = products.map(p => p.id === id ? updatedProduct : p);
            await updateBusiness({
                products: updatedProducts
            });
        } catch (error) {
            console.error("Failed to update product:", error);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                <p className="font-bold opacity-40 text-xs">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-2 opacity-20">
                    <Package size={40} />
                </div>
                <h2 className="text-2xl font-black">Product Not Found</h2>
                <p className="text-[var(--color-on-surface-variant)] opacity-60 max-w-xs">The product you're trying to edit doesn't exist or has been removed.</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-8 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <ProductForm
            initialData={product}
            slug={currentBusiness?.slug}
            onSave={handleSave}
            isSubmitting={isSubmitting}
        />
    );
}

"use client";

import React, { useState } from "react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useBusiness, ProductItem } from "@/contexts/BusinessContext";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const { currentBusiness, updateBusiness } = useBusiness();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSave = async (product: ProductItem) => {
        if (!currentBusiness) return;
        setIsSubmitting(true);
        try {
            const products = currentBusiness.products || [];
            await updateBusiness({
                products: [product, ...products]
            });
            // router.back() is handled inside ProductForm's onSubmit
        } catch (error) {
            console.error("Failed to add product:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <ProductForm
            slug={currentBusiness?.slug}
            onSave={handleSave}
            isSubmitting={isSubmitting}
        />
    );
}

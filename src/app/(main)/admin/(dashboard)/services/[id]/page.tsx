"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useBusiness, type ServiceItem } from "@/contexts/BusinessContext";
import { ServiceForm } from "@/components/admin/services/ServiceForm";

export default function EditServicePage() {
    const { id } = useParams();
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();

    const service = currentBusiness?.services?.find(s => s.id === id);

    const handleSave = async (updatedService: ServiceItem) => {
        if (!currentBusiness) return;
        const currentServices = currentBusiness.services || [];
        await updateBusiness({
            services: currentServices.map(s => s.id === id ? updatedService : s)
        });
    };

    if (isLoading) return null;
    if (!service) return <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Service not found</div>;

    return <ServiceForm initialData={service} onSave={handleSave} />;
}

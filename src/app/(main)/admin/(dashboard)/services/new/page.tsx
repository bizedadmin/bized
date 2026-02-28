"use client";

import React from "react";
import { useBusiness, type ServiceItem } from "@/contexts/BusinessContext";
import { ServiceForm } from "@/components/admin/services/ServiceForm";

export default function NewServicePage() {
    const { currentBusiness, updateBusiness } = useBusiness();

    const handleSave = async (service: ServiceItem) => {
        if (!currentBusiness) return;
        const currentServices = currentBusiness.services || [];
        await updateBusiness({
            services: [...currentServices, service]
        });
    };

    return <ServiceForm onSave={handleSave} />;
}

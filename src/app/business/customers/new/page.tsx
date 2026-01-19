"use client"

import {
    ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/modules/customers/CustomerForm"

export default function NewCustomerPage() {
    const router = useRouter()

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
                    <p className="text-muted-foreground">Create a new customer profile.</p>
                </div>
            </div>

            <CustomerForm
                onSuccess={() => router.push('/business/customers')}
                onCancel={() => router.back()}
            />
        </div>
    )
}

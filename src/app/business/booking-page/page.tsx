"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function BookingPageRedirect() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Short delay to ensure client-side hydration logic runs smoothly
        const timer = setTimeout(() => {
            const storedBusiness = localStorage.getItem("selectedBusiness")
            if (storedBusiness) {
                try {
                    const business = JSON.parse(storedBusiness)
                    if (business && business._id) {
                        router.push(`/business/design/page-builder/bookings?businessId=${business._id}`)
                        return
                    }
                } catch (e) {
                    console.error("Failed to parse selected business", e)
                }
            }

            // If no business selected or invalid, go to select page
            router.push("/businesses/select")
        }, 100)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500">Redirecting to Booking Page Designer...</p>
            </div>
        </div>
    )
}

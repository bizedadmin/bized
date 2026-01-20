"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function MarketplaceReviewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Reviews & Ratings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage and respond to customer feedback from the marketplace.
                </p>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <Star className="w-5 h-5 text-zinc-500" />
                    </div>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        This section is currently under development. You will soon be able to see and respond to reviews left by marketplace customers.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

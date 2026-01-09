"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shop } from "iconsax-reactjs"
import { MoreVertical } from "lucide-react"
import Link from "next/link"

interface BusinessCardProps {
    id: string
    name: string
    slug: string
    plan: string
}

export function BusinessCard({ id, name, slug, plan }: BusinessCardProps) {
    return (
        <Card className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Shop size="24" className="text-gray-500" variant="Bold" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{name}</h3>
                        <Badge variant="secondary" className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                            {plan} PLAN
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">bized.app/{slug}</p>
                </div>
            </div>

            <Button variant="ghost" size="icon">
                <MoreVertical size="20" />
            </Button>
        </Card>
    )
}

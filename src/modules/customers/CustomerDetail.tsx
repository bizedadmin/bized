"use client"

import {
    MapPin,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ChevronLeft,
    Edit,
    ShoppingBag
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CustomerDetailProps {
    customer: any
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
    const router = useRouter()

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                            {(customer.name || "?")[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{customer.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{customer.identifier}</span>
                                {customer.category && (
                                    <Badge variant="secondary" className="text-xs">{customer.category}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Button onClick={() => router.push(`/business/customers/edit/${customer._id}`)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Order history integration coming soon.</p>
                                <p className="text-sm mt-2">Total Orders: {customer.totalOrders || 0}</p>
                                <p className="text-sm">Total Spent: KES {(customer.totalSpent || 0).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {customer.notes || "No notes added for this customer."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
                            </div>
                            {customer.telephone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${customer.telephone}`} className="hover:underline">{customer.telephone}</a>
                                </div>
                            )}
                            {customer.jobTitle && (
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span>{customer.jobTitle}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {customer.address?.streetAddress ? (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                                    <div className="text-sm">
                                        <p>{customer.address.streetAddress}</p>
                                        <p>{customer.address.addressLocality}, {customer.address.addressRegion}</p>
                                        <p>{customer.address.postalCode}</p>
                                        <p>{customer.address.addressCountry}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No address provided.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Created</span>
                                <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Updated</span>
                                <span>{new Date(customer.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {customer.lastOrderDate && (
                                <div className="flex justify-between text-primary font-medium">
                                    <span>Last Order</span>
                                    <span>{new Date(customer.lastOrderDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

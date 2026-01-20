"use client"

import {
    MapPin,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ChevronLeft,
    Edit,
    ShoppingBag,
    FileText,
    Receipt,
    CreditCard,
    LayoutDashboard,
    Activity,
    User,
    Ticket
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CustomerDetailProps {
    customer: any
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
    const router = useRouter()

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl uppercase">
                            {(customer.name || "?")[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black">{customer.name}</h1>
                                {customer.category && (
                                    <Badge variant="secondary" className="text-xs uppercase font-bold tracking-wider">{customer.category}</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{customer.identifier}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/business/customers/edit/${customer._id}`)}>
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Button>
                    <Button className="gap-2 bg-primary text-white">
                        New Order
                    </Button>
                </div>
            </div>

            {/* Contact Details at the top */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <a href={`mailto:${customer.email}`} className="text-sm font-bold truncate hover:underline">{customer.email}</a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-bold">{customer.telephone || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Job Title</p>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-bold">{customer.jobTitle || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Location</p>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-bold truncate">
                                {customer.address?.addressLocality ? `${customer.address.addressLocality}, ${customer.address.addressCountry || ''}` : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs at the bottom */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                    <TabsTrigger value="quote">Quote</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tight font-black">
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
                                        <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="text-sm font-medium">No activity records found for this customer.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tight font-black">
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/20 p-6 rounded-xl border border-border text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap min-h-[120px]">
                                        {customer.notes || "No notes available."}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Financial Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0">
                                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                        <span className="text-sm text-muted-foreground">Total Spent</span>
                                        <span className="text-xl font-black text-primary uppercase">KES {(customer.totalSpent || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                        <span className="text-sm text-muted-foreground">Total Orders</span>
                                        <span className="text-xl font-black text-primary">{customer.totalOrders || 0}</span>
                                    </div>
                                    {customer.lastOrderDate && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-muted-foreground">Last Order</span>
                                            <span className="text-sm font-bold">{new Date(customer.lastOrderDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detailed Address</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm pt-0">
                                    {customer.address?.streetAddress ? (
                                        <div className="text-muted-foreground">
                                            <p className="text-foreground font-bold">{customer.address.streetAddress}</p>
                                            <p>{customer.address.addressLocality}, {customer.address.addressRegion}</p>
                                            <p>{customer.address.postalCode}</p>
                                            <p className="font-bold text-primary text-xs uppercase tracking-widest mt-2">{customer.address.addressCountry}</p>
                                        </div>
                                    ) : (
                                        <p className="italic text-muted-foreground">No address set</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Registration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground uppercase tracking-widest">Added On</span>
                                        <span className="font-bold">{new Date(customer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground uppercase tracking-widest">Last Update</span>
                                        <span className="font-bold">{new Date(customer.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tickets">
                    <Card className="border-dashed border-2 bg-muted/10 h-64 flex items-center justify-center">
                        <div className="text-center p-8">
                            <Ticket className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-bold">No Support Tickets</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">Track customer support requests and issues here.</p>
                            <Button className="font-bold">Create Ticket</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="quote">
                    <Card className="border-dashed border-2 bg-muted/10 h-64 flex items-center justify-center">
                        <div className="text-center p-8">
                            <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-bold">No Quotes</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">Create professional quotes for this customer.</p>
                            <Button className="font-bold">Create Quote</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="border-dashed border-2 bg-muted/10 h-64 flex items-center justify-center">
                        <div className="text-center p-8">
                            <ShoppingBag className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-bold">No Orders</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">Track and manage customer orders.</p>
                            <Button className="font-bold">Register Order</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card className="border-dashed border-2 bg-muted/10 h-64 flex items-center justify-center">
                        <div className="text-center p-8">
                            <Receipt className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-bold">No Invoices</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">Manage billing and payments history.</p>
                            <Button className="font-bold">Generate Invoice</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="payments">
                    <Card className="border-dashed border-2 bg-muted/10 h-64 flex items-center justify-center">
                        <div className="text-center p-8">
                            <CreditCard className="h-8 w-8 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-bold">No Payments</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">Record and view transaction history.</p>
                            <Button className="font-bold">Record Payment</Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

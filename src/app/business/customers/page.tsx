"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    Plus,
    Users
} from "lucide-react"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerTable } from "@/modules/customers/CustomerTable"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchCustomers = async () => {
        const stored = localStorage.getItem("selectedBusiness");
        if (!stored) return;
        const business = JSON.parse(stored);

        try {
            const res = await fetch(`/api/business/customers?businessId=${business._id}`)
            if (res.ok) {
                const data = await res.json()
                setCustomers(data)
            }
        } catch (error) {
            console.error("Failed to fetch customers", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const filteredCustomers = customers.filter(customer => {
        const search = searchTerm.toLowerCase()
        return (
            customer.name?.toLowerCase().includes(search) ||
            customer.email?.toLowerCase().includes(search) ||
            customer.identifier?.toLowerCase().includes(search)
        )
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-1">Manage your customer relationships and view their history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/business/customers/new">
                        <Button className="font-semibold gap-2">
                            <Plus className="h-4 w-4" />
                            Add Customer
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customers.filter(c => {
                                if (!c.lastOrderDate) return false
                                const lastOrder = new Date(c.lastOrderDate)
                                const now = new Date()
                                return lastOrder.getMonth() === now.getMonth() && lastOrder.getFullYear() === now.getFullYear()
                            }).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customers.filter(c => {
                                const created = new Date(c.createdAt)
                                const now = new Date()
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search customers..."
                                    className="pl-9 w-full md:w-[300px] h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <CustomerTable
                        customers={filteredCustomers}
                        loading={loading}
                        onDelete={fetchCustomers}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

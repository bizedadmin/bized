"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreVertical, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation" // import useRouter
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Service {
    _id: string
    name: string
    description?: string
    serviceType?: string
    image?: string[]
    offers?: {
        price: number
        priceCurrency: string
        availability: string
    }
    duration?: number
    status: string
}

export default function ServicesPage() {
    const router = useRouter() // Initialize router
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchServices(parsed._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchServices = async (id: string) => {
        try {
            const res = await fetch(`/api/business/services?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setServices(data)
            }
        } catch (error) {
            console.error("Error fetching services:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.serviceType?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRowClick = (serviceId: string) => {
        router.push(`/business/services/${serviceId}`)
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Services</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your bookable services and appointments.
                    </p>
                </div>
                <Link href="/business/services/new">
                    <Button className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Service
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead className="hidden md:table-cell">Duration</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No services found. <Link href="/business/services/new" className="text-blue-600 underline">Create one</Link>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServices.map((service) => (
                                <TableRow
                                    key={service._id}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleRowClick(service._id)}
                                >
                                    <TableCell>
                                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                            {service.image?.[0] ? (
                                                <img
                                                    src={service.image[0]}
                                                    alt={service.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                    <div className="w-4 h-4 rounded-full bg-current" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">{service.name}</TableCell>
                                    <TableCell className="hidden md:table-cell text-gray-500">{service.serviceType || service.category || "-"}</TableCell>
                                    <TableCell className="hidden md:table-cell text-gray-500">{service.duration} mins</TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {service.offers?.priceCurrency} {service.offers?.price}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'} className="capitalize font-normal">
                                            {service.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/business/services/${service._id}`}>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

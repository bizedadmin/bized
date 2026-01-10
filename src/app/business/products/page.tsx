"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    MoreHorizontal,
    ChevronRight,
    Filter,
    ArrowUpDown,
    Package,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Product {
    _id: string
    name: string
    type: 'Product' | 'Service'
    description: string
    image: string[]
    status: 'active' | 'draft' | 'archived'
    offers: {
        price: number
        priceCurrency: string
    }
    category: string
    updatedAt: string
}

export default function ProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const business = JSON.parse(storedBusiness)
            setBusinessId(business._id)
            fetchProducts(business._id)
        }
    }, [])

    const fetchProducts = async (id: string) => {
        try {
            const res = await fetch(`/api/products?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleProductAdded = () => {
        if (businessId) fetchProducts(businessId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
                <Button onClick={() => router.push('/business/products/new')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add product
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All products</TabsTrigger>
                    <TabsTrigger value="attention">Needs attention</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Filter products"
                                className="pl-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 dark:bg-zinc-800/50">
                                    <TableHead className="w-[400px]">Product</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                            Loading products...
                                        </TableCell>
                                    </TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No products found</p>
                                                    <p className="text-xs text-gray-500">Add your first product or service to get started.</p>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => router.push('/business/products/new')}>
                                                    Add product
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 relative overflow-hidden">
                                                        {product.image?.[0] ? (
                                                            <Image
                                                                src={product.image[0]}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-foreground">{product.name}</span>
                                                        <span className="text-xs text-muted-foreground">{product.type}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={product.status === 'active' ? 'secondary' : 'outline'}
                                                    className={cn(
                                                        product.status === 'active' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30" : ""
                                                    )}
                                                >
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {product.offers.priceCurrency} {product.offers.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {product.category || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer text-destructive">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="attention" className="mt-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up!</p>
                                <p className="text-xs text-gray-500">No products currently need your attention.</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

        </div>
    )
}



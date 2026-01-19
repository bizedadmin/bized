"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    User,
    Mail,
    MapPin,
    FileText,
    ChevronLeft,
    Save,
    Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InvoiceItem {
    description: string
    quantity: number
    price: number
    total: number
}

interface InvoiceFormProps {
    initialData?: any
    isEditing?: boolean
}

export function InvoiceForm({ initialData, isEditing = false }: InvoiceFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])

    const [formData, setFormData] = useState({
        customerName: initialData?.customer?.name || "",
        customerEmail: initialData?.customer?.email || "",
        customerAddress: initialData?.customer?.address || "",
        dueDate: initialData?.paymentDueDate ? new Date(initialData.paymentDueDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: initialData?.totalPaymentDue?.priceCurrency || "KES",
        notes: initialData?.notes || "",
        items: initialData?.items || [
            { description: "", quantity: 1, price: 0, total: 0 }
        ],
        tax: initialData?.tax || 0,
        discount: initialData?.discount || 0,
        orderId: initialData?.referencesOrder || "",
    })

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return
            try {
                const res = await fetch(`/api/business/orders/${orderId}`)
                if (res.ok) {
                    const order = await res.json()
                    const customer = order.customer
                    const items = order.orderedItem
                    const currency = order.priceCurrency
                    const total = order.price

                    setFormData(prev => ({
                        ...prev,
                        customerName: customer.name,
                        customerEmail: customer.email,
                        customerAddress: customer.address || "",
                        items: items.map((item: any) => ({
                            description: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total
                        })),
                        subtotal: order.subtotal,
                        total: total,
                        currency: currency,
                        orderId: order._id
                    }))
                }
            } catch (error) {
                console.error("Failed to fetch order details", error)
            }
        }

        const fetchProducts = async () => {
            const stored = localStorage.getItem("selectedBusiness");
            if (!stored) return;
            const business = JSON.parse(stored);

            try {
                const res = await fetch(`/api/business/products?businessId=${business._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setProducts(data)
                }
            } catch (error) {
                console.error("Failed to fetch products", error)
            }
        }
        fetchOrderDetails()
        fetchProducts()
    }, [orderId])

    const calculateTotals = (items: InvoiceItem[], tax: number, discount: number) => {
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
        const total = subtotal + tax - discount
        return { subtotal, total }
    }

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === 'quantity' || field === 'price') {
            newItems[index].total = newItems[index].quantity * newItems[index].price
        }

        setFormData({ ...formData, items: newItems })
    }

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: "", quantity: 1, price: 0, total: 0 }]
        })
    }

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return
        const newItems = formData.items.filter((_item: any, i: number) => i !== index)
        setFormData({ ...formData, items: newItems })
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p._id === productId)
        if (product) {
            handleItemChange(index, 'description', product.name)
            handleItemChange(index, 'price', product.offers.price)
        }
    }

    const handleSubmit = async (e: React.FormEvent, status: string = 'draft') => {
        e.preventDefault()
        setLoading(true)

        const { subtotal, total } = calculateTotals(formData.items, formData.tax, formData.discount)

        const stored = localStorage.getItem("selectedBusiness");
        if (!stored) {
            toast.error("No business selected")
            setLoading(false)
            return
        }
        const business = JSON.parse(stored);

        const payload = {
            ...formData,
            provider: business._id,
            identifier: initialData?.identifier,
            subtotal,
            paymentStatus: status,
            paymentDueDate: formData.dueDate,
            totalPaymentDue: {
                price: total,
                priceCurrency: formData.currency
            },
            customer: {
                name: formData.customerName,
                email: formData.customerEmail,
                address: formData.customerAddress,
            },
            referencesOrder: formData.orderId || undefined
        }

        try {
            const url = isEditing ? `/api/business/invoices/${initialData._id}` : '/api/business/invoices'
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(`Invoice ${isEditing ? 'updated' : 'created'} successfully`)
                router.push('/business/invoices')
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to save invoice")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const { subtotal, total } = calculateTotals(formData.items, formData.tax, formData.discount)

    return (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={loading}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        type="button"
                        className="gap-2"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, 'sent')}
                    >
                        <Save className="h-4 w-4" />
                        {isEditing ? 'Update Invoice' : 'Create Invoice'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                            <CardDescription>Select a customer or enter details manually.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customerName"
                                            placeholder="John Doe"
                                            className="pl-9"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Customer Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="pl-9"
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Billing Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="customerAddress"
                                        placeholder="123 Street, City, Country"
                                        className="pl-9 min-h-[80px]"
                                        value={formData.customerAddress}
                                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Line Items</CardTitle>
                                <CardDescription>Add products or services to this invoice.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Description</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item: any, index: number) => (
                                        <TableRow key={index} className="group">
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Item description..."
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        required
                                                    />
                                                    {products.length > 0 && (
                                                        <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                                            <SelectTrigger className="h-7 text-[10px] w-auto">
                                                                <SelectValue placeholder="Quick select product" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="w-20"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{formData.currency}</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-12 w-32"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formData.currency} {item.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes & Terms</CardTitle>
                            <CardDescription>Include any additional information for the customer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Payment terms, bank details, or a thank you message..."
                                className="min-h-[100px]"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Invoice Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        className="pl-9"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formData.currency} {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="tax" className="text-muted-foreground">Tax (+)</Label>
                                <div className="relative w-32">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{formData.currency}</span>
                                    <Input
                                        id="tax"
                                        type="number"
                                        className="h-8 pl-10 text-right"
                                        value={formData.tax}
                                        onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="discount" className="text-muted-foreground">Discount (-)</Label>
                                <div className="relative w-32">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{formData.currency}</span>
                                    <Input
                                        id="discount"
                                        type="number"
                                        className="h-8 pl-10 text-right"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <hr className="border-border" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-black text-primary">
                                    {formData.currency} {total.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}

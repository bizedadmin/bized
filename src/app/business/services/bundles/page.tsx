"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Loader2, Search, ArrowLeft, Package, Sparkles, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function BundlesPage() {
    const [bundles, setBundles] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form Stats
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [selectedServices, setSelectedServices] = useState<{ service: string, quantity: number, name: string }[]>([])

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchData(parsed._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchData = async (id: string) => {
        try {
            const [bundlesRes, servicesRes] = await Promise.all([
                fetch(`/api/business/bundles?businessId=${id}`),
                fetch(`/api/business/services?businessId=${id}`)
            ])

            if (bundlesRes.ok && servicesRes.ok) {
                const [bundlesData, servicesData] = await Promise.all([
                    bundlesRes.json(),
                    servicesRes.json()
                ])
                setBundles(bundlesData)
                setServices(servicesData)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddServiceToBundle = (serviceId: string) => {
        const service = services.find(s => s._id === serviceId)
        if (!service) return

        if (selectedServices.some(s => s.service === serviceId)) {
            toast.error("Service already added to bundle")
            return
        }

        setSelectedServices([...selectedServices, { service: serviceId, quantity: 1, name: service.name }])
    }

    const handleRemoveServiceFromBundle = (serviceId: string) => {
        setSelectedServices(selectedServices.filter(s => s.service !== serviceId))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !price || !businessId || selectedServices.length === 0) {
            toast.error("Please fill in all required fields and add at least one service.")
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch("/api/business/bundles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name,
                    price: parseFloat(price),
                    description,
                    services: selectedServices.map(s => ({ service: s.service, quantity: s.quantity }))
                })
            })

            if (res.ok) {
                toast.success("Service Package created!")
                fetchData(businessId)
                setIsDialogOpen(false)
                resetForm()
            } else {
                toast.error("Failed to create bundle")
            }
        } catch (error) {
            toast.error("Error saving bundle")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/business/bundles?id=${id}&businessId=${businessId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setBundles(bundles.filter(b => b._id !== id))
                toast.success("Package removed")
            }
        } catch (error) {
            toast.error("Error deleting package")
        }
    }

    const resetForm = () => {
        setName("")
        setPrice("")
        setDescription("")
        setSelectedServices([])
    }

    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/business/services">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Packages & Bundles</h1>
                        <p className="text-sm text-muted-foreground">
                            Combine multiple services into discounted professional packages.
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100">
                    <Sparkles className="h-4 w-4" />
                    New Package
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search packages..."
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
                            <TableHead>Package Name</TableHead>
                            <TableHead>Included Services</TableHead>
                            <TableHead>Package Price</TableHead>
                            <TableHead>Savings</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBundles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm font-medium">
                                    No packages created yet. Start by grouping your best services!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBundles.map((bundle) => {
                                const originalTotal = bundle.services.reduce((acc: number, s: any) => acc + (s.service?.offers?.price || 0) * s.quantity, 0)
                                const savings = originalTotal - bundle.price
                                return (
                                    <TableRow key={bundle._id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <TableCell className="font-bold text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                    {bundle.name.charAt(0)}
                                                </div>
                                                {bundle.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {bundle.services.map((s: any, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-[10px] font-bold px-1.5 border-none">
                                                        {s.quantity}x {s.service?.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-blue-600">{bundle.currency} {bundle.price}</TableCell>
                                        <TableCell>
                                            {savings > 0 ? (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                                    Save {bundle.currency} {savings.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-400 font-medium italic">Standard Rate</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => handleDelete(bundle._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-blue-600 p-6 text-white shrink-0">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Design Service Package
                        </DialogTitle>
                        <p className="text-blue-100 text-xs mt-1 font-medium italic">Create a value bundle to increase your conversion rate.</p>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Package Title</Label>
                                <Input
                                    placeholder="e.g. VIP Business Transformation"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 text-sm font-semibold border-zinc-200 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Special Package Price</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="h-10 text-sm font-bold text-blue-700 bg-blue-50/30 border-blue-100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Included Services</Label>
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-zinc-200 font-bold text-zinc-500">
                                    {selectedServices.length} Selected
                                </span>
                            </div>

                            <Select onValueChange={handleAddServiceToBundle}>
                                <SelectTrigger className="w-full h-10 bg-white border-zinc-200 text-xs">
                                    <SelectValue placeholder="Search & Add services to this package..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s._id} value={s._id}>{s.name} - {s.offers?.priceCurrency} {s.offers?.price}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="space-y-2 pt-2">
                                {selectedServices.length === 0 && (
                                    <div className="text-center py-4 border-2 border-dashed border-zinc-200 rounded-xl">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">No services added yet</p>
                                    </div>
                                )}
                                {selectedServices.map(s => (
                                    <div key={s.service} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-blue-500" />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-700">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-zinc-50 rounded-lg p-0.5 border border-zinc-200">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newArr = [...selectedServices]
                                                        const idx = newArr.findIndex(x => x.service === s.service)
                                                        newArr[idx].quantity = Math.max(1, newArr[idx].quantity - 1)
                                                        setSelectedServices(newArr)
                                                    }}
                                                    className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-colors text-xs font-bold text-zinc-400"
                                                >-</button>
                                                <span className="w-6 text-[11px] font-bold text-center text-zinc-600">{s.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newArr = [...selectedServices]
                                                        const idx = newArr.findIndex(x => x.service === s.service)
                                                        newArr[idx].quantity += 1
                                                        setSelectedServices(newArr)
                                                    }}
                                                    className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-colors text-xs font-bold text-zinc-400"
                                                >+</button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveServiceFromBundle(s.service)}
                                                className="text-zinc-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Value Proposition (Description)</Label>
                            <Textarea
                                placeholder="Why should customers choose this bundle? e.g. Get the full experience and save 20%!"
                                className="min-h-[100px] resize-none text-sm border-zinc-200 rounded-2xl p-4 bg-zinc-50/50"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 shrink-0">
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs font-bold text-zinc-400 hover:text-zinc-600">DISCARD</Button>
                        <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700 px-8 h-10 rounded-xl shadow-lg shadow-blue-100 text-xs font-bold tracking-widest" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            LAUNCH PACKAGE
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

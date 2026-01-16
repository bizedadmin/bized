"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Loader2, Search, ArrowLeft, MapPin, Globe, Navigation, ChevronDown } from "lucide-react"
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

export default function ServiceAreasPage() {
    const [areas, setAreas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form Stats
    const [name, setName] = useState("")
    const [type, setType] = useState("City")
    const [description, setDescription] = useState("")
    const [radius, setRadius] = useState("")
    const [unit, setUnit] = useState("km")

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchAreas(parsed._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchAreas = async (id: string) => {
        try {
            const res = await fetch(`/api/business/areas?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setAreas(data)
            }
        } catch (error) {
            console.error("Error fetching areas:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !businessId) return

        setIsSaving(true)
        try {
            const res = await fetch("/api/business/areas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name,
                    type,
                    description,
                    radius: type === 'Radius' ? parseFloat(radius) : undefined,
                    unit: type === 'Radius' ? unit : undefined
                })
            })

            if (res.ok) {
                toast.success("Service Area added!")
                fetchAreas(businessId)
                setIsDialogOpen(false)
                resetForm()
            } else {
                toast.error("Failed to add area")
            }
        } catch (error) {
            toast.error("Error saving area")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/business/areas?id=${id}&businessId=${businessId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setAreas(areas.filter(a => a._id !== id))
                toast.success("Area removed")
            }
        } catch (error) {
            toast.error("Error deleting area")
        }
    }

    const resetForm = () => {
        setName("")
        setType("City")
        setDescription("")
        setRadius("")
        setUnit("km")
    }

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Service Areas</h1>
                        <p className="text-sm text-muted-foreground">
                            Define where your team provides these services.
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100">
                    <MapPin className="h-4 w-4" />
                    Add Area
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search areas..."
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
                            <TableHead>Area Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAreas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                                    No service areas defined. Defaulting to business location.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAreas.map((area) => (
                                <TableRow key={area._id} className="group hover:bg-blue-50/20 transition-colors">
                                    <TableCell className="font-semibold text-gray-900">
                                        <div className="flex items-center gap-3">
                                            {area.type === 'Virtual' ? (
                                                <Globe className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                            )}
                                            {area.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                            {area.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {area.type === 'Radius' ? `${area.radius} ${area.unit} around location` : area.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                            onClick={() => handleDelete(area._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-blue-600" />
                            Define Service Area
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Area Name</Label>
                            <Input
                                placeholder="e.g. Nairobi CBD, Manhattan"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Area Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="City">City</SelectItem>
                                    <SelectItem value="Region">Region / State</SelectItem>
                                    <SelectItem value="Radius">Radius / Perimeter</SelectItem>
                                    <SelectItem value="Virtual">Virtual / Remote</SelectItem>
                                    <SelectItem value="Custom">Custom Area</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'Radius' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                <div className="space-y-2">
                                    <Label>Radius</Label>
                                    <Input
                                        type="number"
                                        placeholder="Radius"
                                        value={radius}
                                        onChange={(e) => setRadius(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select value={unit} onValueChange={setUnit}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="km">Kilometers</SelectItem>
                                            <SelectItem value="miles">Miles</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Notes / Description</Label>
                            <Textarea
                                placeholder="e.g. North side only, excluding tolls..."
                                className="min-h-[80px] resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Add Service Area
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

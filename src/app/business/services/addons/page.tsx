"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Loader2, PlusCircle, Search, ArrowLeft, MoreVertical, Puzzle } from "lucide-react"
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

export default function AddOnsPage() {
    const [addons, setAddons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form Stats
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [duration, setDuration] = useState("0")

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchAddons(parsed._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchAddons = async (id: string) => {
        try {
            const res = await fetch(`/api/business/addons?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setAddons(data)
            }
        } catch (error) {
            console.error("Error fetching addons:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !price || !businessId) return

        setIsSaving(true)
        try {
            const res = await fetch("/api/business/addons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name,
                    price: parseFloat(price),
                    description,
                    duration: parseInt(duration)
                })
            })

            if (res.ok) {
                const data = await res.json()
                setAddons([data, ...addons])
                setIsDialogOpen(false)
                resetForm()
                toast.success("Add-on created!")
            } else {
                toast.error("Failed to create add-on")
            }
        } catch (error) {
            toast.error("Error saving add-on")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/business/addons?id=${id}&businessId=${businessId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setAddons(addons.filter(a => a._id !== id))
                toast.success("Add-on removed")
            }
        } catch (error) {
            toast.error("Error deleting add-on")
        }
    }

    const resetForm = () => {
        setName("")
        setPrice("")
        setDescription("")
        setDuration("0")
    }

    const filteredAddons = addons.filter(a =>
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
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Add-ons & Extras</h1>
                        <p className="text-sm text-muted-foreground">
                            Offer optional upgrades and extras for your services.
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-black text-white hover:bg-zinc-800">
                    <Plus className="h-4 w-4" />
                    New Add-on
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search add-ons..."
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
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Extra Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAddons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No add-ons found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAddons.map((addon) => (
                                <TableRow key={addon._id}>
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <PlusCircle className="w-4 h-4" />
                                            </div>
                                            {addon.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{addon.currency} {addon.price}</TableCell>
                                    <TableCell>{addon.duration} mins</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Active
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                                            onClick={() => handleDelete(addon._id)}
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Add-on</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Add-on Name</Label>
                            <Input
                                placeholder="e.g. Express Consultation, Premium Oil"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Extra Price</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Extra Duration (min)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe what this extra includes..."
                                className="min-h-[100px] resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-black text-white hover:bg-zinc-800" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Add-on
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

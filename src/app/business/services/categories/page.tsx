"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Loader2, Tag, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [newCategory, setNewCategory] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchCategories(parsed._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchCategories = async (id: string) => {
        try {
            const res = await fetch(`/api/categories?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
            toast.error("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategory.trim() || !businessId) return

        setIsAdding(true)
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name: newCategory.trim()
                })
            })

            if (res.ok) {
                const data = await res.json()
                setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)))
                setNewCategory("")
                toast.success("Category added successfully")
            } else {
                const data = await res.json()
                toast.error(data.message || "Failed to add category")
            }
        } catch (error) {
            toast.error("Error adding category")
        } finally {
            setIsAdding(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure? This will not delete services under this category, but it will remove the category from the list.")) return

        try {
            const res = await fetch(`/api/categories?id=${id}&businessId=${businessId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setCategories(categories.filter(c => c._id !== id))
                toast.success("Category removed")
            } else {
                toast.error("Failed to remove category")
            }
        } catch (error) {
            toast.error("Error removing category")
        }
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/business/services">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Categories</h1>
                        <p className="text-sm text-muted-foreground">
                            Organize your services into groupings.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <form onSubmit={handleAddCategory} className="flex gap-3">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Add new category (e.g. AI Consulting)"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                    <Button type="submit" disabled={!newCategory.trim() || isAdding} className="h-11 px-6">
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Add
                    </Button>
                </form>

                <div className="space-y-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Filter categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>

                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50 text-[11px] uppercase tracking-wider font-bold">
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground text-sm">
                                            {searchQuery ? "No matches found." : "No categories yet."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category._id} className="group hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    {category.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleDeleteCategory(category._id)}
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
                </div>
            </div>
        </div>
    )
}

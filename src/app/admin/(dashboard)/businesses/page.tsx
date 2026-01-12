"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Business {
    _id: string
    name: string
    slug: string
    plan: string
    createdAt?: string
}

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const router = useRouter()

    useEffect(() => {
        fetchBusinesses()
    }, [])

    const fetchBusinesses = async () => {
        try {
            const res = await fetch("/api/businesses")
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredBusinesses = businesses.filter(biz =>
        biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        biz.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Businesses</h2>
                    <p className="text-muted-foreground">Manage all registered businesses.</p>
                </div>
                <Button onClick={() => router.push("/create-business")}>
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search businesses..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBusinesses.length > 0 ? (
                                filteredBusinesses.map((biz) => (
                                    <TableRow key={biz._id}>
                                        <TableCell className="font-medium">{biz.name}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`http://${biz.slug}.localhost:3000`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                {biz.slug}.bized.app
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{biz.plan || "Free"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/businesses/${biz._id}`}>Details</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

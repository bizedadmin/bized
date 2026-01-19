"use client"

import { FileStack, Plus, Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ManifestsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <FileStack className="h-8 w-8 text-primary" />
                        Manifests
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate carrier manifests for daily pickups.</p>
                </div>
                <Button className="font-semibold gap-2">
                    <Plus className="h-4 w-4" />
                    New Manifest
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary">Today's Pickups</CardTitle>
                        <CardDescription>Consolidated shipments ready for carrier handover.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-black">24</div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Packages</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Generate Manifest
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Carrier Sync</CardTitle>
                        <CardDescription>Status of electronic manifest transmissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">All systems operational</span>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Manifests</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search manifests..." className="pl-8" />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Manifest ID</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Carrier</TableHead>
                                <TableHead className="font-bold text-center">Items</TableHead>
                                <TableHead className="font-bold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-mono text-xs uppercase">MNF-77283</TableCell>
                                <TableCell>{new Date().toLocaleDateString()}</TableCell>
                                <TableCell>UPS</TableCell>
                                <TableCell className="text-center">15</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 text-primary">Download PDF</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Note</p>
                            <p className="text-sm text-amber-800">Carrier manifests should be generated after all labels for the day have been printed but before the carrier arrives for pickup.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

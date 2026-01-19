"use client"

import { Tags, Plus, Search, Filter } from "lucide-react"
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

export default function LabelsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Tags className="h-8 w-8 text-primary" />
                        Shipping Labels
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate and manage shipping labels for your orders.</p>
                </div>
                <Button className="font-semibold gap-2">
                    <Plus className="h-4 w-4" />
                    Create Label
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Labels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">12</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Printed Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">45</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">128</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Labels History</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search labels..." className="pl-8" />
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
                                <TableHead className="font-bold">Label ID</TableHead>
                                <TableHead className="font-bold">Order #</TableHead>
                                <TableHead className="font-bold">Customer</TableHead>
                                <TableHead className="font-bold">Carrier</TableHead>
                                <TableHead className="font-bold text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-mono text-xs uppercase">LBL-928374</TableCell>
                                <TableCell>#ORD-8273</TableCell>
                                <TableCell>Jane Doe</TableCell>
                                <TableCell>FedEx</TableCell>
                                <TableCell className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Printed
                                    </span>
                                </TableCell>
                            </TableRow>
                            {/* Placeholder for more rows */}
                        </TableBody>
                    </Table>
                    <div className="py-20 text-center border-t border-dashed mt-4 rounded-b-xl bg-muted/20">
                        <p className="text-muted-foreground italic">Integration with shipping carriers coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

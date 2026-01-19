"use client"

import { MapPin, Plus, Search, Filter, Globe, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function LocationsPage() {
    // This would ideally fetch from a "Locations" or "Branches" collection
    const locations = [
        {
            id: 1,
            name: "Main Headquarters",
            type: "Headquarters",
            address: "123 Business Ave, Nairobi, Kenya",
            phone: "+254 700 000000",
            email: "hq@bized.com",
            status: "active",
            hours: "Mon-Fri: 8AM - 5PM"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <MapPin className="h-8 w-8 text-primary" />
                        Stores & Locations
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your physical business presence and branches.</p>
                </div>
                <Button className="font-semibold gap-2">
                    <Plus className="h-4 w-4" />
                    Add Location
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                    <Card key={loc.id} className="overflow-hidden border-none shadow-sm bg-muted/30">
                        <CardHeader className="bg-white dark:bg-zinc-900 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-bold tracking-wider">
                                        {loc.type}
                                    </Badge>
                                    <CardTitle className="text-xl">{loc.name}</CardTitle>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>{loc.address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{loc.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{loc.email}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium">{loc.hours}</span>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="w-full text-xs">Edit</Button>
                                <Button variant="outline" size="sm" className="w-full text-xs">View on Map</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <button className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="font-bold text-muted-foreground group-hover:text-primary">Add New Branch</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 italic whitespace-nowrap">Schema.org: LocalBusiness / Store</p>
                </button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Location SEO & Metadata</CardTitle>
                    <CardDescription>Configure how your locations appear in search results using Schema.org standards.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-muted/20 border border-dashed rounded-xl text-sm space-y-3">
                        <p className="font-semibold flex items-center gap-2 italic">
                            <Globe className="h-4 w-4" /> Standardized for Search Engines
                        </p>
                        <p className="text-muted-foreground">
                            Each location is automatically tagged with <code className="bg-muted px-1 rounded text-primary">itemtype="https://schema.org/LocalBusiness"</code> to ensure Google and other search engines can correctly index your physical presence.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Save, Percent, BadgePercent, Coins, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function PricingRulesPage() {
    const [loading, setLoading] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)

    // Mock settings for now or fetch from business
    const [globalDiscount, setGlobalDiscount] = useState("0")
    const [defaultTax, setDefaultTax] = useState("15")
    const [applyTaxToAll, setApplyTaxToAll] = useState(true)
    const [currency, setCurrency] = useState("USD")

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            // In a real app, fetch these from business.settings.pricing
        }
    }, [])

    const handleSave = async () => {
        setLoading(true)
        // Simulate save
        setTimeout(() => {
            toast.success("Pricing rules updated!")
            setLoading(false)
        }, 800)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-6">
            <div className="flex items-center gap-4">
                <Link href="/business/services">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pricing & Tax Rules</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure global pricing behaviors for all services.
                    </p>
                </div>
            </div>

            <Card className="border-zinc-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg">Global Currency</CardTitle>
                    </div>
                    <CardDescription>Default currency for all invoices and quotes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-[200px] space-y-2">
                        <Label>Active Currency</Label>
                        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="font-bold" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BadgePercent className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-lg">Tax Configuration</CardTitle>
                    </div>
                    <CardDescription>Set how taxes are calculated for your services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Apply Tax Automatically</Label>
                            <p className="text-[11px] text-zinc-400">Add the default tax rate to all new services by default.</p>
                        </div>
                        <Switch checked={applyTaxToAll} onCheckedChange={setApplyTaxToAll} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Default Sales Tax (%)</Label>
                            <Input
                                type="number"
                                value={defaultTax}
                                onChange={(e) => setDefaultTax(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>System Locale</Label>
                            <div className="h-10 px-3 flex items-center bg-zinc-50 border border-zinc-200 rounded-md text-sm text-zinc-500 font-medium">
                                UTC (Default)
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Percent className="w-5 h-5 text-amber-600" />
                        <CardTitle className="text-lg">Promotional Pricing</CardTitle>
                    </div>
                    <CardDescription>Global discount rules for marketing campaigns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Global Discount (%)</Label>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Inactive</span>
                        </div>
                        <Input
                            type="number"
                            disabled
                            value={globalDiscount}
                            placeholder="0"
                            className="bg-zinc-50/50"
                        />
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1">
                            <Info className="w-3 h-3" />
                            Upgrade to Pro to enable global promotional overlays.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button variant="ghost" className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Reset</Button>
                <Button onClick={handleSave} className="bg-black text-white hover:bg-zinc-800 px-8 h-12 rounded-xl text-xs font-bold tracking-widest shadow-xl shadow-zinc-200" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    SAVE RULES
                </Button>
            </div>
        </div>
    )
}

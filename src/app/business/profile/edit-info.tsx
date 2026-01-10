"use client"
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, RefreshCw, CheckCircle, ExternalLink, Upload, Clock, Plus, X, Building2, MapPin, Globe, Phone, Info, Image as ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function EditInfoForm({ bizData, onSave, onCancel }: { bizData: any, onSave: (data: any) => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(bizData)

    const addCategory = () => {
        setFormData((prev: any) => ({
            ...prev,
            businessCategories: [...(prev.businessCategories || []), ""]
        }))
    }

    const removeCategory = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            businessCategories: prev.businessCategories.filter((_: any, i: number) => i !== index)
        }))
    }

    const updateCategory = (index: number, value: string) => {
        const newCats = [...formData.businessCategories]
        newCats[index] = value
        setFormData((prev: any) => ({ ...prev, businessCategories: newCats }))
    }

    const handleSaveLocal = async () => {
        setLoading(true)
        try {
            await onSave(formData)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Identity Card */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Business Identity</h2>
                </div>
                <Card className="shadow-sm border-gray-200 dark:border-zinc-800">
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-300">Legal Business Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Acme Local Store"
                                className="h-12 text-lg font-medium"
                            />
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Industry & Categories</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addCategory}
                                    className="h-8 border-dashed text-blue-600"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">PRI</span>
                                    </div>
                                    <Input
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                        placeholder="Primary category"
                                        className="h-11 pl-16 border-blue-100"
                                    />
                                </div>

                                {formData.businessCategories?.map((cat: string, index: number) => (
                                    <div key={index} className="flex gap-3 animate-in slide-in-from-top-2">
                                        <div className="relative flex-1 group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">ADD</span>
                                            </div>
                                            <Input
                                                value={cat}
                                                onChange={e => updateCategory(index, e.target.value)}
                                                placeholder="Additional category"
                                                className="h-11 pl-16"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCategory(index)}
                                            className="h-11 w-11 text-gray-300 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <X className="w-4.5 h-4.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* About Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Info className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">About the Business</h2>
                </div>
                <Card className="shadow-sm border-gray-200 dark:border-zinc-800">
                    <CardContent className="p-8">
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe your business..."
                            className="min-h-[180px] leading-7 text-gray-700 dark:text-gray-300 text-base border-none p-0 focus-visible:ring-0 shadow-none resize-none"
                        />
                    </CardContent>
                </Card>
            </section>

            <div className="flex items-center justify-end gap-4 pt-10 border-t">
                <Button variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveLocal} disabled={loading} size="lg" className="px-14 h-12 bg-blue-600 hover:bg-blue-700 font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Info
                </Button>
            </div>
        </div>
    )
}

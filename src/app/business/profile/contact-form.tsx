"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Globe, Phone } from "lucide-react"

export default function ContactForm({ bizData, onSave, onCancel }: { bizData: any, onSave: (data: any) => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(bizData)

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
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Contact & Geographic Info</h2>
                </div>
                <Card className="shadow-sm border-gray-200 dark:border-zinc-800">
                    <CardContent className="p-8 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Phone size={14} className="text-blue-400" /> Phone Number
                                </Label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 123-4567"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Globe size={14} className="text-blue-400" /> Official Website
                                </Label>
                                <Input
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://example.com"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-zinc-800">
                            <Label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                <MapPin size={14} className="text-red-400" /> Business Location
                            </Label>
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Street Address, City, State, Zip"
                                className="h-11"
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div className="flex items-center justify-end gap-4 pt-10 border-t">
                <Button variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveLocal} disabled={loading} size="lg" className="px-14 h-12 bg-blue-600 hover:bg-blue-700 font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Contact
                </Button>
            </div>
        </div>
    )
}

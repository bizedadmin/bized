"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Image as ImageIcon, Upload, Building2 } from "lucide-react"

export default function PhotosForm({ bizData, onSave, onCancel }: { bizData: any, onSave: (data: any) => void, onCancel: () => void }) {
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
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Brand Assets</h2>
                </div>
                <Card className="shadow-md overflow-hidden border-gray-200 dark:border-zinc-800 max-w-2xl">
                    <div className="relative aspect-[16/8] bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group overflow-hidden border-b">
                        {formData.image ? (
                            <img src={formData.image} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-gray-400">
                                <ImageIcon size={32} strokeWidth={1.5} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Cover Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white w-8 h-8 pointer-events-none" />
                        </div>

                        {/* Logo Drop-on */}
                        <div className="absolute -bottom-6 left-6 w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border p-1.5 focus-within:ring-4 ring-blue-500/20 transition-all duration-300">
                            <div className="w-full h-full rounded-xl bg-gray-50 dark:bg-zinc-800 overflow-hidden flex items-center justify-center relative group/logo">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={28} className="text-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer">
                                    <Upload className="text-white w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-10 space-y-6">
                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Brand Logo URL</Label>
                            <Input
                                value={formData.logo}
                                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                placeholder="https://..."
                                className="h-10 text-[11px] font-mono border-gray-200 dark:border-zinc-800 focus:border-blue-300"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cover Display URL</Label>
                            <Input
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://..."
                                className="h-10 text-[11px] font-mono border-gray-200 dark:border-zinc-800 focus:border-blue-300"
                            />
                        </div>
                    </div>
                </Card>
            </section>

            <div className="flex items-center justify-end gap-4 pt-10 border-t">
                <Button variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveLocal} disabled={loading} size="lg" className="px-14 h-12 bg-blue-600 hover:bg-blue-700 font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Photos
                </Button>
            </div>
        </div>
    )
}

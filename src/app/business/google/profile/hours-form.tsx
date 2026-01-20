"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function HoursForm({ bizData, onSave, onCancel }: { bizData: any, onSave: (data: any) => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(bizData)

    const updateHour = (index: number, field: string, value: any) => {
        const newHours = [...formData.businessHours]
        newHours[index] = { ...newHours[index], [field]: value }
        setFormData((prev: any) => ({ ...prev, businessHours: newHours }))
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
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Operating Schedule</h2>
                </div>
                <Card className="shadow-md border-gray-200 dark:border-zinc-800 overflow-hidden max-w-xl">
                    <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                        {formData.businessHours.map((hour: any, index: number) => (
                            <div key={hour.day} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={hour.isOpen}
                                        onCheckedChange={(c) => updateHour(index, 'isOpen', c)}
                                        className="scale-90 data-[state=checked]:bg-blue-600"
                                    />
                                    <span className={`text-[13px] font-bold tracking-tight uppercase ${hour.isOpen ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-zinc-700'}`}>
                                        {hour.day.substring(0, 3)}
                                    </span>
                                </div>
                                {hour.isOpen ? (
                                    <div className="flex items-center gap-1.5 animate-in fade-in duration-300 translate-x-0 group-hover:scale-[1.02] origin-right transition-transform">
                                        <input
                                            type="time"
                                            value={hour.openTime}
                                            onChange={e => updateHour(index, 'openTime', e.target.value)}
                                            className="w-[72px] h-8 text-xs font-bold border-gray-200 dark:border-zinc-800 rounded-md px-2 focus:ring-2 ring-blue-500/20 bg-white dark:bg-zinc-900 text-center shadow-sm"
                                        />
                                        <span className="text-[10px] text-gray-300 font-black px-0.5">/</span>
                                        <input
                                            type="time"
                                            value={hour.closeTime}
                                            onChange={e => updateHour(index, 'closeTime', e.target.value)}
                                            className="w-[72px] h-8 text-xs font-bold border-gray-200 dark:border-zinc-800 rounded-md px-2 focus:ring-2 ring-blue-500/20 bg-white dark:bg-zinc-900 text-center shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black uppercase text-gray-200 dark:text-zinc-800 tracking-[0.1em] pointer-events-none">Inactive</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            <div className="flex items-center justify-end gap-4 pt-10 border-t">
                <Button variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveLocal} disabled={loading} size="lg" className="px-14 h-12 bg-blue-600 hover:bg-blue-700 font-bold">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Schedule
                </Button>
            </div>
        </div>
    )
}

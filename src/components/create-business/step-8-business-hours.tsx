"use client"

import { useEffect } from "react"
import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS = [
    { id: "Mo", name: "Monday", shortName: "Mon" },
    { id: "Tu", name: "Tuesday", shortName: "Tue" },
    { id: "We", name: "Wednesday", shortName: "Wed" },
    { id: "Th", name: "Thursday", shortName: "Thu" },
    { id: "Fr", name: "Friday", shortName: "Fri" },
    { id: "Sa", name: "Saturday", shortName: "Sat" },
    { id: "Su", name: "Sunday", shortName: "Sun" },
]

interface DayHours {
    day: string
    isOpen: boolean
    openTime: string
    closeTime: string
}

export function Step8BusinessHours() {
    const { data, updateData } = useWizard()

    console.log('🕐 [Step8BusinessHours] Component rendered')
    console.log('🕐 [Step8BusinessHours] Current data.businessHours:', JSON.stringify(data.businessHours, null, 2))

    // Use useEffect to initialize businessHours only once on mount if it's not already set
    useEffect(() => {
        if (!data.businessHours || data.businessHours.length === 0) {
            console.log('🕐 [useEffect] Initializing default business hours...')
            // Default: Mon-Fri 9AM-5PM, closed weekends
            const defaultHours = DAYS.map(day => ({
                day: day.id,
                isOpen: !['Sa', 'Su'].includes(day.id),
                openTime: "09:00",
                closeTime: "17:00"
            }))
            updateData({ businessHours: defaultHours })
            console.log('🕐 [useEffect] Default hours set:', JSON.stringify(defaultHours, null, 2))
        }
    }, []) // Empty dependency array - only run once on mount

    // Always use the hours directly from data, as they are initialized by useEffect or already exist
    const hours = data.businessHours || []

    console.log('🕐 [Step8BusinessHours] Final hours to render:', JSON.stringify(hours, null, 2))

    const updateDayHours = (dayId: string, updates: Partial<DayHours>) => {
        console.log('🕐 [updateDayHours] Updating day:', dayId, 'with updates:', updates)
        console.log('🕐 [updateDayHours] Current hours before update:', JSON.stringify(hours, null, 2))

        const newHours = hours.map(h =>
            h.day === dayId ? { ...h, ...updates } : h
        )

        console.log('🕐 [updateDayHours] New hours after update:', JSON.stringify(newHours, null, 2))
        updateData({ businessHours: newHours })
        console.log('🕐 [updateDayHours] Called updateData with new hours')
    }

    const applyToAll = () => {
        console.log('🕐 [applyToAll] Applying first day hours to all open days')
        const firstOpenDay = hours.find(h => h.isOpen)
        if (!firstOpenDay) {
            console.log('🕐 [applyToAll] No open day found, aborting')
            return
        }

        console.log('🕐 [applyToAll] First open day:', firstOpenDay)
        const newHours = hours.map(h => ({
            ...h,
            openTime: firstOpenDay.openTime,
            closeTime: firstOpenDay.closeTime
        }))

        console.log('🕐 [applyToAll] New hours:', JSON.stringify(newHours, null, 2))
        updateData({ businessHours: newHours })
        console.log('🕐 [applyToAll] Called updateData with new hours')
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">Business Hours</Label>
                <p className="text-sm text-gray-500 mt-1">
                    Set your operating hours for Google Business Profile
                </p>
            </div>

            <div className="space-y-3">
                {hours.map((dayHours, idx) => {
                    const dayInfo = DAYS.find(d => d.id === dayHours.day)
                    return (
                        <div
                            key={dayHours.day}
                            className={cn(
                                "p-4 border rounded-lg transition-colors",
                                dayHours.isOpen
                                    ? "bg-white dark:bg-zinc-900"
                                    : "bg-gray-50 dark:bg-zinc-900/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {/* Day name and toggle */}
                                <div className="flex items-center gap-3 min-w-[100px]">
                                    <Switch
                                        checked={dayHours.isOpen}
                                        onCheckedChange={(checked: boolean) =>
                                            updateDayHours(dayHours.day, { isOpen: checked })
                                        }
                                    />
                                    <span className={cn(
                                        "font-medium text-sm",
                                        dayHours.isOpen ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
                                    )}>
                                        {dayInfo?.shortName}
                                    </span>
                                </div>

                                {/* Time inputs */}
                                {dayHours.isOpen ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <Input
                                                type="time"
                                                value={dayHours.openTime}
                                                onChange={(e) =>
                                                    updateDayHours(dayHours.day, { openTime: e.target.value })
                                                }
                                                className="w-28 bg-white dark:bg-zinc-900"
                                            />
                                        </div>
                                        <span className="text-gray-500 text-sm">to</span>
                                        <Input
                                            type="time"
                                            value={dayHours.closeTime}
                                            onChange={(e) =>
                                                updateDayHours(dayHours.day, { closeTime: e.target.value })
                                            }
                                            className="w-28 bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">Closed</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                type="button"
                onClick={applyToAll}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
                Apply first day&apos;s hours to all open days
            </button>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Tip:</strong> These hours will be used for Google Business Profile integration and displayed to customers.
                </p>
            </div>
        </div>
    )
}

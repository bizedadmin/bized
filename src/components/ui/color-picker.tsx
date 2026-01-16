"use client"

import { forwardRef, useMemo, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Paintbrush, Pipette } from "lucide-react"

declare global {
    interface Window {
        EyeDropper?: {
            new(): {
                open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>
            }
        }
    }
}

interface ColorPickerProps {
    value: string
    onChange: (value: string) => void
    className?: string
    presets?: { name: string; value: string }[]
}

export function ColorPicker({ value, onChange, className, presets }: ColorPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="w-full flex items-center gap-2">
                        {value ? (
                            <div
                                className="h-4 w-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: value }}
                            />
                        ) : (
                            <Paintbrush className="h-4 w-4" />
                        )}
                        <div className="truncate flex-1">
                            {value ? value : "Pick a color"}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-4">
                    <HexColorPicker color={value} onChange={onChange} />
                    <div className="flex gap-2 items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Hex</span>
                        <div className="flex items-center gap-2">
                            <Input
                                maxLength={7}
                                onChange={(e) => {
                                    onChange(e.currentTarget.value)
                                }}
                                value={value}
                                className="w-24 h-8 font-mono text-xs uppercase"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={async () => {
                                    if (!window.EyeDropper) return;
                                    try {
                                        const eyeDropper = new window.EyeDropper();
                                        const result = await eyeDropper.open();
                                        onChange(result.sRGBHex);
                                    } catch (e) {
                                        // console.log(e);
                                    }
                                }}
                                title="Pick color from screen"
                                disabled={typeof window !== "undefined" && !window.EyeDropper}
                                type="button"
                            >
                                <Pipette className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    {presets && (
                        <div className="space-y-1.5">
                            <div className="text-xs font-medium text-gray-500">Presets</div>
                            <div className="flex flex-wrap gap-2">
                                {presets.map((preset) => (
                                    <div
                                        key={preset.value}
                                        className={cn(
                                            "h-6 w-6 rounded-md border cursor-pointer active:scale-95 transition-all text-xs flex items-center justify-center",
                                            value === preset.value ? "border-black dark:border-white ring-2 ring-offset-1 ring-gray-400" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: preset.value }}
                                        onClick={() => onChange(preset.value)}
                                        title={preset.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Search, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { COUNTRIES, Country } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface CountrySelectorProps {
    value: string;
    onChange: (country: Country) => void;
    trigger?: React.ReactNode;
}

export function CountrySelector({ value, onChange, trigger }: CountrySelectorProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dialCode.includes(search)
        )
    }, [search])

    const selectedCountry = useMemo(() => {
        return COUNTRIES.find(c => c.dialCode === value) || COUNTRIES.find(c => c.code === 'KE')
    }, [value])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="h-16 flex items-center gap-3 px-4 rounded-2xl bg-background/50 border border-border/60 hover:bg-muted/50 transition-all font-bold">
                        <div className="relative w-6 h-4 overflow-hidden rounded-sm shadow-sm ring-1 ring-border/20">
                            {selectedCountry && (
                                <Image
                                    src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                                    alt={selectedCountry.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <span className="text-lg">{selectedCountry?.dialCode}</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[2rem] border-border/40">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold tracking-tight">Select Country</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search country or code..."
                            className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto px-2 pb-4 space-y-1">
                    {filteredCountries.map((country) => (
                        <button
                            key={country.code}
                            onClick={() => {
                                onChange(country)
                                setOpen(false)
                                setSearch("")
                            }}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-muted group",
                                country.dialCode === value ? "bg-primary/5 text-primary" : "text-foreground/70"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-6 h-4 overflow-hidden rounded-sm shadow-sm ring-1 ring-border/10 flex-shrink-0">
                                    <Image
                                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                        alt={country.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-bold text-sm truncate max-w-[200px]">{country.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{country.dialCode}</span>
                                </div>
                            </div>
                            {country.dialCode === value && (
                                <Check className="w-4 h-4" strokeWidth={3} />
                            )}
                        </button>
                    ))}
                    {filteredCountries.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-sm font-medium">
                            No countries found matching &quot;{search}&quot;
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

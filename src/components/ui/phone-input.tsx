"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { COUNTRIES, Country } from "@/lib/countries"

interface PhoneInputProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    id?: string
}

export function PhoneInput({ value, onChange, disabled, id }: PhoneInputProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(COUNTRIES[0])
    const [phoneNumber, setPhoneNumber] = React.useState("")
    const [search, setSearch] = React.useState("")

    // Initialize from value or Auto-detect
    React.useEffect(() => {
        if (value) {
            // Try to find matching country dial code
            const country = COUNTRIES.find(c => value.startsWith(c.dialCode))
            if (country) {
                setSelectedCountry(country)
                setPhoneNumber(value.replace(country.dialCode, ""))
            } else {
                setPhoneNumber(value)
            }
        } else {
            // Auto Detect
            fetch("https://ipapi.co/json/")
                .then(res => res.json())
                .then(data => {
                    if (data && data.country_code) {
                        const detected = COUNTRIES.find(c => c.code === data.country_code)
                        if (detected) {
                            setSelectedCountry(detected)
                        }
                    }
                })
                .catch(err => console.error("Failed to detect country", err))
        }
    }, [])

    // Update parent when country or number changes
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = e.target.value.replace(/[^0-9]/g, "") // Allow digits only
        setPhoneNumber(num)
        onChange(`${selectedCountry.dialCode}${num}`)
    }

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country)
        setOpen(false)
        setSearch("")
        onChange(`${country.dialCode}${phoneNumber}`)
    }

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[140px] justify-between px-3"
                        disabled={disabled}
                    >
                        <span className="flex items-center gap-2 truncate">
                            <span className="text-lg">{selectedCountry.flag}</span>
                            <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredCountries.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No country found.
                            </div>
                        ) : (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    onClick={() => handleCountrySelect(country)}
                                    className={cn(
                                        "w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                        selectedCountry.code === country.code && "bg-accent/50"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCountry.code === country.code
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="flex-1 text-left">{country.name}</span>
                                    <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                                </button>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <Input
                id={id}
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={handleNumberChange}
                disabled={disabled}
                className="flex-1 font-mono"
            />
        </div>
    )
}

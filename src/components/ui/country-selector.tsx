"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import * as Flags from "country-flag-icons/react/3x2"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const countries = [
    { value: "KE", label: "Kenya", Flag: Flags.KE },
    { value: "UG", label: "Uganda", Flag: Flags.UG },
    { value: "TZ", label: "Tanzania", Flag: Flags.TZ },
    { value: "RW", label: "Rwanda", Flag: Flags.RW },
    { value: "NG", label: "Nigeria", Flag: Flags.NG },
    { value: "ZA", label: "South Africa", Flag: Flags.ZA },
    { value: "US", label: "United States", Flag: Flags.US },
    { value: "GB", label: "United Kingdom", Flag: Flags.GB },
    { value: "CA", label: "Canada", Flag: Flags.CA },
    { value: "AU", label: "Australia", Flag: Flags.AU },
    { value: "IN", label: "India", Flag: Flags.IN },
    { value: "CN", label: "China", Flag: Flags.CN },
    { value: "DE", label: "Germany", Flag: Flags.DE },
    { value: "FR", label: "France", Flag: Flags.FR },
    { value: "AE", label: "UAE", Flag: Flags.AE },
]

interface CountrySelectorProps {
    value: string
    onChange: (value: string) => void
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false)

    // Map incoming full country name to code if possible, essentially reverse lookup
    // OR assume 'value' passed in IS the country name "Kenya", we need to find code "KE" to show flag.
    // The dialog was storing "Kenya" (string).
    // Let's iterate to find matching label.
    const selectedCountry = countries.find((country) => country.label === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedCountry ? (
                        <div className="flex items-center gap-2">
                            <selectedCountry.Flag className="w-5 h-4 rounded-sm object-cover" />
                            {selectedCountry.label}
                        </div>
                    ) : (
                        value || "Select country..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={country.label}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <country.Flag className="mr-2 w-5 h-4 rounded-sm object-cover" />
                                    {country.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === country.label ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

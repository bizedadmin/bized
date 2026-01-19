"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const currencies = [
    { value: "KES", label: "Kenyan Shilling (KES)", symbol: "KSh" },
    { value: "USD", label: "US Dollar (USD)", symbol: "$" },
    { value: "EUR", label: "Euro (EUR)", symbol: "€" },
    { value: "GBP", label: "British Pound (GBP)", symbol: "£" },
    { value: "NGN", label: "Nigerian Naira (NGN)", symbol: "₦" },
    { value: "ZAR", label: "South African Rand (ZAR)", symbol: "R" },
    { value: "GHS", label: "Ghanaian Cedi (GHS)", symbol: "₵" },
    { value: "UGX", label: "Ugandan Shilling (UGX)", symbol: "USh" },
    { value: "TZS", label: "Tanzanian Shilling (TZS)", symbol: "TSh" },
    { value: "RWF", label: "Rwandan Franc (RWF)", symbol: "FRw" },
    { value: "AED", label: "United Arab Emirates Dirham (AED)", symbol: "د.إ" },
    { value: "CAD", label: "Canadian Dollar (CAD)", symbol: "C$" },
    { value: "AUD", label: "Australian Dollar (AUD)", symbol: "A$" },
    { value: "INR", label: "Indian Rupee (INR)", symbol: "₹" },
    { value: "CNY", label: "Chinese Yuan (CNY)", symbol: "¥" },
    { value: "JPY", label: "Japanese Yen (JPY)", symbol: "¥" },
]

interface CurrencySelectorProps {
    value?: string
    onChange: (value: string) => void
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const selectedCurrency = currencies.find((c) => c.value === value) || currencies[0]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {selectedCurrency.symbol}
                        </span>
                        {selectedCurrency.label}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-[400px]">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Select Currency</DialogTitle>
                </DialogHeader>
                <Command className="rounded-t-none">
                    <CommandInput placeholder="Search currency..." />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                            {currencies.map((currency) => (
                                <CommandItem
                                    key={currency.value}
                                    value={currency.label}
                                    onSelect={() => {
                                        onChange(currency.value)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between py-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                                            {currency.symbol}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{currency.label}</span>
                                            <span className="text-xs text-muted-foreground">{currency.value}</span>
                                        </div>
                                    </div>
                                    {value === currency.value && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

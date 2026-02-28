
import React, { useState, useMemo } from "react";
import { Search, X, Check, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (country: Country) => void;
    selectedName?: string;
}

export function CountryModal({ isOpen, onClose, onSelect, selectedName }: CountryModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[2.5rem] shadow-2xl border border-[var(--color-outline-variant)]/10 overflow-hidden flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight">Select Country</h3>
                            <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60 uppercase font-bold tracking-wider">Global Locations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-[var(--color-surface-container-high)] flex items-center justify-center transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={18} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search countries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
                    {filteredCountries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                            {filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    onClick={() => onSelect(country)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                                        selectedName === country.name
                                            ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                                            : "hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                            {country.flag}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm leading-tight">{country.name}</div>
                                            <div className="text-[11px] opacity-60 font-mono uppercase">{country.code}</div>
                                        </div>
                                    </div>
                                    {selectedName === country.name && (
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-md">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-4 opacity-20">
                                <Search size={32} />
                            </div>
                            <p className="text-[var(--color-on-surface-variant)] opacity-60 font-medium">No countries found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-[var(--color-surface-container-low)] text-center border-t border-[var(--color-outline-variant)]/10">
                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 font-medium tracking-tight">
                        Country selection affects regional settings and available tax rates.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

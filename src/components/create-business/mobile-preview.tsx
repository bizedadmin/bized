"use client"

import { useWizard, WizardData } from "./wizard-context"
import { Search, ShoppingBag, Menu } from "lucide-react"

interface MobilePreviewProps {
    data?: Partial<WizardData>
}

export function MobilePreview({ data: propData }: MobilePreviewProps = {}) {
    // Use prop data if provided, otherwise try wizard context
    const wizardContext = useWizard()
    const data = (propData || wizardContext.data) as WizardData

    return (
        <div className="w-[375px] h-[750px] bg-white dark:bg-zinc-950 rounded-[40px] shadow-2xl border-[8px] border-white dark:border-zinc-800 overflow-hidden flex flex-col relative">
            {/* App Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="flex gap-4">
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
            </div>

            {/* ScrollArea */}
            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                {/* Hero / Brand Section */}
                <div className="relative">
                    {/* Banner with secondary color */}
                    <div
                        className="h-28 w-full"
                        style={{ backgroundColor: data.secondaryColor || "#f3f4f6" }}
                    />

                    <div className="px-5 pb-6">
                        {/* Logo Avatar - positioned to overlap banner */}
                        <div className="-mt-10 mb-3 flex justify-between items-end">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-zinc-950"
                                style={{ backgroundColor: data.themeColor }}
                            >
                                {data.name.substring(0, 1).toUpperCase() || "S"}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            {data.name || "Store Name"}
                        </h2>
                        {data.slug && (
                            <p className="text-sm text-gray-500 mt-1">@{data.slug}</p>
                        )}
                    </div>
                </div>

                {/* Welcome Section with Action Buttons */}
                <div className="px-5 py-6 space-y-4">
                    <p className="text-center text-gray-900 dark:text-white leading-relaxed">
                        Welcome to my website! Here you can request a quote from me. I look forward to hearing from you!
                    </p>

                    <div className="space-y-3">
                        {(data.showBookNow !== false) && (
                            <button
                                className="w-full py-4 rounded-full text-white font-medium shadow-lg transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: data.buttonColor || data.themeColor }}
                            >
                                Book now
                            </button>
                        )}

                        {(data.showShopNow !== false) && (
                            <button
                                className="w-full py-4 rounded-full text-white font-medium shadow-lg transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: data.buttonColor || data.themeColor }}
                            >
                                Shop now
                            </button>
                        )}

                        {(data.showQuoteRequest !== false) && (
                            <button
                                className="w-full py-4 rounded-full text-white font-medium shadow-lg transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: data.buttonColor || data.themeColor }}
                            >
                                Quote request
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="p-4">
                    {data.products && data.products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {data.products.map((product, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="aspect-square w-full bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="text-sm font-medium truncate">{product.name}</div>
                                    {product.type === "service" && (
                                        <div className="text-xs text-blue-600">Service</div>
                                    )}
                                    <div className="text-sm font-bold" style={{ color: data.themeColor }}>
                                        ${product.offers.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="h-4 w-1/3 bg-gray-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="aspect-square w-full bg-gray-100 dark:bg-zinc-800 rounded-xl" />
                                        <div className="h-3 w-3/4 bg-gray-100 dark:bg-zinc-800 rounded-full" />
                                        <div className="h-3 w-1/2 bg-gray-100 dark:bg-zinc-800 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

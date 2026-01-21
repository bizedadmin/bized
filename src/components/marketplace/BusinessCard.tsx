import { Star, MapPin, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Business {
    _id: string
    name: string
    slug: string
    description?: string
    logo?: string
    image?: string
    address?: string
    industry?: string
    rating?: number
    reviewCount?: number
}

export function BusinessCard({ business }: { business: Business }) {
    return (
        <Link href={`/${business.slug}`} className="block h-full group">
            <Card className="h-full border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-row">
                {/* Left: Image */}
                <div className="w-1/3 sm:w-2/5 relative bg-gray-100 dark:bg-zinc-800">
                    {business.image ? (
                        <img
                            src={business.image}
                            alt={business.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl font-black text-gray-200 dark:text-zinc-700 uppercase">
                            {business.name.substring(0, 2)}
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <div className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-gray-900">{business.rating || "5.0"}</span>
                            {business.reviewCount && (
                                <span className="text-[10px] text-gray-500 font-medium">({business.reviewCount})</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-[10px] font-bold uppercase tracking-wide mb-2 line-clamp-1 w-fit">
                                {business.industry || "Business"}
                            </Badge>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {business.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                            {business.description || "Premium services available for booking."}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{business.address || "Online"}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <button className="text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                            Chat on WhatsApp
                        </button>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

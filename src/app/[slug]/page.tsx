import { notFound } from 'next/navigation'
import dbConnect from '@/lib/db'
import Business from '@/models/Business'
import { ShoppingBag, Phone, MapPin, Clock } from 'lucide-react'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function BusinessPage({ params }: PageProps) {
    const { slug } = await params

    await dbConnect()
    const business = await Business.findOne({ slug }).lean()

    if (!business) {
        notFound()
    }

    // Format business hours for display
    const formatBusinessHours = (hours: any[]) => {
        if (!hours || hours.length === 0) return null

        const openDays = hours.filter(h => h.isOpen)
        if (openDays.length === 0) return "Hours not set"

        return openDays.map(h => `${h.day}: ${h.openTime}-${h.closeTime}`).join(', ')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div
                className="h-48 w-full relative"
                style={{ backgroundColor: business.secondaryColor || '#f3f4f6' }}
            >
                <div className="absolute -bottom-16 left-8">
                    <div
                        className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl ring-4 ring-white"
                        style={{ backgroundColor: business.themeColor || '#1f2937' }}
                    >
                        {business.name.substring(0, 1).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Business Info */}
            <div className="max-w-6xl mx-auto px-8 pt-20 pb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{business.name}</h1>
                    <p className="text-gray-600">@{business.slug}</p>
                    {business.industry && (
                        <p className="text-sm text-gray-500 mt-1">{business.industry}</p>
                    )}
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-12">
                    {business.phone && (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{business.phone.code} {business.phone.number}</p>
                            </div>
                        </div>
                    )}

                    {business.businessHours && business.businessHours.length > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Hours</p>
                                <p className="font-medium text-sm">{formatBusinessHours(business.businessHours)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Products */}
                {business.products && business.products.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Products & Services</h2>
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {business.products.map((product: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                        {product.category && (
                                            <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                                        )}
                                        {product.description && (
                                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                        )}
                                        <p
                                            className="text-lg font-bold"
                                            style={{ color: business.themeColor || '#1f2937' }}
                                        >
                                            ${product.price.toFixed(2)}
                                        </p>
                                        {product.type === 'service' && (
                                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                Service
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* WhatsApp Contact */}
                {business.whatsappConnected && business.whatsappNumber && (
                    <div className="mt-12 p-6 bg-green-50 rounded-xl border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-2">Contact us on WhatsApp</h3>
                        <a
                            href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            Chat on WhatsApp
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

import Image from "next/image"

export function TrustRow() {
    return (
        <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder svgs for logos - in a real app these would be actual assets */}
            <div className="flex items-center gap-2 font-bold text-lg text-gray-500">
                <span className="text-2xl">G</span> Google Places
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-500">
                <span className="text-2xl">∞</span> Meta Business
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-500">
                <span className="text-2xl">M</span> MongoDB
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-500">
                <span className="text-2xl">☁️</span> Google Cloud
            </div>
        </div>
    )
}

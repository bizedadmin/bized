
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessListingCardProps {
    business: {
        _id: string;
        name: string;
        slug: string;
        logo?: string;
        image?: string;
        industry?: string;
        description?: string;
        address?: {
            addressLocality?: string;
            addressRegion?: string;
            addressCountry?: string;
        };
        rating?: number;
        reviewCount?: number;
        // Mock data for services since it's not in the main schema yet for search
        services?: Array<{ name: string; price: number; duration: string }>;
    };
}

export function BusinessListingCard({ business }: BusinessListingCardProps) {
    // Generate mock services if none exist, just for the UI demo
    const services = business.services || [
        { name: "Consultation", price: 50, duration: "30min" },
        { name: "Standard Service", price: 120, duration: "1h" },
        { name: "Premium Package", price: 250, duration: "2h" },
    ].slice(0, 2);

    const locationString = [
        business.address?.addressLocality,
        business.address?.addressRegion
    ].filter(Boolean).join(", ");

    return (
        <Link href={`/${business.slug}`} className="block group h-full">
            <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 border-border/40 group-hover:border-primary/20 bg-card rounded-xl">
                {/* Image Section */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-muted overflow-hidden">
                    {business.image ? (
                        <img
                            src={business.image}
                            alt={business.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                            <span className="text-4xl text-gray-300 dark:text-zinc-700 font-bold opacity-50">
                                {business.name.charAt(0)}
                            </span>
                        </div>
                    )}

                    {/* Rating Badge - Top Left */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm text-xs font-bold text-foreground">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{business.rating || "New"}</span>
                        {business.reviewCount ? (
                            <span className="text-muted-foreground font-normal">({business.reviewCount})</span>
                        ) : null}
                    </div>

                    {/* Like/Heart Button could go top right */}
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-4 flex flex-col gap-3">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                {business.name}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {locationString || "Location available on request"}
                        </p>
                    </div>

                    {/* Quick Services */}
                    <div className="mt-2 space-y-2 flex-1">
                        {services.map((service, index) => (
                            <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                <span className="text-foreground/90 font-medium truncate pr-2">{service.name}</span>
                                <div className="flex items-center gap-3 whitespace-nowrap">
                                    <span className="text-muted-foreground text-xs">{service.duration}</span>
                                    <span className="font-semibold text-primary">${service.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action */}
                    <div className="mt-2 pt-2">
                        <Button className="w-full bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary border-0 rounded-lg h-9 font-semibold text-sm transition-colors" variant="outline">
                            Book Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

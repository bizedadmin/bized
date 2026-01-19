import { notFound } from 'next/navigation'
import dbConnect from '@/lib/db'
import Business from '@/models/Business'
import User from '@/models/User'
import Product from '@/models/Product'
import Service from '@/models/Service'
import { BusinessProfile } from '@/components/business/business-profile'

interface PageProps {
    params: Promise<{ slug: string; pageSlug: string }>
}

export default async function SlugSubPage({ params }: PageProps) {
    const { slug, pageSlug } = await params

    await dbConnect()

    // First try to find a business
    let profileData: any = await Business.findOne({ slug }).lean()
    let products: any[] = []
    let services: any[] = []

    if (profileData) {
        products = await Product.find({ business: profileData._id }).lean()
        services = await Service.find({ business: profileData._id }).lean()
    } else {
        // If no business, try to find a user
        profileData = await User.findOne({ slug }).lean()
        if (!profileData) {
            notFound()
        }
    }

    // Check if the page exists
    const page = profileData.pages?.find((p: any) => p.slug === pageSlug)
    if (!page || !page.enabled) {
        notFound()
    }

    // Serialize data
    const plainProfile = JSON.parse(JSON.stringify(profileData))
    const plainProducts = JSON.parse(JSON.stringify(products))
    const plainServices = JSON.parse(JSON.stringify(services))

    return (
        <BusinessProfile
            business={plainProfile}
            products={plainProducts}
            services={plainServices}
            pageType={page.type}
        />
    )
}

import { notFound } from 'next/navigation'
import dbConnect from '@/lib/db'
import Business from '@/models/Business'
import Product from '@/models/Product'
import Service from '@/models/Service'
import { BusinessProfile } from '@/components/business/business-profile'

interface PageProps {
    params: Promise<{ slug: string; pageSlug: string }>
}

export default async function BusinessSubPage({ params }: PageProps) {
    const { slug, pageSlug } = await params

    await dbConnect()
    const business = await Business.findOne({ slug }).lean()

    if (!business) {
        notFound()
    }

    // Check if the page exists in the business's pages array
    const page = business.pages?.find((p: any) => p.slug === pageSlug)
    if (!page || !page.enabled) {
        notFound()
    }

    // Fetch products
    const products = await Product.find({ business: business._id }).lean()
    const services = await Service.find({ business: business._id }).lean()

    // Serialize data
    const plainBusiness = JSON.parse(JSON.stringify(business))
    const plainProducts = JSON.parse(JSON.stringify(products))
    const plainServices = JSON.parse(JSON.stringify(services))

    return (
        <BusinessProfile
            business={plainBusiness}
            products={plainProducts}
            services={plainServices}
            pageType={page.type}
        />
    )
}

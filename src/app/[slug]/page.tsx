import { notFound } from 'next/navigation'
import dbConnect from '@/lib/db'
import Business from '@/models/Business'
import Product from '@/models/Product'
import Service from '@/models/Service'
import { BusinessStorefront } from '@/components/business/business-storefront'


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

    // Fetch products
    const products = await Product.find({ business: business._id }).lean()
    const services = await Service.find({ business: business._id }).lean()

    // Serialize data
    const plainBusiness = JSON.parse(JSON.stringify(business))
    const plainProducts = JSON.parse(JSON.stringify(products))
    const plainServices = JSON.parse(JSON.stringify(services))

    return <BusinessStorefront business={plainBusiness} products={plainProducts} services={plainServices} />
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';

        await dbConnect();

        let filter: any = { isDraft: { $ne: true } };

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { industry: { $regex: query, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            filter.industry = category;
        }

        const location = searchParams.get('location') || '';
        if (location) {
            // If we already have a query filter (which uses $or), we need to wrap everything in an $and
            if (filter.$or) {
                filter = {
                    $and: [
                        { isDraft: { $ne: true } },
                        { $or: filter.$or },
                        {
                            $or: [
                                { 'address.addressLocality': { $regex: location, $options: 'i' } },
                                { 'address.addressRegion': { $regex: location, $options: 'i' } },
                                { 'address.addressCountry': { $regex: location, $options: 'i' } }
                            ]
                        }
                    ]
                };

                // If we had other top-level filters like 'industry', we would need to preserve them too.
                // But simplistically re-constructing:
                if (category && category !== 'All') {
                    // The previous logic set filter.industry directly.
                    // The $and above overwrites `filter`.
                    // Let's do it cleanly:
                    delete filter.industry; // Remove simple property if it existed (though we overwrote filter)
                    (filter.$and as any[]).push({ industry: category });
                }

            } else {
                // No query $or, just location
                filter.$or = [
                    { 'address.addressLocality': { $regex: location, $options: 'i' } },
                    { 'address.addressRegion': { $regex: location, $options: 'i' } },
                    { 'address.addressCountry': { $regex: location, $options: 'i' } }
                ];
            }
        }

        const businesses = await Business.find(filter)
            .select('name slug logo industry description themeColor image')
            .sort({ createdAt: -1 })
            .limit(24);

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Error in marketplace search:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

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

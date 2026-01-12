import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const severity = searchParams.get('severity') || 'ALL';
        const userEmail = searchParams.get('userEmail') || 'ALL';
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        await dbConnect();

        const query: any = {};

        // Filter by Severity
        if (severity && severity !== 'ALL') {
            query.severity = severity;
        }

        // Filter by User Email
        if (userEmail && userEmail !== 'ALL') {
            query['actor.email'] = userEmail;
        }

        // Filter by Date Range
        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        // Search (Actor Email or Action Type)
        if (search) {
            query.$or = [
                { 'actor.email': { $regex: search, $options: 'i' } },
                { 'action.type': { $regex: search, $options: 'i' } },
                { 'event_id': search }
            ];
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return NextResponse.json({
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

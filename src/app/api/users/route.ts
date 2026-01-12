import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditService } from '@/lib/audit';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || 'ALL';
        const status = searchParams.get('status') || 'ALL';
        const sessionStatus = searchParams.get('session') || 'ALL';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        await dbConnect();

        // Build Query
        const andFilters: any[] = [];

        if (search) {
            andFilters.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (role !== 'ALL') {
            andFilters.push({ role });
        }

        if (status !== 'ALL') {
            if (status === 'active') {
                andFilters.push({
                    $or: [
                        { status: 'active' },
                        { status: { $exists: false } }
                    ]
                });
            } else {
                andFilters.push({ status });
            }
        }

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (sessionStatus === 'online') {
            andFilters.push({ lastActive: { $gte: fifteenMinutesAgo } });
        } else if (sessionStatus === 'offline') {
            andFilters.push({
                $or: [
                    { lastActive: { $lt: fifteenMinutesAgo } },
                    { lastActive: { $exists: false } }
                ]
            });
        }

        const query = andFilters.length > 0 ? { $and: andFilters } : {};

        // Fetch paginated data
        const [users, totalFiltered] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v'),
            User.countDocuments(query)
        ]);

        // Statistics
        const stats = {
            total: await User.countDocuments(),
            active: await User.countDocuments({ status: 'active' }),
            admins: await User.countDocuments({ role: 'admin' }),
            today: await User.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        };

        // AUDIT LOG: Admin Accessing User List (only if not an internal automated fetch)
        if (!searchParams.get('silent')) {
            await AuditService.log({
                actor: {
                    id: session.user.id,
                    email: session.user.email || 'unknown',
                    role: session.user.role,
                    ip,
                    user_agent: userAgent
                },
                action: {
                    type: 'USER_LIST_VIEW',
                    description: `Admin searched user list (Filter: ${role}/${status}, Search: ${search}, Page: ${page})`,
                },
                status: 'SUCCESS',
                severity: 'INFO'
            });
        }

        return NextResponse.json({
            data: users,
            stats,
            pagination: {
                total: totalFiltered,
                pages: Math.ceil(totalFiltered / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, ...updates } = await request.json();

        await dbConnect();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const before = user.toObject();

        // Update fields
        if (updates.role) user.role = updates.role;
        if (updates.status) user.status = updates.status;

        await user.save();

        // Audit Log
        await AuditService.log({
            actor: {
                id: session.user.id,
                email: session.user.email || 'unknown',
                role: session.user.role,
            },
            action: {
                type: 'USER_ROLE_UPDATE',
                description: `Admin updated user ${user.email}`,
            },
            resource: { type: 'User', id: user._id.toString() },
            metadata: {
                changes: AuditService.diff(before, user.toObject())
            },
            severity: updates.role === 'admin' ? 'CRITICAL' : 'INFO'
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

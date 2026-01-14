import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore - We know accessToken exists because we added it to the session type in auth.ts
        const accessToken = session.accessToken;

        if (!accessToken) {
            return NextResponse.json({ message: 'No access token found. Please reconnect Google Account.' }, { status: 401 });
        }

        // 1. Get the Account ID
        const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!accountsRes.ok) {
            const errorText = await accountsRes.text();
            console.error('Google API Error (Accounts):', {
                status: accountsRes.status,
                statusText: accountsRes.statusText,
                body: errorText
            });

            return NextResponse.json({
                message: 'Failed to fetch Google Accounts. Ensure API Access is approved.',
                details: errorText
            }, { status: accountsRes.status });
        }

        const accountsData = await accountsRes.json();
        const account = accountsData.accounts && accountsData.accounts.length > 0 ? accountsData.accounts[0] : null;

        if (!account) {
            return NextResponse.json({ message: 'No Google Business Profile account found.' }, { status: 404 });
        }

        // 2. Get Locations for that Account and include regularHours in readMask
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storeCode,phoneNumbers,websiteUri,formattedAddress,regularHours`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!locationsRes.ok) {
            const error = await locationsRes.text();
            console.error('Google API Error (Locations):', error);
            return NextResponse.json({ message: 'Failed to fetch Locations', details: error }, { status: locationsRes.status });
        }

        const locationsData = await locationsRes.json();
        const locations = locationsData.locations || [];

        if (locations.length === 0) {
            return NextResponse.json({ message: 'No locations found in this account.' }, { status: 404 });
        }

        const location = locations[0];

        // 3. Map Business Hours if available
        let mappedHours = null;
        if (location.regularHours && location.regularHours.periods) {
            const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            mappedHours = DAYS.map(day => {
                const period = location.regularHours.periods.find((p: any) => p.openDay === day.toUpperCase());
                if (period) {
                    return {
                        day,
                        isOpen: true,
                        openTime: period.openTime || "09:00",
                        closeTime: period.closeTime || "17:00"
                    };
                }
                return { day, isOpen: false, openTime: "09:00", closeTime: "17:00" };
            });
        }

        // 4. Update the database with all synced data
        await dbConnect();

        const updateData: any = {
            lastGoogleSync: new Date(),
            name: location.title,
            telephone: location.phoneNumbers?.primaryPhone,
            url: location.websiteUri,
            address: { streetAddress: location.formattedAddress || 'Address not available' }
        };

        if (mappedHours) {
            updateData.businessHours = mappedHours;
        }

        await Business.findOneAndUpdate(
            { owner: session.user.id },
            { $set: updateData }
        );

        return NextResponse.json({
            googleId: location.name,
            name: location.title,
            phone: location.phoneNumbers?.primaryPhone,
            website: location.websiteUri,
            address: location.formattedAddress || 'Address not available',
            businessHours: mappedHours,
            lastGoogleSync: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

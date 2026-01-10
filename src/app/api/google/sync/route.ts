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

        // 2. Get Locations for that Account
        // Note: The account.name looks like "accounts/123456789"
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storeCode,phoneNumbers,websiteUri,formattedAddress`, {
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

        // Return the first location found (for now)
        // In the future, you might want to let the user select which location to sync
        const location = locations[0];

        // 3. Update the database with the last sync timestamp
        await dbConnect();
        await Business.findOneAndUpdate(
            { owner: session.user.id },
            { $set: { lastGoogleSync: new Date() } }
        );

        return NextResponse.json({
            googleId: location.name, // "locations/12345..."
            name: location.title,
            phone: location.phoneNumbers?.primaryPhone,
            website: location.websiteUri,
            // Address needs parsing slightly as Google returns a complex object sometimes, 
            // strictly requesting 'formattedAddress' via mask helps.
            address: location.formattedAddress || 'Address not available'
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

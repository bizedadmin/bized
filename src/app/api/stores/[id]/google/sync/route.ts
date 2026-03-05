import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";
import { logPlatformError } from "@/lib/errorReporter";

/**
 * POST /api/stores/[id]/google/sync
 * 
 * This endpoint performs the ACTUAL synchronization of business information
 * from the Bized database to the Google Business Profile API.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(id),
            ownerId: session.user.id,
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const { aiConfig, name, description, address, phone, website, socialLinks, openingHours } = store;
        const googleAccessToken = aiConfig?.googleAccessToken ? decrypt(aiConfig.googleAccessToken) : null;
        const googleRefreshToken = aiConfig?.googleRefreshToken ? decrypt(aiConfig.googleRefreshToken) : null;
        const googleApiKeyFallback = aiConfig?.googleApiKey ? decrypt(aiConfig.googleApiKey) : null;

        const locationName = socialLinks?.googleLocationName; // Format: locations/{locationId}

        if (!googleAccessToken && !googleApiKeyFallback) {
            return NextResponse.json({
                error: "Google Connection missing. Please 'Connect Official Google Account' first."
            }, { status: 400 });
        }

        if (!locationName) {
            return NextResponse.json({
                error: "Google Location ID missing. Please provide your Google Business Profile Location ID."
            }, { status: 400 });
        }

        try {
            const authClient = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            authClient.setCredentials({
                access_token: googleAccessToken || googleApiKeyFallback,
                refresh_token: googleRefreshToken,
                expiry_date: aiConfig?.googleTokenExpiry
            });

            const gbp = google.mybusinessbusinessinformation({
                version: 'v1',
                auth: authClient
            });

            // Map Bized Hours to Google Hours
            let googlePeriods: any[] = [];
            if (openingHours) {
                try {
                    const localHours = JSON.parse(openingHours);
                    const daysMap: Record<string, string> = {
                        monday: 'MONDAY', tuesday: 'TUESDAY', wednesday: 'WEDNESDAY',
                        thursday: 'THURSDAY', friday: 'FRIDAY', saturday: 'SATURDAY', sunday: 'SUNDAY'
                    };

                    Object.entries(localHours).forEach(([day, schedule]: [string, any]) => {
                        if (!schedule.closed && schedule.open && schedule.close) {
                            const [oH, oM] = schedule.open.split(':').map(Number);
                            const [cH, cM] = schedule.close.split(':').map(Number);

                            googlePeriods.push({
                                openDay: daysMap[day],
                                openTime: { hours: oH, minutes: oM },
                                closeDay: daysMap[day],
                                closeTime: { hours: cH, minutes: cM }
                            });
                        }
                    });
                } catch (e) {
                    console.error("Error parsing openingHours:", e);
                }
            }

            const updatePayload: any = {
                title: name,
                storeCode: store.slug,
                profile: {
                    description: description
                },
                adWordsLocationExtensions: {
                    adPhone: phone
                }
            };

            if (googlePeriods.length > 0) {
                updatePayload.regularHours = { periods: googlePeriods };
            }

            // Perform the update
            const response = await gbp.locations.patch({
                name: locationName,
                updateMask: 'title,profile.description,adWordsLocationExtensions,storeCode' + (googlePeriods.length > 0 ? ',regularHours' : ''),
                requestBody: updatePayload
            });

            // Update the last sync time
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await db.collection("stores").updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        "socialLinks.google": timestamp,
                        updatedAt: new Date()
                    }
                }
            );

            return NextResponse.json({
                success: true,
                message: "Successfully synchronized with Google Business Profile",
                googleResponse: response.data,
                lastSynced: timestamp
            });

        } catch (googleError: any) {
            const errorMessage = googleError?.response?.data?.error?.message || "Google API authentication failed. Ensure your keys have Business Profile permissions.";
            console.error("Google API Sync Detail:", googleError?.response?.data || googleError.message);

            await logPlatformError({
                message: `GBP Sync Failed: ${errorMessage}`,
                error: googleError,
                route: `/api/stores/${id}/google/sync`,
                method: "POST",
                storeId: id,
                severity: "error",
                context: { googleResponse: googleError?.response?.data },
            });

            return NextResponse.json({
                error: errorMessage,
                details: googleError?.response?.data
            }, { status: 502 });
        }

    } catch (error: any) {
        console.error("Internal Sync Error:", error);
        await logPlatformError({
            message: `Internal Sync Error: ${error?.message || "Unknown"}`,
            error,
            route: `/api/stores/[id]/google/sync`,
            method: "POST",
            severity: "error",
        });
        return NextResponse.json({ error: "An unexpected error occurred during synchronization." }, { status: 500 });
    }
}

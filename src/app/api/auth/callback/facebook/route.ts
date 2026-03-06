import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { exchangeCodeForToken, getMetaUserProfile, getWabaAccounts, getWabaPhoneNumbers } from '@/lib/meta';
import { encrypt } from '@/lib/encryption';
import { initAdmin } from '@/lib/firebase-admin';

/**
 * Handle Meta OAuth Callback
 * Route: /api/auth/callback/facebook
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const oauthError = searchParams.get('error');
    const oauthErrorMsg = searchParams.get('error_description');

    // If Facebook returned an error directly (e.g. domain mismatch during redirect)
    if (oauthError) {
        return new NextResponse(
            `<html>
                <body>
                    <script>
                        window.opener.postMessage({ 
                            type: 'META_AUTH_COMPLETE', 
                            status: 'error', 
                            message: '${oauthErrorMsg || oauthError}' 
                        }, window.location.origin);
                        window.close();
                    </script>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    if (!code || !stateStr) {
        return new NextResponse(
            `<html>
                <body>
                    <script>
                        window.opener.postMessage({ 
                            type: 'META_AUTH_COMPLETE', 
                            status: 'error', 
                            message: 'Missing code or state parameters' 
                        }, window.location.origin);
                        window.close();
                    </script>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    try {
        const state = JSON.parse(decodeURIComponent(stateStr));
        const { intent, slug } = state;

        // Use the explicit app URL to ensure consistency with Meta's whitelisted URI
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.origin}`;
        const redirectUri = `${appUrl}/api/auth/callback/facebook`;

        console.log('Using redirectUri for exchange:', redirectUri);

        // Exchange code for token
        const tokenRes = await exchangeCodeForToken(code, redirectUri);
        const accessToken = tokenRes.access_token;

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection('users');

        if (intent === 'signup') {
            // Fetch profile and upsert user
            const profile = await getMetaUserProfile(accessToken);

            if (!profile.email) {
                console.error('Meta Auth: No email received from Meta. Aborting sign-in.');
                return new NextResponse(
                    `<html>
                        <body>
                            <script>
                                window.opener.postMessage({ 
                                    type: 'META_AUTH_COMPLETE', 
                                    status: 'error', 
                                    message: 'Your Meta account did not provide an email address. Please ensure the "Email" permission is granted in the Meta login prompt.' 
                                }, window.location.origin);
                                window.close();
                            </script>
                        </body>
                    </html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
            }

            const normalizedEmail = profile.email.toLowerCase().trim();
            console.log('Meta Auth: Starting sync for', normalizedEmail);

            // Find existing user by email (case-insensitive)
            const existingUser = await users.findOne({
                $or: [
                    { email: normalizedEmail },
                    { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }
                ]
            });

            if (existingUser) {
                console.log('Meta Auth: Found existing user, updating profile...');
                await users.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            metaId: profile.id,
                            image: profile.picture?.data?.url || existingUser.image,
                            name: profile.name || existingUser.name,
                            dateModified: new Date()
                        }
                    }
                );
            } else {
                console.log('Meta Auth: Creating new user...');
                const newUser = {
                    email: normalizedEmail,
                    name: profile.name,
                    image: profile.picture?.data?.url || '',
                    metaId: profile.id,
                    authId: `meta:${profile.id}`, // Failsafe for unique index on authId
                    dateCreated: new Date(),
                    dateModified: new Date(),
                    "@context": "https://schema.org",
                    "@type": "Person",
                    isSuperAdmin: false
                };
                await users.insertOne(newUser);
            }

            // Bridge to Firebase session
            let firebaseToken: string | null = null;
            try {
                const admin = initAdmin();
                // We use the normalized email as the Firebase UID and include it in claims
                firebaseToken = await admin.auth().createCustomToken(normalizedEmail, { email: normalizedEmail });
                console.log('Meta Auth: Created Firebase bridge token for', normalizedEmail);
            } catch (fbErr) {
                console.error('Meta Auth: Failed to create bridge token:', fbErr);
            }

            // Since it's a popup, return a script that handles completion
            return new NextResponse(
                `<html>
                    <body>
                        <script>
                            window.opener.postMessage({ 
                                type: 'META_AUTH_COMPLETE', 
                                status: 'success', 
                                intent: 'signup', 
                                email: '${normalizedEmail}',
                                firebaseToken: ${firebaseToken ? `'${firebaseToken}'` : 'null'}
                            }, window.location.origin);
                            window.close();
                        </script>
                        Redirecting...
                    </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
            );

        } else if (intent === 'commerce') {
            const { storeId } = state;
            if (!storeId) throw new Error('Store identifier (storeId) missing for commerce intent.');

            const encryptedToken = encrypt(accessToken);

            // Fetch WABA accounts
            const wabaData = await getWabaAccounts(accessToken);
            console.log('Meta Auth: Fetched WABA data:', JSON.stringify(wabaData));

            let whatsappBusiness = {};

            if (wabaData.data && wabaData.data.length > 0) {
                const firstWaba = wabaData.data[0];
                const wabaId = firstWaba.id;

                // Fetch phone numbers for this WABA
                const phoneData = await getWabaPhoneNumbers(wabaId, accessToken);
                console.log('Meta Auth: Fetched Phone data:', JSON.stringify(phoneData));

                let phoneNumberId = '';
                if (phoneData.data && phoneData.data.length > 0) {
                    phoneNumberId = phoneData.data[0].id;
                }

                whatsappBusiness = {
                    wabaId: wabaId,
                    phoneNumberId: phoneNumberId,
                    accessToken: encryptedToken,
                    businessName: firstWaba.name,
                    status: firstWaba.message_template_namespace ? 'Active' : 'Pending',
                    verified: true
                };
            }

            const stores = db.collection('stores');
            const { ObjectId } = require('mongodb');

            await stores.updateOne(
                { _id: new ObjectId(storeId) },
                {
                    $set: {
                        'socialLinks.whatsappBusiness': whatsappBusiness,
                        'socialLinks.whatsappConnected': true,
                        'socialLinks.whatsappWabaId': (whatsappBusiness as any).wabaId,
                        'metaSettings.systemUserToken': encryptedToken,
                        'metaSettings.tokenUpdatedAt': new Date()
                    }
                }
            );

            return new NextResponse(
                `<html>
                    <body>
                        <script>
                            window.opener.postMessage({ type: 'META_AUTH_COMPLETE', status: 'success', intent: 'commerce' }, window.location.origin);
                            window.close();
                        </script>
                        WhatsApp Business Connection success. This window will now close.
                    </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

    } catch (error: any) {
        console.error('Meta OAuth Callback error:', error);
        return new NextResponse(
            `<html>
                <body>
                    <script>
                        window.opener.postMessage({ type: 'META_AUTH_COMPLETE', status: 'error', message: '${error.message}' }, window.location.origin);
                        window.close();
                    </script>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

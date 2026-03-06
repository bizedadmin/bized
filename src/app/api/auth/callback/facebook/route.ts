import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { exchangeCodeForToken, getMetaUserProfile } from '@/lib/meta';
import { encrypt } from '@/lib/encryption';

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

        // Use the exact origin of the request to ensure consistency with the whitelisted URI
        const redirectUri = `${req.nextUrl.origin}/api/auth/callback/facebook`;

        // Exchange code for token
        const tokenRes = await exchangeCodeForToken(code, redirectUri);
        const accessToken = tokenRes.access_token;

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection('users');

        if (intent === 'signup') {
            // Fetch profile and upsert user
            const profile = await getMetaUserProfile(accessToken);
            const email = profile.email || `${profile.id}@meta.bized.app`;

            const update = {
                $set: {
                    email,
                    name: profile.name,
                    image: profile.picture?.data?.url || '',
                    dateModified: new Date(),
                    metaId: profile.id, // Reference to original Meta user ID
                },
                $setOnInsert: {
                    dateCreated: new Date(),
                    "@context": "https://schema.org",
                    "@type": "Person",
                    isSuperAdmin: false
                }
            };

            await users.updateOne({ email }, update, { upsert: true });

            // Since it's a popup, it's better to return a script that handles completion
            return new NextResponse(
                `<html>
                    <body>
                        <script>
                            window.opener.postMessage({ type: 'META_AUTH_COMPLETE', status: 'success', intent: 'signup', email: '${email}' }, window.location.origin);
                            window.close();
                        </script>
                        Redirecting...
                    </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
            );

        } else if (intent === 'commerce') {
            // "slug" should identify the user/business to attach the token to
            // This could be an ID or store slug depending on multi-tenant logic
            if (!slug) throw new Error('Store/User identifier (slug) missing for commerce intent.');

            const encryptedToken = encrypt(accessToken);

            // Here we assume "slug" refers to the user's ID or unique store identifier
            // In a real app, you'd likely fetch the current user session first to verify identity
            await users.updateOne(
                { email: slug }, // For demo, using email as identifier; adapt if using ID
                {
                    $set: {
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
                        Connection success. This window will now close.
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

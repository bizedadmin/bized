import crypto from 'crypto';

/**
 * Generates an appsecret_proof for the Meta Graph API.
 * This is a security feature to prevent token theft.
 */
export function generateAppSecretProof(accessToken: string): string {
    const appSecret = process.env.FACEBOOK_APP_SECRET || '';
    return crypto
        .createHmac('sha256', appSecret)
        .update(accessToken)
        .digest('hex');
}

/**
 * Standard exchange of 'code' for an access_token.
 */
export async function exchangeCodeForToken(code: string, redirectUri: string) {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    const response = await fetch(
        `https://graph.facebook.com/v20.0/oauth/access_token?` +
        new URLSearchParams({
            client_id: appId!,
            client_secret: appSecret!,
            redirect_uri: redirectUri,
            code: code,
        })
    );

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
}

/**
 * Fetch basic user profile (Signup intent).
 */
export async function getMetaUserProfile(accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/me?` +
        new URLSearchParams({
            fields: 'id,name,email,picture',
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}

/**
 * Fetch WhatsApp Business Accounts.
 */
export async function getWabaAccounts(accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/me/whatsapp_business_accounts?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}

/**
 * Fetch Phone Numbers for a specific WABA.
 */
export async function getWabaPhoneNumbers(wabaId: string, accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${wabaId}/phone_numbers?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}


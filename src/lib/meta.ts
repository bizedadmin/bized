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

/**
 * Fetch a WhatsApp Business Profile for a phone number.
 */
export async function getWabaProfile(phoneNumberId: string, accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/whatsapp_business_profile?` +
        new URLSearchParams({
            fields: 'about,address,description,email,profile_picture_url,websites,vertical',
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}

/**
 * Update a WhatsApp Business Profile.
 */
export async function updateWabaProfile(phoneNumberId: string, accessToken: string, profile: any) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/whatsapp_business_profile?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        }),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        }
    );
    return await response.json();
}
/**
 * Fetch top-level metadata for a WhatsApp Business Account.
 */
export async function getWabaAccountDetails(wabaId: string, accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${wabaId}?` +
        new URLSearchParams({
            fields: 'name,timezone_id,currency,message_template_namespace',
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}

/**
 * Update the Display Name for a phone number (requires Meta review).
 */
export async function updateWabaDisplayName(phoneNumberId: string, accessToken: string, displayName: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${displayName ? phoneNumberId : ''}/display_name?` +
        new URLSearchParams({
            display_name: displayName,
            access_token: accessToken,
            appsecret_proof: proof
        }),
        { method: 'POST' }
    );
    return await response.json();
}
/**
 * Create a Message Template in a WABA.
 */
export async function createMessageTemplate(wabaId: string, accessToken: string, template: any) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${wabaId}/message_templates?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        }),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
        }
    );
    return await response.json();
}

/**
 * Fetch Message Templates for a WABA.
 */
export async function getMessageTemplates(wabaId: string, accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${wabaId}/message_templates?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        })
    );
    return await response.json();
}

/**
 * Create a WhatsApp Flow.
 */
export async function createWhatsAppFlow(wabaId: string, accessToken: string, name: string, categories: string[]) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${wabaId}/flows?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        }),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, categories }),
        }
    );
    return await response.json();
}

/**
 * Update WhatsApp Flow Assets (the JSON Design).
 */
export async function updateFlowAssets(flowId: string, accessToken: string, assetType: string, fileBlob: any) {
    const proof = generateAppSecretProof(accessToken);
    const formData = new FormData();
    formData.append('name', 'flow.json');
    formData.append('asset_type', assetType);
    formData.append('file', fileBlob, 'flow.json');

    const response = await fetch(
        `https://graph.facebook.com/v20.0/${flowId}/assets?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        }),
        {
            method: 'POST',
            body: formData,
        }
    );
    return await response.json();
}

/**
 * Publish a WhatsApp Flow (moves it to Meta Review).
 */
export async function publishFlow(flowId: string, accessToken: string) {
    const proof = generateAppSecretProof(accessToken);
    const response = await fetch(
        `https://graph.facebook.com/v20.0/${flowId}/publish?` +
        new URLSearchParams({
            access_token: accessToken,
            appsecret_proof: proof
        }),
        { method: 'POST' }
    );
    return await response.json();
}

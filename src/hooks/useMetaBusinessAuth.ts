"use client";

import { useSearchParams } from "next/navigation";

export type MetaAuthIntent = 'signup' | 'commerce';

export interface MetaAuthOptions {
    intent: MetaAuthIntent;
    slug?: string; // Multi-tenant context (e.g., store slug)
}

export function useMetaBusinessAuth() {
    const searchParams = useSearchParams();

    /**
     * Triggers the Meta OAuth flow in a popup.
     */
    const startMetaBusinessAuth = (options: MetaAuthOptions & { configId?: string }) => {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        let configId = options.configId;

        if (!configId) {
            configId = (options.intent === 'signup'
                ? process.env.NEXT_PUBLIC_META_SIGNUP_CONFIG_ID
                : process.env.NEXT_PUBLIC_META_COMMERCE_CONFIG_ID) || '';
        }

        /**
         * The state object should contain:
         * 1. intent (signup/commerce)
         * 2. slug (multi-tenant store id/slug)
         * 3. current full host (to ensure the callback knows where it belongs)
         */
        const state = encodeURIComponent(JSON.stringify({
            intent: options.intent,
            slug: options.slug || null,
        }));
        // Use explicit app URL to ensure consistency
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const redirectUri = `${appUrl}/api/auth/callback/facebook`;

        const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?` +
            new URLSearchParams({
                client_id: appId!,
                config_id: configId,
                redirect_uri: redirectUri,
                state: state,
                response_type: 'code',
                scope: 'email,public_profile'
            }).toString();

        // Standard popup configuration
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
            oauthUrl,
            'Meta Business Login',
            `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,toolbar=no,menubar=no,scrollbars=yes`
        );
    };

    return { startMetaBusinessAuth };
}

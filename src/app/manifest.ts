import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bized - Business Operating System',
        short_name: 'Bized',
        description: 'Manage your business, store, and links in one place.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#007AFF',
        orientation: 'portrait',
        categories: ['productivity', 'business', 'finance'],
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        screenshots: [
            {
                src: '/hero-dashboard.png',
                sizes: '1280x720',
                type: 'image/png',
            },
            {
                src: '/feature-crm.png',
                sizes: '1280x720',
                type: 'image/png',
            },
        ],
    };
}

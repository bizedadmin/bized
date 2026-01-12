import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bized - Business Operating System',
        short_name: 'Bized',
        description: 'Manage your business, store, and links in one place.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#10B981',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}

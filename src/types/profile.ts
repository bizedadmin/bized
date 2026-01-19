/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Block {
    id: string;
    type: string;
    title?: string;
    description?: string;
    content?: string;
    [key: string]: any;
}

export interface PageSettings {
    blocks: Block[];
    [key: string]: any;
}

export interface Page {
    title: string;
    slug: string;
    enabled: boolean;
    type: 'profile' | 'bookings' | 'shop' | 'quote' | 'storefront';
    settings: PageSettings;
}

export interface ProfileData {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    logo?: string;
    themeColor?: string;
    secondaryColor?: string;
    buttonColor?: string;
    fontFamily?: string;
    glassmorphism?: boolean;
    borderRadius?: string;
    pages: Page[];
    [key: string]: any;
}

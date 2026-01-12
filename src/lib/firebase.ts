import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Messaging is only supported in browser environments
export const messaging = async () => {
    if (typeof window !== 'undefined' && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

// Analytics is only supported in browser environments
export const analytics = async () => {
    if (typeof window !== 'undefined' && await isAnalyticsSupported()) {
        return getAnalytics(app);
    }
    return null;
};

export default app;

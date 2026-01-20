import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            storageBucket,
        });

        const bucket = admin.storage().bucket(storageBucket);

        // Configure CORS to allow image editing from the web app
        bucket.setCorsConfiguration([
            {
                origin: ['*'],
                method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'x-goog-resumable'],
                maxAgeSeconds: 3600
            }
        ]).catch(err => console.error('Error setting Firebase CORS:', err));

        // console.log('Firebase Admin: Initialization successful');
    } catch (error) {
        console.error('Firebase Admin: Initialization error:', error);
    }
}

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminMessaging = admin.messaging();
export default admin;

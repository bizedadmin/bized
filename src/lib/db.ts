import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}



/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    } | undefined;
}

const cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true, // Allow buffering to prevent race conditions with models
            dbName: 'bized',
            autoIndex: true,
        };

        // Ensure URI doesn't have extra quotes if they leaked in
        const cleanURI = MONGODB_URI?.trim().replace(/^["']|["']$/g, '');

        console.log('--- DATABASE CONNECTION ATTEMPT ---');
        console.log('Target Database:', opts.dbName);

        cached.promise = mongoose.connect(cleanURI!, opts).then((mongooseInstance) => {
            console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
            console.log('Connected to:', mongooseInstance.connection.name); // Should log 'bized'
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('--- DATABASE CONNECTION ERROR ---');
        console.error(e);
        throw e;
    }

    return cached.conn;
}

export default dbConnect;

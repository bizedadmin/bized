import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local BEFORE other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    try {
        // Dynamic imports to ensure env vars are loaded first
        const User = (await import('../src/models/User')).default;
        const dbConnect = (await import('../src/lib/db')).default;

        await dbConnect();
        console.log('Connected to database.');

        const adminEmail = 'admin@bized.app';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10); // Default password

        const newAdmin = await User.create({
            name: 'Bized Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });

        console.log(`Admin user created: ${newAdmin.email}`);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

seedAdmin();

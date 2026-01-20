
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function checkBusinesses() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Define a minimal schema to query
        const BusinessSchema = new mongoose.Schema({ name: String, slug: String, isDraft: Boolean, owner: String }, { strict: false });
        const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

        const businesses = await Business.find({});
        console.log(`Found ${businesses.length} businesses:`);
        businesses.forEach(b => {
            console.log(`- Name: "${b.name}", Slug: "${b.slug}", isDraft: ${b.isDraft}, ID: ${b._id}`);
        });

        // Check specific query for Smartify
        const smartify = await Business.findOne({ name: /Smartify/i });
        if (smartify) {
            console.log('\nDetailed Smartify record:', JSON.stringify(smartify, null, 2));
        } else {
            console.log('\nSmartify record not found via regex.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkBusinesses();

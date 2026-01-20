
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function fixSmartify() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const BusinessSchema = new mongoose.Schema({ name: String, slug: String, isDraft: Boolean }, { strict: false });
        const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

        const result = await Business.updateMany(
            { name: /Smartify/i },
            { $set: { isDraft: false } }
        );

        console.log(`Updated ${result.modifiedCount} businesses to non-draft status.`);

        const smartify = await Business.findOne({ name: /Smartify/i });
        console.log('Current Smartify status:', smartify);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

fixSmartify();

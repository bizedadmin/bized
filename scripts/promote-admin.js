const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define User Schema (Simplified)
const UserSchema = new mongoose.Schema({
    _id: String,
    name: String,
    email: String,
    role: String,
    image: String,
    provider: String,
}, { _id: false }); // Disable auto-generation
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function promoteAdmin() {
    const targetEmail = process.argv[2];

    if (!targetEmail) {
        console.error("Usage: node scripts/promote-admin.js <email>");
        process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is missing in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`User with email ${targetEmail} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User ${user.name} (${user.email}) is now an ADMIN.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

promoteAdmin();

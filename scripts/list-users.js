const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define User Schema (Simplified)
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    image: String,
    provider: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function listUsers() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is missing in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const users = await User.find({});
        console.log("--- Registered Users ---");
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });
        console.log("------------------------");

        if (users.length > 0) {
            console.log("\nTo promote a user to admin, run:");
            console.log(`node scripts/promote-admin.js <email>`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();

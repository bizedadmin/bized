
import clientPromise from "./src/lib/mongodb.js";

async function updatePrimaryColor() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection("platform_settings").updateOne(
            { _id: "global" },
            { $set: { primaryColor: "#2563EB" } }
        );
        console.log(`Updated ${result.modifiedCount} document(s).`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating primary color:", error);
        process.exit(1);
    }
}

updatePrimaryColor();

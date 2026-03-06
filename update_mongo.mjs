
import { MongoClient } from 'mongodb';

const uri = "mongodb://myAdmin:KRxVyLWrZNhccsAx@172.104.167.218:27017/bized?authSource=admin";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('bized');
        const settings = database.collection('platform_settings');
        const result = await settings.updateOne(
            { _id: "global" },
            { $set: { primaryColor: "#2563EB" } }
        );
        console.log(`Updated ${result.modifiedCount} document(s).`);
    } finally {
        await client.close();
    }
}
run();

import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '');

export async function uploadFile(file: Buffer, fileName: string, contentType: string) {
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: contentType,
    });

    return new Promise<string>((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });
        blobStream.end(file);
    });
}

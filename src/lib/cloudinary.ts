import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
        secure: true,
    });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export default cloudinary;

export async function createFolder(folderPath: string) {
    return new Promise((resolve, reject) => {
        cloudinary.api.create_folder(
            `bized/${folderPath}`,
            {},
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
}

export async function uploadToCloudinary(fileBuffer: Buffer, folder: string) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `bized/${folder}`,
                resource_type: 'image',
                format: 'webp',
                quality: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result?.secure_url);
            }
        ).end(fileBuffer);
    });
}

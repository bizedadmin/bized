import fs from 'fs';
import path from 'path';
import Image from 'next/image';

export default async function HavitProductsPage() {
    const filePath = path.join(process.cwd(), 'havit_products.json');
    let products: { title: string; price: string; image?: string; link?: string }[] = [];

    if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        products = JSON.parse(fileContents);
    } else {
        return (
            <main className="min-h-screen p-8 bg-[var(--color-surface-container-low)] min-h-screen pb-24 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 mb-8 pt-10">
                    No Products Found
                </h1>
                <p className="text-[var(--color-on-surface-variant)] text-lg">
                    We couldn't find the `havit_products.json` file. Please run the scraper first.
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 sm:p-8 bg-[var(--color-surface-container-lowest)] pb-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mt-8 mb-10">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                        Havit Products
                    </h1>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium pt-1 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                        {products.length} Items Found
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map((product, index) => (
                        <a
                            key={index}
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col bg-[var(--color-surface-container)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="relative aspect-square w-full bg-white p-4 flex items-center justify-center overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-4 flex flex-col flex-grow justify-between">
                                <h2 className="text-[var(--color-on-surface)] text-sm font-medium line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-200">
                                    {product.title}
                                </h2>

                                <div className="mt-3 flex items-center text-sm">
                                    {/* Clean up the price display: grab just the first part or format it nicely */}
                                    <span className="font-bold text-[var(--color-primary)] text-lg">
                                        {product.price.split('Original')[0] || product.price}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </main>
    );
}

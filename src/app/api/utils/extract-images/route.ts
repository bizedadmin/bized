import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url || !url.startsWith("http")) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Referer": url,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const images: string[] = [];
        const seen = new Set<string>();

        const baseUrl = new URL(url).origin;

        $("img, source, [data-src], [data-lazy-src], [data-img]").not("script, link, style").each((_, el) => {
            let src = $(el).attr("src") ||
                $(el).attr("data-src") ||
                $(el).attr("data-lazy-src") ||
                $(el).attr("data-original") ||
                $(el).attr("data-img") ||
                $(el).attr("srcset");

            // Handle srcset (pick the first/largest one)
            if (src && src.includes(",")) {
                src = src.split(",")[0].split(" ")[0];
            }

            if (src) {
                try {
                    const absoluteUrl = new URL(src, url).href;

                    // Filter out scripts, css, tiny icons, etc.
                    const isIcon = absoluteUrl.includes("icon") || absoluteUrl.includes("logo") || absoluteUrl.includes("avatar");
                    const isData = absoluteUrl.startsWith("data:");
                    const isScript = /\.(js|css|json|php|html)($|\?)/i.test(absoluteUrl);
                    const isImage = /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff)($|\?)/i.test(absoluteUrl);

                    // If it's a script/css or clearly NOT an image, skip it
                    if (isScript) return;

                    // If it has an image extension OR it's from an <img> tag 
                    // (some dynamic images don't have extensions in the URL)
                    const tagName = el.tagName?.toLowerCase();
                    if (!seen.has(absoluteUrl) && !isData && (isImage || tagName === "img")) {
                        images.push(absoluteUrl);
                        seen.add(absoluteUrl);
                    }
                } catch (e) {
                    // Ignore invalid URLs
                }
            }
        });

        // Limit to top 50 images to avoid overwhelming the UI
        return NextResponse.json({ images: images.slice(0, 50) });
    } catch (error) {
        console.error("Extraction error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

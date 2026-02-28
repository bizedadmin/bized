import fs from 'fs';
import * as cheerio from 'cheerio';

const startUrl = process.argv[2];

if (!startUrl) {
  console.error('Please provide a URL to scrape. Example: node scraper.mjs https://expressmartke.com/brand/oraimo/');
  process.exit(1);
}

// Ensure the URL ends with a slash for pagination logic
const baseUrl = startUrl.endsWith('/') ? startUrl : `${startUrl}/`;
// Create a safe filename from the URL
const filename = baseUrl.split('/').filter(Boolean).pop() + '_products.json';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept': 'text/html',
};

async function fetchPage(pageNum) {
  const url = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      if (res.status === 404) return null; // No more pages
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.text();
  } catch (error) {
    console.error(`Failed to fetch page ${pageNum}:`, error.message);
    return null;
  }
}

async function scrapeProducts() {
  const allProducts = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore) {
    const html = await fetchPage(pageNum);
    
    if (!html) {
      hasMore = false;
      break;
    }

    const $ = cheerio.load(html);
    let itemsFound = 0;

    $('.product.type-product').each((_, el) => {
      const title = $(el).find('.wd-entities-title a, h3 a').text().trim();
      const link = $(el).find('.wd-entities-title a, h3 a').attr('href');
      const price = $(el).find('.price').text().trim().replace(/\s+/g, ' ');
      // The images are lazy loaded, so we must check data-src first, then fallback to src
      const imgEl = $(el).find('img');
      const image = imgEl.attr('data-src') || imgEl.attr('src');

      if (title && link) {
        allProducts.push({ title, price, link, image });
        itemsFound++;
      }
    });

    console.log(`Found ${itemsFound} products on page ${pageNum}`);
    
    // Check if there is a next page button
    if ($('.next.page-numbers').length === 0) {
      hasMore = false;
    } else {
      pageNum++;
    }
  }

  // If the user asked for max 20, we can slice it here or just save all
  // The user prompt was "Pick for 20 products", so let's limit the output file
  const limitedProducts = allProducts.slice(0, 20);

  console.log(`\nScraping complete! Saving first ${limitedProducts.length} out of ${allProducts.length} products found.`);
  fs.writeFileSync(filename, JSON.stringify(limitedProducts, null, 2));
  console.log(`Data saved to ${filename}`);
}

scrapeProducts();

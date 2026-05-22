import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial URLs to start crawl
const startUrls = [
  "https://www.vicegolf.com/golf-balls/vice-golf-pro-plus-white",
  "https://www.vicegolf.com/golf-balls/vice-golf-pro-white",
  "https://www.vicegolf.com/golf-balls/vice-golf-pro-air-white",
  "https://www.vicegolf.com/golf-balls/vice-golf-tour-white",
  "https://www.vicegolf.com/golf-balls/vice-golf-drive-white"
];

// Helper to sanitize IDs like server does
function sanitizeId(model, color) {
  const modelPart = model.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const colorPart = color.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${modelPart}-${colorPart}`;
}

// Map page titles or URLs to catalog models/colors
function mapPageToCatalog(url, title, pageTitle) {
  const urlLower = url.toLowerCase();
  const titleLower = (title || pageTitle || '').toLowerCase();

  // 1. Identify Model
  let model = null;
  if (urlLower.includes('pro-plus') || titleLower.includes('pro plus')) {
    model = 'PRO PLUS';
  } else if (urlLower.includes('pro-air') || titleLower.includes('pro air')) {
    model = 'PRO AIR';
  } else if (urlLower.includes('pro-soft') || titleLower.includes('pro soft')) {
    model = 'PRO SOFT';
  } else if (urlLower.includes('pro') || titleLower.includes('vice pro')) {
    // Check 'pro' carefully since pro-plus/pro-air/pro-soft also contain 'pro'
    model = 'PRO';
  } else if (urlLower.includes('tour') || titleLower.includes('tour')) {
    model = 'TOUR';
  } else if (urlLower.includes('drive') || titleLower.includes('drive')) {
    model = 'DRIVE';
  }

  // 2. Identify Color
  let color = null;
  if (urlLower.includes('neon-lime') || urlLower.includes('neon-gloss-lime') || titleLower.includes('neon lime') || titleLower.includes('lime')) {
    color = 'Neon Gloss Lime';
  } else if (urlLower.includes('neon-red') || urlLower.includes('neon-gloss-red') || titleLower.includes('neon red')) {
    color = 'Neon Gloss Red';
  } else if (urlLower.includes('drip-red-blue') || titleLower.includes('drip red-blue') || titleLower.includes('drip red/blue')) {
    color = 'Red/Blue Drip Splatter';
  } else if (urlLower.includes('drip-lime') || urlLower.includes('lime-black') || titleLower.includes('drip lime-black') || titleLower.includes('drip lime/black') || (urlLower.includes('drip') && urlLower.includes('lime'))) {
    color = 'Lime/Black Drip Splatter';
  } else if (urlLower.includes('drip-yellow-teal') || titleLower.includes('drip yellow-teal') || titleLower.includes('drip yellow/teal') || titleLower.includes('yellow / teal drip')) {
    color = 'Yellow / Teal Drip Splatter';
  } else if (urlLower.includes('shining-hue') || titleLower.includes('shining hue')) {
    color = 'Shining Hue Blue';
  } else if (urlLower.includes('gold') || titleLower.includes('gold')) {
    color = 'Limited Edition Gold';
  } else if (urlLower.includes('white') || titleLower.includes('white')) {
    color = 'Pure Gloss White';
  }

  if (model && color) {
    return { model, color, id: sanitizeId(model, color) };
  }
  return null;
}

async function scrapeImages() {
  console.log('Launching browser for image scraper...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const visited = new Set();
  const queue = [...startUrls];
  const scrapedResults = {};

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    while (queue.length > 0) {
      const currentUrl = queue.shift();
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      console.log(`\n--------------------------------------------`);
      console.log(`Processing URL (${visited.size} visited, ${queue.length} in queue): ${currentUrl}`);

      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. Get Page Title and Header Info
        const pageTitle = await page.title();
        const mainTitle = await page.evaluate(() => {
          return document.querySelector('h1')?.innerText.trim() || '';
        });

        console.log(`Page Title: "${pageTitle}" | H1: "${mainTitle}"`);

        // 2. Discover other color links/swatches on the page
        const swatchLinks = await page.evaluate(() => {
          // Look for any 'a' tags that look like color variants
          const anchors = Array.from(document.querySelectorAll('a'));
          return anchors
            .map(a => a.href)
            .filter(href => href && href.includes('/golf-balls/') && !href.includes('#') && !href.includes('?'));
        });

        // Add discovered swatch links to the queue
        for (const link of swatchLinks) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }

        // 3. Map this page to catalog ID
        const mapping = mapPageToCatalog(currentUrl, mainTitle, pageTitle);
        if (!mapping) {
          console.log(`Could not map URL ${currentUrl} to a known catalog item.`);
          continue;
        }

        console.log(`Mapped to Catalog Item: ${mapping.id} (Model: ${mapping.model}, Color: ${mapping.color})`);

        // 4. Scrape the best high-res image
        const images = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img'))
            .map(img => ({
              src: img.src,
              alt: img.alt,
              width: img.offsetWidth || img.naturalWidth,
              height: img.offsetHeight || img.naturalHeight
            }));
        });

        // Search for a Front Zoom image first, then any large Front image, then Dozen, then any large image
        const cdnImages = images.filter(img => {
          const src = img.src.toLowerCase();
          return src.includes('cdn.shopify.com') && !src.includes('flag') && !src.includes('icon') && !src.includes('logo') && !src.includes('.svg');
        });

        let bestImage = null;

        // Strategy A: Front Zoom
        bestImage = cdnImages.find(img => img.src.includes('Front_Zoom'));

        // Strategy B: Front image (larger size)
        if (!bestImage) {
          bestImage = cdnImages.find(img => img.src.toLowerCase().includes('front') && img.width > 200);
        }

        // Strategy C: Dozen Zoom or Dozen
        if (!bestImage) {
          bestImage = cdnImages.find(img => img.src.includes('Dozen_Zoom') || img.src.toLowerCase().includes('dozen'));
        }

        // Strategy D: Any large image
        if (!bestImage) {
          bestImage = cdnImages.find(img => img.width > 300 && img.height > 300);
        }

        if (bestImage) {
          console.log(`Found image: ${bestImage.src}`);
          scrapedResults[mapping.id] = {
            id: mapping.id,
            model: mapping.model,
            color: mapping.color,
            scrapedImage: bestImage.src,
            sourceUrl: currentUrl
          };
        } else {
          console.log(`Warning: No suitable image found for ${mapping.id}`);
        }

      } catch (err) {
        console.error(`Error processing ${currentUrl}:`, err.message);
      }
    }

    // Save output
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'scraped_colors.json');
    fs.writeFileSync(outputPath, JSON.stringify(scrapedResults, null, 2), 'utf-8');
    console.log(`\nScraping complete! Saved ${Object.keys(scrapedResults).length} mappings to: ${outputPath}`);

  } catch (err) {
    console.error('Fatal scraping error:', err);
  } finally {
    await browser.close();
  }
}

scrapeImages();

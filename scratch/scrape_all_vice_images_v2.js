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
  } else if (urlLower.includes('drip-yellow-teal') || titleLower.includes('drip yellow-teal') || titleLower.includes('drip yellow/teal') || titleLower.includes('yellow / teal drip') || urlLower.includes('yellow-green')) {
    // Note: Yellow-green is Yellow/Teal drip on some regions
    color = 'Yellow / Teal Drip Splatter';
  } else if (urlLower.includes('shining-hue') || titleLower.includes('shining hue') || urlLower.includes('ice-blue')) {
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
      console.log(`Processing URL: ${currentUrl}`);

      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const pageTitle = await page.title();
        const mainTitle = await page.evaluate(() => {
          return document.querySelector('h1')?.innerText.trim() || '';
        });

        const mapping = mapPageToCatalog(currentUrl, mainTitle, pageTitle);
        if (!mapping) {
          console.log(`Could not map URL to a known catalog item.`);
          continue;
        }

        console.log(`Mapped to Catalog Item: ${mapping.id} (${mapping.model} - ${mapping.color})`);

        // Discover swatches
        const swatchLinks = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => href && href.includes('/golf-balls/') && !href.includes('#') && !href.includes('?'));
        });

        for (const link of swatchLinks) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }

        // Scrape and rank images
        const images = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img'))
            .map(img => ({
              src: img.src,
              alt: img.alt || '',
              width: img.offsetWidth || img.naturalWidth,
              height: img.offsetHeight || img.naturalHeight
            }));
        });

        // Filter valid CDN images
        const cdnImages = images.filter(img => {
          const src = img.src.toLowerCase();
          return src.includes('cdn.shopify.com') && 
                 !src.includes('flag') && 
                 !src.includes('icon') && 
                 !src.includes('logo') && 
                 !src.includes('.svg');
        });

        // Score each image to select the best one
        const scoredImages = cdnImages.map(img => {
          const src = img.src.toLowerCase();
          const alt = img.alt.toLowerCase();
          let score = 0;

          // 1. Prioritize Front Zoom or Front images
          if (src.includes('front_zoom')) {
            score += 150;
          } else if (src.includes('front') || src.includes('-front')) {
            score += 100;
          }

          // 2. Prioritize current model keywords
          const modelKeywords = mapping.model.toLowerCase().split(' ');
          modelKeywords.forEach(kw => {
            if (src.includes(kw) || alt.includes(kw)) score += 30;
          });

          // 3. Prioritize current color keywords
          const colorKeywords = mapping.color.toLowerCase().split(/[ \/]/);
          colorKeywords.forEach(kw => {
            if (kw.length > 2) {
              if (src.includes(kw) || alt.includes(kw)) score += 40;
            }
          });

          // 4. Penalize unrelated products / packaging / cut-through diagrams
          if (src.includes('dozen') || src.includes('package') || src.includes('box') || src.includes('lid')) {
            score -= 60; // We want the single ball, not the box
          }
          if (src.includes('cut-through') || src.includes('layer') || src.includes('explosion') || src.includes('exp.png')) {
            score -= 50; // We want the outer ball view, not internal layers
          }
          if (src.includes('glove') || src.includes('bag') || src.includes('towel') || src.includes('cap') || src.includes('apparel') || src.includes('starter_set')) {
            score -= 80;
          }

          // 5. Penalize special/limited editions if we are NOT scraping that edition
          if (!mapping.color.toLowerCase().includes('gold') && src.includes('gold')) score -= 70;
          if (!mapping.color.toLowerCase().includes('beer') && (src.includes('beer') || src.includes('prost'))) score -= 70;
          if (src.includes('jack-nicklaus') || src.includes('bear')) score -= 70;

          // 6. Size preference
          if (img.width >= 400 && img.height >= 400) {
            score += 10;
          }

          return { ...img, score };
        });

        // Sort by score descending
        scoredImages.sort((a, b) => b.score - a.score);

        if (scoredImages.length > 0 && scoredImages[0].score > 0) {
          const best = scoredImages[0];
          console.log(`Selected Image: ${best.src} (Score: ${best.score})`);
          scrapedResults[mapping.id] = {
            id: mapping.id,
            model: mapping.model,
            color: mapping.color,
            scrapedImage: best.src,
            sourceUrl: currentUrl,
            score: best.score
          };
        } else {
          console.log(`Warning: No high-scoring image found.`);
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

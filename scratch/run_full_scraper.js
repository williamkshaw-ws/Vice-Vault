import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const urls = {
  "Pro Plus": "https://www.vicegolf.com/golf-balls/vice-golf-pro-plus-white",
  "Pro": "https://www.vicegolf.com/golf-balls/vice-golf-pro-white",
  "Pro Air": "https://www.vicegolf.com/golf-balls/vice-golf-pro-air-white",
  "Tour": "https://www.vicegolf.com/golf-balls/vice-golf-tour-white",
  "Drive": "https://www.vicegolf.com/golf-balls/vice-golf-drive-white"
};

async function scrapeProduct(browser, modelName, url) {
  console.log(`Scraping ${modelName} from ${url}...`);
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for content and animations to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate((modelName) => {
      // Title
      const title = document.querySelector('h1')?.innerText.trim() || modelName;
      
      // Description
      const desc = document.querySelector('.product__description, .product-description, p.description')?.innerText.trim() || 
                   Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).find(t => t.length > 100) || '';

      // Find all large images that are likely product pictures
      const imgs = Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.offsetWidth || img.naturalWidth,
          height: img.offsetHeight || img.naturalHeight
        }));

      // Filter to keep only product-sized images, avoiding flags/banners
      const filtered = imgs.filter(img => {
        const srcLower = img.src.toLowerCase();
        if (srcLower.includes('flag') || srcLower.includes('menu') || srcLower.includes('hamburger') || srcLower.includes('icon')) return false;
        // Keep images with reasonable sizing (typically product gallery photos are square/large)
        if (img.width > 200 || img.height > 200) return true;
        // Keep if filename matches golf ball templates
        if (srcLower.includes('ball') || srcLower.includes('package') || srcLower.includes('pro_plus') || srcLower.includes('pro_soft')) return true;
        return false;
      });

      return {
        model: modelName,
        title,
        desc: desc.replace(/\s+/g, ' ').trim(),
        images: filtered.map(img => ({
          src: img.src,
          alt: img.alt,
          size: `${img.width}x${img.height}`
        }))
      };
    }, modelName);

    console.log(`Successfully scraped ${modelName}. Found ${data.images.length} images.`);
    return data;
  } catch (err) {
    console.error(`Error scraping ${modelName}:`, err.message);
    return { model: modelName, url, error: err.message };
  } finally {
    await page.close();
  }
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const scrapedData = [];
  for (const [model, url] of Object.entries(urls)) {
    const result = await scrapeProduct(browser, model, url);
    scrapedData.push(result);
  }

  await browser.close();
  console.log('Browser closed.');

  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'scraped_vice_balls.json');
  fs.writeFileSync(outputPath, JSON.stringify(scrapedData, null, 2), 'utf-8');
  console.log(`Saved scraped data to: ${outputPath}`);
}

run();

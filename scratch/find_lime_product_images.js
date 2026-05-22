import puppeteer from 'puppeteer';

async function run() {
  const url = 'https://www.vicegolf.com/golf-balls/vice-golf-pro-neon-lime';
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Extracting candidate product images...');
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.offsetWidth || img.naturalWidth,
          height: img.offsetHeight || img.naturalHeight
        }));
    });

    console.log('\nFiltered Candidate Images:');
    const filtered = images.filter(img => {
      const src = img.src.toLowerCase();
      if (!src.includes('cdn.shopify.com')) return false;
      if (src.includes('flag') || src.includes('icon') || src.includes('logo') || src.includes('.svg')) return false;
      if (img.width < 150 && img.height < 150) return false;
      return true;
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const img of filtered) {
      if (!seen.has(img.src)) {
        seen.add(img.src);
        unique.push(img);
      }
    }

    unique.forEach((img, idx) => {
      console.log(`[${idx+1}] Size: ${img.width}x${img.height} | Alt: "${img.alt}"`);
      console.log(`    Src: ${img.src}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

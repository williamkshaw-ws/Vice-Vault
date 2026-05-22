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

    console.log('Extracting all images...');
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.offsetWidth,
          height: img.offsetHeight
        }))
        .filter(img => img.src && !img.src.includes('flag') && !img.src.includes('icon'));
    });

    console.log(`Found ${images.length} images:`);
    images.forEach((img, idx) => {
      console.log(`[${idx+1}] Src: ${img.src}`);
      console.log(`    Alt: "${img.alt}" | Size: ${img.width}x${img.height}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

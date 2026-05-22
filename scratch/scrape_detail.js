import puppeteer from 'puppeteer';

async function run() {
  console.log('Starting detail scraper...');
  const url = 'https://www.vicegolf.com/golf-balls/vice-golf-pro-white';
  
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
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Extracting all image elements...');
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          class: img.className,
          width: img.offsetWidth,
          height: img.offsetHeight
        }));
    });

    console.log(`Found ${images.length} total images on the page.`);
    const filteredImages = images.filter(img => {
      const srcLower = img.src.toLowerCase();
      // Filter out small flags/icons (typically under 60px)
      if (img.width > 0 && img.width < 60) return false;
      if (img.height > 0 && img.height < 60) return false;
      // Exclude flag SVGs or menu icons
      if (srcLower.includes('flag') || srcLower.includes('menu') || srcLower.includes('hamburger') || srcLower.includes('united_states') || srcLower.includes('canada')) {
        return false;
      }
      return true;
    });

    console.log(`Filtered down to ${filteredImages.length} potential product images:`);
    filteredImages.forEach((img, idx) => {
      console.log(`[${idx + 1}] Src: ${img.src} | Alt: "${img.alt}" | Size: ${img.width}x${img.height}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

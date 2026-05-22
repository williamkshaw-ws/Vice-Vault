import puppeteer from 'puppeteer';

async function run() {
  const url = 'https://www.vicegolf.com/golf-balls/vice-golf-pro-white';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Extracting outerHTML of the color container...');
    const result = await page.evaluate(() => {
      // Find element containing "Colour Variants" or "Color:"
      const containers = Array.from(document.querySelectorAll('div, form, section'));
      const colorContainer = containers.find(el => {
        const text = el.innerText || '';
        return text.includes('Color:') && text.includes('Variants') && el.className.includes('flex');
      });
      return colorContainer ? colorContainer.outerHTML : 'Not found by dynamic search';
    });

    console.log('--- HTML RESULT ---');
    console.log(result);
    console.log('-------------------');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();

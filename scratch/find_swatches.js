import puppeteer from 'puppeteer';

async function run() {
  console.log('Launching browser to find swatches...');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://www.vicegolf.com/golf-balls/vice-golf-pro-white';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Extracting form/input elements that look like swatches or color selectors...');
    const selectorsInfo = await page.evaluate(() => {
      // Look for input[type=radio], labels, buttons, or elements containing 'color' or 'swatch' classes
      const inputs = Array.from(document.querySelectorAll('input, label, button, a, div'))
        .filter(el => {
          const className = el.className ? String(el.className).toLowerCase() : '';
          const id = el.id ? String(el.id).toLowerCase() : '';
          const name = el.name ? String(el.name).toLowerCase() : '';
          const text = el.innerText ? String(el.innerText).toLowerCase() : '';
          const isColorRelated = className.includes('color') || className.includes('swatch') || className.includes('variant') ||
                                 id.includes('color') || id.includes('swatch') || id.includes('variant') ||
                                 name.includes('color') || name.includes('swatch') || name.includes('variant') ||
                                 text.includes('neon') || text.includes('drip') || text.includes('white') || text.includes('lime') || text.includes('red');
          return isColorRelated;
        });

      return inputs.slice(0, 50).map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        name: el.name || el.getAttribute('name'),
        type: el.getAttribute('type'),
        value: el.getAttribute('value'),
        innerText: el.innerText ? el.innerText.trim().substring(0, 100) : '',
        outerHTML: el.outerHTML.substring(0, 200)
      }));
    });

    console.log(`Found ${selectorsInfo.length} potential selector elements. Listing first 30:`);
    selectorsInfo.slice(0, 30).forEach((el, idx) => {
      console.log(`\n[${idx + 1}] Tag: ${el.tagName} | ID: ${el.id} | Class: ${el.className} | Text: "${el.innerText}"`);
      console.log(`    HTML: ${el.outerHTML}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error finding swatches:', err);
  }
}

run();

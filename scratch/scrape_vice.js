import puppeteer from 'puppeteer';

async function run() {
  console.log('Starting script...');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to https://www.vicegolf.com/us/golf-balls...');
    await page.goto('https://www.vicegolf.com/us/golf-balls', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Extracting all /golf-balls/ links...');
    const allLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .map(a => ({
          href: a.href,
          text: a.innerText.trim(),
          html: a.innerHTML.substring(0, 150)
        }))
        .filter(l => l.href.includes('/golf-balls/') || l.href.includes('/collections/'));
    });

    // Remove duplicates
    const uniqueLinks = [];
    const seen = new Set();
    for (const link of allLinks) {
      if (link.href && !seen.has(link.href)) {
        seen.add(link.href);
        uniqueLinks.push(link);
      }
    }

    console.log(`Found ${uniqueLinks.length} unique links:`);
    uniqueLinks.forEach((link, idx) => {
      console.log(`[${idx + 1}] Text: "${link.text}" | URL: ${link.href}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

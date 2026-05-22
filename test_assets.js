import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`HTTP ERROR: ${response.status()} - ${response.url()}`);
    }
  });

  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();

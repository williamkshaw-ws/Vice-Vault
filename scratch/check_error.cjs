const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.type(), msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  page.on('response', response => {
    if (!response.ok()) console.log('RESPONSE NOT OK:', response.url(), response.status());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait a bit to see if React crashes after load
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  if (content.length < 500) console.log(content);
  
  await browser.close();
})();

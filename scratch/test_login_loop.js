import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log('Setting mock user in localStorage...');
  await page.evaluate(() => {
    localStorage.setItem('vice_vault_mock_user', JSON.stringify({
      uid: 'u-test',
      username: 'test',
      isMock: true
    }));
  });
  
  console.log('Reloading...');
  await page.reload({ waitUntil: 'networkidle0' });
  
  console.log('Checking if loading vault...');
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes('Loading Vault')) {
    console.log('STUCK ON LOADING VAULT!');
  } else {
    console.log('Not stuck on loading vault. Content snippet:', text.substring(0, 100));
  }
  
  await browser.close();
})();

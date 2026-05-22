import puppeteer from 'puppeteer';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
    console.log(`BROWSER LOG [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('BROWSER PAGE ERROR:', err);
  });

  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('Checking for global-login-btn...');
    const loginBtn = await page.$('#global-login-btn');
    if (!loginBtn) {
      console.log('Global login button NOT found! Let\'s print out visible buttons.');
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText,
          id: b.id,
          visible: b.offsetWidth > 0 && b.offsetHeight > 0
        }));
      });
      console.log('Visible buttons:', buttons);
      
      const bodyHtml = await page.evaluate(() => document.body.innerHTML);
      console.log('Body HTML length:', bodyHtml.length);
      await browser.close();
      return;
    }

    console.log('Found Login button. Clicking it...');
    await loginBtn.click();

    console.log('Waiting 1 second for modal transition...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Checking if Auth Modal is rendered...');
    const authModal = await page.$('#auth-modal-container');
    if (authModal) {
      console.log('SUCCESS: Auth Modal is rendered in the DOM!');
      const modalText = await page.evaluate(el => el.innerText, authModal);
      console.log('Modal text content preview:\n', modalText.substring(0, 200));

      // Take a screenshot of the page
      console.log('Taking screenshot of the open modal...');
      await page.screenshot({ path: './login_modal.png' });
      console.log('Screenshot saved to ./login_modal.png');
    } else {
      console.log('FAIL: Auth Modal container (#auth-modal-container) was NOT found in the DOM after clicking.');
    }

    if (consoleErrors.length > 0) {
      console.log('Console errors captured during run:', consoleErrors);
    }

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();

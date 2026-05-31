const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  if (!fs.existsSync('scratch/screenshots')) {
    fs.mkdirSync('scratch/screenshots', { recursive: true });
  }

  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();
  
  // Handle dialogs (like confirm delete)
  page.on('dialog', async dialog => {
    console.log(`Accepting dialog: ${dialog.message()}`);
    await dialog.accept();
  });
  
  // Custom helper
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const snap = async (name) => {
    await delay(500); // UI stabilization
    await page.screenshot({ path: `scratch/screenshots/${name}.png` });
    console.log(`Saved screenshot: ${name}.png`);
  };

  try {
    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await snap('01_LandingPage');

    // Check if Auth Modal is open
    const authContainer = await page.$('#auth-modal-container');
    if (!authContainer) {
       // Need to click login
       const btns = await page.$$('button');
       for (const btn of btns) {
         const text = await page.evaluate(el => el.innerText, btn);
         if (text && text.includes('Login')) {
           await btn.click();
           break;
         }
       }
       await page.waitForSelector('#auth-modal-container', { visible: true, timeout: 3000 });
    }

    console.log("On Auth Modal...");
    
    // Fill signup
    // Find Sign Up tab
    const tabs = await page.$$('button');
    for (const tab of tabs) {
       const text = await page.evaluate(el => el.innerText, tab);
       if (text && text.includes('Sign Up')) {
         await tab.click();
         break;
       }
    }
    
    await delay(500);
    await snap('02_SignUpForm');

    // Fill form
    const inputs = await page.$$('input');
    // Name, Username, Email, Password, Confirm Password
    if (inputs.length >= 5) {
      await inputs[0].type('Test User');
      await inputs[1].type('testuser');
      await inputs[2].type('test@vault.com');
      await inputs[3].type('SuperPass123!');
      await inputs[4].type('SuperPass123!');
    }

    // Click Create Account / submit
    const submitBtn = await page.$('#signup-form button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    
    await delay(2000); // Wait for login to complete
    await snap('03_LoggedInVault');
    
    console.log("Logged in. Adding items to bag...");

    // Find a plus button in vault
    const addBtns = await page.$$('button[id^="btn-open-add-"]');
    if (addBtns.length > 0) {
      await addBtns[0].evaluate(b => b.click());
      await delay(500);
      
      // select Sleeve
      const sleeveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.includes('Sleeve'));
      });
      if (sleeveBtn) await sleeveBtn.evaluate(b => b.click());
      
      await snap('04_AddSleeveForm');
      
      // Submit "Add to Bag"
      const addSubmit = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
        return btns.find(b => b.innerText.includes('Add to Bag') || b.innerText.includes('Add Successful'));
      });
      if (addSubmit) await addSubmit.evaluate(b => b.click());
      await delay(1500);
    }
    
    // Add another item
    const addBtns2 = await page.$$('button[id^="btn-open-add-"]');
    if (addBtns2.length > 1) {
      await addBtns2[1].evaluate(b => b.click());
      await delay(500);
      
      // select Box
      const boxBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.includes('Box'));
      });
      if (boxBtn) await boxBtn.evaluate(b => b.click());
      
      await snap('05_AddBoxForm');
      
      // Submit "Add to Bag"
      const addSubmit2 = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
        return btns.find(b => b.innerText.includes('Add to Bag'));
      });
      if (addSubmit2) await addSubmit2.evaluate(b => b.click());
      await delay(1500);
    }

    console.log("Navigating to My Bag...");
    const myBagTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('My Bag'));
    });
    if (myBagTab) await myBagTab.evaluate(b => b.click());
    await delay(1000);
    await snap('06_MyBagView');

    console.log("Editing quantity in My Bag...");
    // Find an Edit button in bag
    const editBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Edit'));
    });
    if (editBtn) await editBtn.evaluate(b => b.click());
    await delay(500);
    
    const incrementBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText === '+');
    });
    if (incrementBtn) await incrementBtn.evaluate(b => b.click());
    await snap('07_EditQuantity');
    
    const saveBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Save'));
    });
    if (saveBtn) await saveBtn.evaluate(b => b.click());
    await delay(1000);
    await snap('08_MyBagUpdated');

    // Logout via local storage clear and refresh
    console.log("Logging out and logging in as admin...");
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(1000);
    
    const authContainer2 = await page.$('#auth-modal-container');
    if (!authContainer2) {
       const btns = await page.$$('button');
       for (const btn of btns) {
         const text = await page.evaluate(el => el.innerText, btn);
         if (text && text.includes('Login')) {
           await btn.evaluate(b => b.click());
           break;
         }
       }
       await page.waitForSelector('#auth-modal-container', { visible: true, timeout: 3000 });
    }
    
    // Login as Admin
    const loginInputs = await page.$$('input');
    if (loginInputs.length >= 2) {
      await loginInputs[0].type('admin');
      await loginInputs[1].type('AdminPass123!');
    }
    const loginSubmit = await page.$('#signin-form button[type="submit"]');
    if (loginSubmit) await loginSubmit.evaluate(b => b.click());
    await delay(2000);
    await snap('09_AdminVaultView');

    console.log("Going to Admin Panel...");
    const adminPanelTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Missing Ball'));
    });
    if (adminPanelTab) await adminPanelTab.evaluate(b => b.click());
    await delay(1000);
    await snap('10_AdminMissingBallForm');

    console.log("Filling Missing Ball Form...");
    // ID missing-model-input
    await page.type('#missing-model-input', 'TEST MODEL');
    await page.type('#missing-name-input', 'TEST NAME');
    await page.type('#missing-color-input', 'TEST COLOR');
    
    const addMissingSubmit = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
      return btns.find(b => b.innerText.includes('Register Item'));
    });
    if (addMissingSubmit) await addMissingSubmit.evaluate(b => b.click());
    await delay(1500);
    await snap('11_AdminAddedBall');

    console.log("Returning to vault to delete...");
    const vaultTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Vault'));
    });
    if (vaultTab) await vaultTab.evaluate(b => b.click());
    await delay(1000);
    
    // Turn on Edit Mode if necessary? Actually, the delete trash icon appears if isEditMode is true.
    // Let's click "Edit Catalog" if it exists.
    const editCatalogBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Edit Catalog'));
    });
    if (editCatalogBtn) {
      await editCatalogBtn.evaluate(b => b.click());
      await delay(500);
    }
    
    // Now click the Trash bin of the test item
    const trashBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerHTML.includes('lucide-trash'));
    });
    if (trashBtn) await trashBtn.evaluate(b => b.click());
    
    await delay(1000);
    await snap('12_AdminDeletedBall');

    console.log("Done!");
  } catch(e) {
    console.error("Error during puppeteer test:", e);
    await snap('ERROR_STATE');
  } finally {
    await browser.close();
  }
})();

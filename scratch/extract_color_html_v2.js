import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    console.log('Searching for color/swatch containers...');
    const result = await page.evaluate(() => {
      // Find all divs and filter for color options
      const divs = Array.from(document.querySelectorAll('div'));
      const colorDivs = divs.filter(d => {
        const text = d.innerText || '';
        return text.includes('Color:') && text.includes('Variants');
      });
      
      // Sort by length ascending to get the smallest matching container
      colorDivs.sort((a, b) => a.innerText.length - b.innerText.length);
      
      if (colorDivs.length > 0) {
        return colorDivs[0].outerHTML;
      }
      
      // Fallback: search for elements with class names containing 'variant' or 'color'
      const buttons = Array.from(document.querySelectorAll('button, a, label'))
        .filter(el => {
          const text = (el.innerText || '').toLowerCase();
          return text.includes('lime') || text.includes('red') || text.includes('drip') || text.includes('white');
        })
        .map(el => el.outerHTML);
        
      return 'FALLBACK SWATCH ELEMENTS:\n' + buttons.slice(0, 20).join('\n\n');
    });

    const outputPath = path.join(__dirname, 'color_container.html');
    fs.writeFileSync(outputPath, result, 'utf-8');
    console.log(`Successfully wrote color container HTML to: ${outputPath}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();

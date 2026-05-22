import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/scraped_vice_balls.json');
if (!fs.existsSync(filePath)) {
  console.error('File not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const keywords = ['lime', 'red', 'drip', 'splatter', 'gold', 'blue', 'yellow', 'teal', 'hue', 'sunset', 'shade'];

console.log('Searching scraped images for keywords...');
data.forEach(item => {
  console.log(`\nModel: ${item.model}`);
  const matches = [];
  item.images.forEach(img => {
    const srcLower = img.src.toLowerCase();
    const altLower = (img.alt || '').toLowerCase();
    const matchedKeywords = keywords.filter(kw => srcLower.includes(kw) || altLower.includes(kw));
    if (matchedKeywords.length > 0) {
      matches.push({
        keywords: matchedKeywords,
        src: img.src,
        alt: img.alt
      });
    }
  });

  console.log(`Found ${matches.length} matches:`);
  // Remove duplicate URLs
  const uniqueMatches = [];
  const seen = new Set();
  for (const m of matches) {
    if (!seen.has(m.src)) {
      seen.add(m.src);
      uniqueMatches.push(m);
    }
  }
  
  uniqueMatches.slice(0, 15).forEach((m, idx) => {
    console.log(`  [${idx+1}] Keywords: ${m.keywords.join(', ')}`);
    console.log(`      Alt: "${m.alt}"`);
    console.log(`      Src: ${m.src}`);
  });
  if (uniqueMatches.length > 15) {
    console.log(`  ... and ${uniqueMatches.length - 15} more matches`);
  }
});

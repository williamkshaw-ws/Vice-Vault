import fs from 'fs';
import path from 'path';

// Just trying to see if there is any other file with apiKey
try {
  const files = fs.readdirSync('./');
  files.forEach(f => {
    if (f.includes('config') || f.includes('firebase')) {
      console.log(f);
    }
  });
} catch (e) {}

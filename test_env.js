import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
console.log(envFile);

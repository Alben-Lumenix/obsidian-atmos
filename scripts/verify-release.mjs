import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const manifestPath = new URL('../manifest.json', import.meta.url);
const bundlePath = new URL('../main.js', import.meta.url);

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const requiredFields = ['id', 'name', 'version', 'minAppVersion', 'description', 'author'];
const missingFields = requiredFields.filter(
  (field) => typeof manifest[field] !== 'string' || manifest[field].trim() === '',
);

if (missingFields.length > 0) {
  throw new Error(`manifest.json is missing required string fields: ${missingFields.join(', ')}`);
}

await access(bundlePath, constants.R_OK);
const bundle = await readFile(bundlePath);

if (bundle.length === 0) {
  throw new Error('main.js exists but is empty');
}

console.log('Release verification passed: manifest.json is valid and main.js is present.');

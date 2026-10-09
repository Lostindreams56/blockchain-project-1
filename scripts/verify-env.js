/**
 * Environment setup and verification helper script.
 * Copies .env.example files to .env if they do not exist.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = [
  { dir: 'server', example: '.env.example', target: '.env' },
  { dir: 'client', example: '.env.example', target: '.env' },
  { dir: 'ml-service', example: '.env.example', target: '.env' },
];

console.log('[Setup] Checking environment files across workspace...');

for (const { dir, example, target } of targets) {
  const examplePath = path.join(rootDir, dir, example);
  const targetPath = path.join(rootDir, dir, target);

  if (fs.existsSync(examplePath)) {
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(examplePath, targetPath);
      console.log(`[Setup] Created default ${dir}/${target} from template.`);
    } else {
      console.log(`[Setup] ${dir}/${target} already exists.`);
    }
  } else {
    console.warn(`[Setup] Warning: ${dir}/${example} not found.`);
  }
}

console.log('[Setup] Environment verification complete.');

// Save this as summarize-test.ts in your project root and run with: npx ts-node summarize-test.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = __dirname;
const OUTPUT_FILE = path.join(__dirname, 'test-summary.txt');

function walkDir(dir: string, fileList: string[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fullPath === OUTPUT_FILE) return; // Skip the output file to avoid including it

    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

function summarize() {
  const files = walkDir(SRC_DIR);
  let summary = '';
  files.forEach((file) => {
    summary += `// filepath: ${path.relative(__dirname, file)}\n`;
    summary += fs.readFileSync(file, 'utf-8') + '\n\n';
  });
  fs.writeFileSync(OUTPUT_FILE, summary, 'utf-8');
  console.log(`Summary written to ${OUTPUT_FILE}`);
}

summarize();

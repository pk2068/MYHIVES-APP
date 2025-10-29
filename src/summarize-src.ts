// Save this as summarize-src.ts in your project root and run with: npx ts-node summarize-src.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = __dirname;
const OUTPUT_FILE = path.join(__dirname, 'src-summary3.txt');

function walkDir(dir: string, fileList: string[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
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

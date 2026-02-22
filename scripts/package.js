/**
 * Package script for Chrome Web Store submission
 * Creates a production-ready zip file of the extension
 */
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const OUTPUT_DIR = join(__dirname, '..', 'releases');
const OUTPUT_FILE = 'aws-account-manager-v1.0.0.zip';

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create output stream
const output = createWriteStream(join(OUTPUT_DIR, OUTPUT_FILE));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen to archive events
output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Package created successfully!`);
  console.log(`📦 File: ${OUTPUT_FILE}`);
  console.log(`📊 Size: ${sizeInMB} MB`);
  console.log(`📍 Location: ${join(OUTPUT_DIR, OUTPUT_FILE)}`);
  console.log(`\n🚀 Ready for Chrome Web Store upload!`);
});

archive.on('error', (err) => {
  throw err;
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Pipe archive data to the file
archive.pipe(output);

// Add files from dist directory
console.log('📦 Packaging extension...\n');

// Files and directories to exclude from the package
const EXCLUDE_PATTERNS = [
  '.vite',
  'node_modules',
  '.git',
  '.DS_Store',
  'Thumbs.db'
];

// Check if file/directory should be excluded
function shouldExclude(name) {
  return EXCLUDE_PATTERNS.some(pattern => name.includes(pattern));
}

// Recursively add directory
function addDirectory(dirPath, zipPath = '') {
  const items = readdirSync(dirPath);
  
  items.forEach(item => {
    if (shouldExclude(item)) {
      console.log(`⏭️  Skipping: ${item}`);
      return;
    }
    
    const fullPath = join(dirPath, item);
    const zipItemPath = zipPath ? join(zipPath, item) : item;
    const stats = statSync(fullPath);
    
    if (stats.isDirectory()) {
      addDirectory(fullPath, zipItemPath);
    } else {
      archive.file(fullPath, { name: zipItemPath });
      console.log(`✓ Added: ${zipItemPath}`);
    }
  });
}

// Start packaging
try {
  if (!existsSync(DIST_DIR)) {
    console.error('❌ Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  addDirectory(DIST_DIR);
  
  // Finalize the archive
  archive.finalize();
} catch (error) {
  console.error('❌ Packaging failed:', error);
  process.exit(1);
}

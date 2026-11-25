import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[Build] 1. Bundling server for Node/Vercel/Netlify...');
execSync('npx esbuild server/src/index.ts --bundle --platform=node --format=esm --outfile=server/dist/index.js', { stdio: 'inherit' });
execSync('npx esbuild server/src/index.ts --bundle --platform=node --format=esm --outfile=api/index.js', { stdio: 'inherit' });

console.log('[Build] 2. Building client Vite application...');
execSync('npm --prefix client run build', { stdio: 'inherit' });

console.log('[Build] 3. Syncing client build to root dist directory...');
const clientDist = path.resolve('client/dist');
const rootDist = path.resolve('dist');

if (fs.existsSync(clientDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('[Build] Static assets successfully synchronized to root /dist');
} else {
  console.error('[Build] Error: client/dist not found after Vite build!');
  process.exit(1);
}

console.log('[Build] Build completed successfully! ✨');

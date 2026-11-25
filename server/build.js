import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const banner = `import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);
const __dirname = process.cwd();
const __filename = process.cwd() + '/index.js';`;

await esbuild.build({
  entryPoints: [path.resolve(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  banner: { js: banner },
  outfile: path.resolve(__dirname, 'dist/index.js'),
  target: 'node18',
});

console.log('[Server Build] Successfully built server/dist/index.js with ESM shims');

import { build } from '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild/lib/main.js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';

mkdirSync('dist', { recursive: true });

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outdir: 'dist',
  entryNames: '[name]',
  format: 'esm',
  jsx: 'automatic',
  loader: {
    '.jsx': 'jsx',
    '.js': 'js',
    '.css': 'local-css',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: false,
}).catch(e => { console.error(e.message); process.exit(1); });

// Generate index.html
const html = readFileSync('index.html', 'utf8')
  .replace(
    '<script type="module" src="/src/main.jsx"></script>',
    '<link rel="stylesheet" href="./main.css"><script type="module" src="./main.js"></script>'
  );
writeFileSync('dist/index.html', html);
console.log('Build complete → dist/');

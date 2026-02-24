import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { build } from '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild/lib/main.js';
import { writeFileSync, mkdirSync } from 'fs';

const PORT = 3000;

async function rebuild() {
  mkdirSync('dist', { recursive: true });
  await build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    jsx: 'automatic',
    loader: { '.jsx': 'jsx', '.js': 'js', '.css': 'local-css' },
    define: { 'process.env.NODE_ENV': '"development"' },
  }).catch(e => console.error('Build error:', e.message));
  const html = readFileSync('index.html', 'utf8')
    .replace('<script type="module" src="/src/main.jsx"></script>',
      '<link rel="stylesheet" href="./main.css"><script type="module" src="./main.js"></script>');
  writeFileSync('dist/index.html', html);
  console.log('Built at', new Date().toLocaleTimeString());
}

await rebuild();

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };

createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join('dist', url);
  if (existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] ?? 'text/plain');
    res.end(readFileSync(filePath));
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(readFileSync('dist/index.html'));
  }
}).listen(PORT, () => console.log(`Dev server: http://localhost:${PORT}`));

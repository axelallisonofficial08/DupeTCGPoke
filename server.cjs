const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8'
};

http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, {'Allow':'GET, HEAD'}).end();
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const filename = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, filename);
  if (!target.startsWith(root + path.sep) || filename.startsWith('.')) {
    response.writeHead(403).end();
    return;
  }
  fs.stat(target, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      ...(filename === 'service-worker.js' ? {'Service-Worker-Allowed':'/'} : {})
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(target).pipe(response);
  });
}).listen(port, host, () => console.log('Pokémon TCG webapp: http://' + host + ':' + port));

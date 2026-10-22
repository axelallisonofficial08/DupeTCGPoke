const {spawn} = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const port = 43000 + Math.floor(Math.random() * 10000);
const server = spawn(process.execPath, ['server.cjs'], {
  cwd: __dirname, env: {...process.env, PORT: String(port)}, stdio: ['ignore','pipe','pipe']
});
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });

async function waitForServer() {
  for (let i=0;i<50;i++) {
    if (serverOutput.includes('http://')) return;
    if (server.exitCode !== null) throw new Error(serverOutput || 'Server exited');
    await new Promise(resolve => setTimeout(resolve,100));
  }
  throw new Error('Server did not start: ' + serverOutput);
}

async function run() {
  try {
    await waitForServer();
    const base = 'http://127.0.0.1:' + port;
    const paths = ['/', '/index.html', '/tcg-data.js', '/mega-engine.js', '/pro-ai.js', '/lucario-ai.js', '/dragapult-ai.js', '/app.js', '/styles.css', '/manifest.webmanifest', '/service-worker.js', '/icon-192.png', '/icon-512.png', '/assets/cards/me2pt5-113.png', '/assets/cards/me2-13.png', '/assets/cards/me2pt5-160.png', '/assets/cards/sv10-155.png'];
    for (const path of paths) {
      const response = await fetch(base + path);
      assert.equal(response.status,200,path);
      assert.ok((await response.arrayBuffer()).byteLength > 0,path);
    }
    const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
    assert.equal(manifest.display,'standalone');
    for (const size of [192,512]) {
      assert.ok(manifest.icons.some(icon => icon.sizes === size+'x'+size));
      const png = fs.readFileSync('icon-'+size+'.png');
      assert.equal(png.readUInt32BE(16),size);
      assert.equal(png.readUInt32BE(20),size);
    }
    const handlers = {};
    let cachedFiles = [];
    const fakeSelf = {addEventListener(name,fn) { handlers[name]=fn; }, skipWaiting() { return Promise.resolve(); }};
    const fakeCaches = {open: async () => ({addAll: async files => {
      cachedFiles=files;
      for (const file of files) assert.ok(fs.existsSync(file==='./'?'index.html':file), 'precache asset: '+file);
    }})};
    vm.runInNewContext(fs.readFileSync('service-worker.js','utf8'),{self:fakeSelf,caches:fakeCaches,Promise});
    let installPromise;
    handlers.install({waitUntil(promise) { installPromise=promise; }});
    await installPromise;
    assert.ok(cachedFiles.length>=50,'app shell and card images are precached');
    console.log('Webapp smoke test passed.');
  } finally { server.kill(); }
}
run().catch(error => { console.error(error); process.exitCode=1; });

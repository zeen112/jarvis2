const express = require('express');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

let routerLog = 'Memulai 9Router...\n';

// 1. Jalankan Service 9Router mengikat ke 127.0.0.1 (Local Only)
console.log('[9Router] Memulai service 9Router...');
const routerProc = spawn('npx', ['9router', '--host', '127.0.0.1', '--port', '20128'], {
  stdio: 'pipe',
  shell: true
});

routerProc.stdout.on('data', (data) => {
  const msg = data.toString();
  console.log('[9Router STDOUT]:', msg);
  routerLog += msg;
});

routerProc.stderr.on('data', (data) => {
  const msg = data.toString();
  console.error('[9Router STDERR]:', msg);
  routerLog += '[ERROR] ' + msg;
});

// 2. Jalankan Hermes Bot Telegram (Jeda 10 detik)
setTimeout(() => {
  console.log('[Hermes] Memulai Hermes Bot Telegram...');
  const hermesProc = spawn('npx', ['--no-install', 'hermes-agent', 'telegram', 'start'], {
    stdio: 'inherit',
    shell: true
  });
}, 10000);

// 3. Setup Reverse Proxy
const routerProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:20128',
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <h3>9Router Belum Siap / Mengalami Kendala</h3>
          <p>Berikut adalah log internal dari 9Router:</p>
          <pre style="background: #111; color: #0f0; padding: 15px; border-radius: 5px;">${routerLog}</pre>
          <p><i>Silakan refresh jika log di atas menunjukkan proses startup masih berjalan.</i></p>
        `);
      }
    }
  }
});

app.use('/', routerProxy);

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});

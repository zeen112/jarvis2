const express = require('express');
const { exec } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

let routerLog = '=== Memulai Sistem ===\n';

// 1. Eksekusi 9Router dengan flag -H (Host) dan -n (No Browser)
console.log('[9Router] Memulai service...');

// Menggunakan -n agar dia tidak mati setelah mencoba buka browser
// Menggunakan --skip-update agar lebih stabil di server
const routerProc = exec('./node_modules/.bin/9router -H 127.0.0.1 -p 20128 -n --skip-update', {
  env: { ...process.env, CI: 'true', NO_COLOR: '1' }
});

routerProc.stdout.on('data', (data) => {
  routerLog += data;
  console.log('[9Router STDOUT]:', data.trim());
});

routerProc.stderr.on('data', (data) => {
  routerLog += data;
  console.error('[9Router STDERR]:', data.trim());
});

routerProc.on('exit', (code) => {
  routerLog += `\n[SYSTEM] 9Router Exit Code: ${code}\n`;
});

// 2. Jalankan Hermes Bot Telegram (Jeda 8 detik agar 9Router siap)
setTimeout(() => {
  console.log('[Hermes] Memulai Hermes Bot Telegram...');
  exec('./node_modules/.bin/hermes-agent telegram start');
}, 8000);

// 3. Reverse Proxy HTTP ke Web UI 9Router
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:20128',
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <body style="background:#121212; color:#4af626; font-family:monospace; padding:30px;">
            <h2>⏳ 9Router Sedang Booting...</h2>
            <p>Silakan tekan <b>Refresh / F5</b> dalam 3-5 detik.</p>
            <hr style="border:1px dashed #333; margin:20px 0;" />
            <pre style="white-space: pre-wrap; font-size:14px;">${routerLog}</pre>
          </body>
        `);
      }
    }
  }
}));

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});

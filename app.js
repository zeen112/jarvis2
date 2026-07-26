const express = require('express');
const { exec } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

let routerLog = '=== Memulai Sistem ===\n';

// 1. Eksekusi murni (exec) layaknya ketik manual di terminal
console.log('[9Router] Memulai service...');

// Menggunakan tanda sama dengan (=) untuk mencegah argumen terpecah di npx
const routerProc = exec('HOST=127.0.0.1 npx 9router --host=127.0.0.1 --port=20128', {
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

// 2. Jalankan Hermes Bot Telegram (Jeda 8 detik)
setTimeout(() => {
  console.log('[Hermes] Memulai Hermes Bot Telegram...');
  exec('npx hermes-agent telegram start');
}, 8000);

// 3. Reverse Proxy (V3)
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

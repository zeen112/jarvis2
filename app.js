const express = require('express');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

// 1. Jalankan Service 9Router (Port 20128)
console.log('[9Router] Memulai service 9Router...');
const routerProc = spawn('npx', ['--no-install', '9router', '--host', '0.0.0.0', '--port', '20128'], {
  stdio: 'inherit',
  shell: true
});

routerProc.on('error', (err) => {
  console.error('[9Router Error]:', err);
});

// 2. Jalankan Hermes Bot Telegram (Jeda 10 detik)
setTimeout(() => {
  console.log('[Hermes] Memulai Hermes Bot Telegram...');
  const hermesProc = spawn('npx', ['--no-install', 'hermes-agent', 'telegram', 'start'], {
    stdio: 'inherit',
    shell: true
  });

  hermesProc.on('error', (err) => {
    console.error('[Hermes Error]:', err);
  });
}, 10000);

// 3. Reverse Proxy kompatibel v3.x
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:20128',
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, req, res) => {
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end('<h3>9Router sedang proses booting... Silakan refresh halaman ini dalam beberapa detik.</h3>');
    }
  }
}));

// 4. Jalankan Server Express
app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});

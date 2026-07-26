const express = require('express');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

// Reverse Proxy: Teruskan SEMUA trafik (UI Dashboard + API /v1 + WebSockets) ke 9Router
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:20128',
  changeOrigin: true,
  ws: true // Penting agar fitur real-time/logs di UI 9Router berfungsi lancar
}));

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);

  // 1. Memulai service 9Router (di port internal 20128)
  console.log('[9Router] Memulai service 9Router...');
  const routerProc = spawn('npx', ['--no-install', '9router', '--host', '0.0.0.0', '--port', '20128'], {
    stdio: 'inherit',
    shell: true
  });

  routerProc.on('error', (err) => {
    console.error('[9Router Error]:', err);
  });

  // 2. Memulai Hermes Bot Telegram (dijeda 10 detik agar 9Router siap)
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
});

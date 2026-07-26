const express = require('express');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

let routerLog = 'Memulai 9Router Service...\n';

// 1. Eksekusi 9Router dengan Environment Server/Headless
console.log('[9Router] Memulai service 9Router...');

const env9Router = {
  ...process.env,
  PORT: '20128',
  HOST: '127.0.0.1',
  BIND_HOST: '127.0.0.1',
  NO_COLOR: '1',
  CI: 'true',
  FORCE_COLOR: '0'
};

// Kita jalankan 9router langsung tanpa flag aneh yang di-reject parser CLI-nya
const routerProc = spawn('npx', ['--yes', '9router'], {
  stdio: 'pipe',
  shell: true,
  env: env9Router
});

routerProc.stdout.on('data', (data) => {
  const msg = data.toString();
  console.log('[9Router STDOUT]:', msg);
  routerLog += msg;
});

routerProc.stderr.on('data', (data) => {
  const msg = data.toString();
  console.error('[9Router STDERR]:', msg);
  routerLog += msg;
});

routerProc.on('close', (code) => {
  console.error(`[9Router] Process terhenti dengan exit code: ${code}`);
  routerLog += `\n[SYSTEM] Process exited with code ${code}`;
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

// 3. Reverse Proxy HTTP ke 9Router
const routerProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:20128',
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>⏳ 9Router Sedang Memuat / Mengalami Kendala</h2>
            <p>Silakan refresh halaman ini dalam 5 detik.</p>
            <p><strong>Log Server:</strong></p>
            <pre style="background: #1e1e1e; color: #4af626; padding: 15px; border-radius: 8px; overflow-x: auto;">${routerLog}</pre>
          </div>
        `);
      }
    }
  }
});

app.use('/', routerProxy);

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});

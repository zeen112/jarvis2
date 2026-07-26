const express = require('express');
const { spawn } = require('child_process');

const app = express();
// Menggunakan port dari environment Back4App atau fallback ke 3000
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          @font-face {
            font-family: "Sora";
            src: url("https://example.com/fonts/sora/Sora-SemiBold.ttf");
            font-style: normal;
            font-weight: 600;
            font-display: swap;
          }

          .btn-primary {
            background-color: green;
            color: white;
            border-radius: 0.25rem;
            height: 2.25rem;
          }

          body {
            background-color: #10203A;
            color: #fff;
            font-family: Sora, Arial, sans-serif;
            text-align: center;
            height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to Back4app Containers</h1>
      </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);

  // 1. Memulai 9Router dari dependencies yang sudah ter-install
  console.log('[9Router] Memulai service 9Router...');
  const routerProc = spawn('npx', ['--no-install', '9router', '--host', '0.0.0.0', '--port', '20128'], {
    stdio: 'inherit',
    shell: true
  });

  routerProc.on('error', (err) => {
    console.error('[9Router Error]:', err);
  });

  // 2. Memulai Hermes Bot Telegram (Menggunakan npx --no-install hermes-agent)
  setTimeout(() => {
    console.log('[Hermes] Memulai Hermes Bot Telegram...');
    const hermesProc = spawn('npx', ['--no-install', 'hermes-agent', 'telegram', 'start'], {
      stdio: 'inherit',
      shell: true
    });

    hermesProc.on('error', (err) => {
      console.error('[Hermes Error]:', err);
    });
  }, 5000);
});

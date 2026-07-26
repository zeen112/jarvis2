const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  // Kita panggil menu Bantuan (--help) dari 9Router
  exec('./node_modules/.bin/9router --help', (error, stdout, stderr) => {
    res.send(`
      <body style="background:#121212; color:#4af626; font-family:monospace; padding:30px;">
        <h2>📖 Manual Bantuan 9Router</h2>
        <p>Silakan fotokan atau salin hasil di bawah ini agar kita tahu persis perintah apa yang dia minta!</p>
        <hr style="border:1px dashed #333; margin:20px 0;" />
        <h3>STDOUT:</h3>
        <pre style="white-space: pre-wrap; font-size:14px; background:#000; padding:15px;">${stdout || 'Tidak ada teks'}</pre>
        <h3>STDERR:</h3>
        <pre style="white-space: pre-wrap; font-size:14px; background:#400; padding:15px; color:#f55;">${stderr || 'Tidak ada error'}</pre>
      </body>
    `);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});

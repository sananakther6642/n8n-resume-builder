const http = require('http');
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os   = require('os');

const PORT = process.env.PORT || 3000;

function compileLaTeX(latexSource) {
  const tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'latex-'));
  const texFile = path.join(tmpDir, 'resume.tex');
  const pdfFile = path.join(tmpDir, 'resume.pdf');

  try {
    fs.writeFileSync(texFile, latexSource, 'utf8');
    const cmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory ${tmpDir} ${texFile}`;
    let log = '';
    try {
      log = execSync(cmd, { timeout: 60000, cwd: tmpDir }).toString();
      execSync(cmd, { timeout: 60000, cwd: tmpDir });
    } catch (e) {
      log = (e.stdout || '').toString() + (e.stderr || '').toString();
      if (!fs.existsSync(pdfFile)) {
        const errLines = log.split('\n')
          .filter(l => l.startsWith('!') || l.includes('Error') || l.includes('error'))
          .slice(0, 10).join('\n');
        throw new Error('pdflatex failed:\n' + errLines);
      }
    }
    const pdfBuffer = fs.readFileSync(pdfFile);
    return { success: true, pdfBase64: pdfBuffer.toString('base64'), log };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(_) {}
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'latex-service' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/compile') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const latexSource = payload.latex || payload.content || '';
        if (!latexSource || latexSource.trim().length < 20) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Empty or missing latex field' }));
          return;
        }
        console.log(`[${new Date().toISOString()}] Compiling LaTeX (${latexSource.length} chars)`);
        const result = compileLaTeX(latexSource);
        console.log(`[${new Date().toISOString()}] OK — PDF ${result.pdfBase64.length} chars`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error:`, err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Use POST /compile or GET /health' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`latex-service listening on port ${PORT}`);
});

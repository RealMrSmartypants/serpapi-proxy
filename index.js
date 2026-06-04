const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const pathModule = require('path');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const currentPath = parsed.pathname.replace(/\/+$/, '') || '/';

  // Serve the HTML frontend dashboard at the root URL
  if (currentPath === '/') {
    fs.readFile(pathModule.join(__dirname, 'localseo.html'), 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to load localseo.html. Ensure it is uploaded to your GitHub repository.' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    return;
  }

  if (currentPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'SerpAPI proxy running' }));
    return;
  }

  if (currentPath !== '/search') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use /search?engine=...&q=...' }));
    return;
  }

  const params = new URLSearchParams(parsed.query);
  params.set('api_key', process.env.SERPAPI_KEY || '');

  const serpUrl = `https://serpapi.com/search.json?${params.toString()}`;

  https.get(serpUrl, (serpRes) => {
    let data = '';
    serpRes.on('data', chunk => data += chunk);
    serpRes.on('end', () => {
      res.writeHead(serpRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  }).on('error', (e) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
});

server.listen(PORT, () => console.log(`SerpAPI proxy running on port ${PORT}`));

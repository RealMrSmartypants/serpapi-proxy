const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

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
  const path = parsed.pathname.replace(/\/+$/, '') || '/';

  if (path === '/health' || path === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'SerpAPI proxy running' }));
    return;
  }

  if (path !== '/search') {
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

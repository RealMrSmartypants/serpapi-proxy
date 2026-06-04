const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (parsed.pathname !== '/search') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const params = new URLSearchParams(parsed.query);
  params.set('api_key', process.env.SERPAPI_KEY || '');

  const serpUrl = `https://serpapi.com/search.json?${params.toString()}`;

  https.get(serpUrl, (serpRes) => {
    let data = '';
    serpRes.on('data', chunk => data += chunk);
    serpRes.on('end', () => {
      res.writeHead(serpRes.statusCode, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  }).on('error', (e) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
});

server.listen(PORT, () => console.log(`SerpAPI proxy running on port ${PORT}`));

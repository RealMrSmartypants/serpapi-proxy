const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const GHL_TOKEN = 'pit-24fcad39-7044-43ef-bd8c-1fd61048f76b';

// Helper to serve static assets cleanly from the public directory
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

const server = http.createServer((req, res) => {
  // Global CORS Handling Infrastructure
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // 1. GoHighLevel CRM Lead Processing Node Pipeline
  if (pathname === '/api/lead' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const ghlPayload = JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          companyName: payload.businessName,
          tags: ['lbp-prospect']
        });

        const ghlReq = https.request({
          hostname: 'services.leadconnectorhq.com',
          path: '/contacts/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GHL_TOKEN}`,
            'Version': '2021-04-15'
          }
        }, (ghlRes) => {
          let ghlData = '';
          ghlRes.on('data', d => ghlData += d);
          ghlRes.on('end', () => {
            res.writeHead(ghlRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(ghlData);
          });
        });

        ghlReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        ghlReq.write(ghlPayload);
        ghlReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed payload' }));
      }
    });
    return;
  }

  // 2. SerpAPI Isolated Search Proxy Endpoint Route
  if (pathname === '/search') {
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
    return;
  }

  // 3. Static Assets Web Routing Logic Mapping
  if (pathname === '/' || pathname === '/index.html') {
    serveStaticFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
  } else if (pathname === '/css/style.css') {
    serveStaticFile(res, path.join(__dirname, 'public', 'css', 'style.css'), 'text/css');
  } else if (pathname === '/js/app.js') {
    serveStaticFile(res, path.join(__dirname, 'public', 'js', 'app.js'), 'application/javascript');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Resource not found' }));
  }
});

server.listen(PORT, () => console.log(`Production container active on port ${PORT}`));

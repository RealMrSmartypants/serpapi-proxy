const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const GHL_TOKEN = 'pit-24fcad39-7044-43ef-bd8c-1fd61048f76b';

// Server-Side In-Memory State Containers
const authorizedUserDatabase = new Map(); // Tracks paid subscription timelines
const temporaryVerificationMemory = new Map(); // Restricts to 1 diagnostic look up per user pair

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

  // 1. Administrative Fallback Context Override
  if (pathname === '/api/admin/override' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.secretPhrase === 'admin-bypass-2026') {
          const expirationDate = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 Year Pass
          authorizedUserDatabase.set(payload.email, { plan: 'annual', expiresAt: expirationDate });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Account provisioned successfully via admin override.' }));
        } else {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid admin token authorization sequence.' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed payload data.' }));
      }
    });
    return;
  }

  // 2. GoHighLevel CRM Lead Processing Node Pipeline
  if (pathname === '/api/lead' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // Strict anti-spam validation constraint check
        const verificationTrackingKey = `${payload.email.toLowerCase()}_${payload.phone.replace(/\D/g,'')}`;
        if (temporaryVerificationMemory.has(verificationTrackingKey)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Operational limit reached. This record has already processed a complimentary diagnostic audit.' }));
          return;
        }

        // Structure contact data for GoHighLevel v2 API Locations/Contacts
        const ghlPayload = JSON.stringify({
          name: payload.name,
          firstName: payload.name.split(' ')[0],
          lastName: payload.name.split(' ').slice(1).join(' ') || 'Owner',
          email: payload.email.toLowerCase(),
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
            // Log verification trace to prevent loop exploit scenarios
            temporaryVerificationMemory.set(verificationTrackingKey, true);
            
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
        res.end(JSON.stringify({ error: 'Malformed system verification processing trace.' }));
      }
    });
    return;
  }

  // 3. SerpAPI Isolated Search Proxy Endpoint Route
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

  // 4. Static Assets Web Routing Logic Mapping
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

server.listen(PORT, () => console.log(`Production container running safely on port ${PORT}`));

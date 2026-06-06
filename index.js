const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const GHL_TOKEN = 'pit-24fcad39-7044-43ef-bd8c-1fd61048f76b';

// Helper to serve static files from public directory
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

const server = http.createServer((req, res) => {
  // Global CORS Headers
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

  // 1. GHL CRM Lead Capture Endpoint Routing
  if (pathname === '/api/lead' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // Structure contact data for GoHighLevel v2 API Locations/Contacts
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

  // 2. Paid Subscription Verification & Hidden Admin Check Endpoint
  if (pathname === '/api/auth' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email identifier is required.' }));
          return;
        }

        const targetEmail = payload.email.toLowerCase().trim();
        
        // Add your allowed administrative emails here
        const adminEmails = ['admin@localboostpro.com', 'info@aivoicemagic.com'];

        // Strict hidden administrative override bypass
        if (adminEmails.includes(targetEmail)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ authorized: true, role: 'admin' }));
          return;
        }

        // Query GoHighLevel for existing contact subscription validation tags
        const ghlQueryReq = https.request({
          hostname: 'services.leadconnectorhq.com',
          path: `/contacts/?query=${encodeURIComponent(targetEmail)}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GHL_TOKEN}`,
            'Version': '2021-04-15',
            'Accept': 'application/json'
          }
        }, (ghlQueryRes) => {
          let ghlQueryData = '';
          ghlQueryRes.on('data', chunk => ghlQueryData += chunk);
          ghlQueryRes.on('end', () => {
            try {
              const searchResult = JSON.parse(ghlQueryData);
              const contacts = searchResult.contacts || [];
              
              // Find matching contact configuration details
              const activeContact = contacts.find(c => c.email && c.email.toLowerCase().trim() === targetEmail);
              
              if (activeContact) {
                const contactTags = activeContact.tags || [];
                // Looks for active validation flags applied via GHL workflows or Stripe updates
                const hasPaidAccess = contactTags.some(tag => 
                  ['paid', 'active-subscriber', 'active', 'lbp-paid'].includes(tag.toLowerCase().trim())
                );

                if (hasPaidAccess) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ authorized: true }));
                  return;
                }
              }

              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Access Denied: No up-to-date paid subscription found for this account.' }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to process authentication mapping schema.' }));
            }
          });
        });

        ghlQueryReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        ghlQueryReq.end();

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed authentication package' }));
      }
    });
    return;
  }

  // 3. SerpAPI Isolated Search Proxy Endpoint
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

  // 4. Static Assets Engine Routing
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

// Server-Side In-Memory State Containers
const authorizedUserDatabase = new Map(); // Tracks paid subscription timelines
const temporaryVerificationMemory = new Map(); // Restricts to 1 diagnostic look up per user pair

// Add this administrative fallback context right inside your server routing script:
if (pathname === '/api/admin/override' && req.method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
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
  });
  return;
}

// UPDATE THE /api/lead ENGINES BLOCK TO RESOLVE THE REJECTED TRANSIT EXCEPTION:
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

      // Fix for GHL v2 API: Build correct standard payload structure
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

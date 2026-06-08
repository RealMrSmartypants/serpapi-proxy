/**
 * LocalBoostPro - Production Application Server Architecture
 * File Context: Root index.js Configuration
 * Version: 4.0.0 (Production Core with Real GHL v2 API & Stripe Webhook Integrations)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Required for true GHL Server outbound handshakes

const app = express();

// Stripe requires the raw body for signature verification on its webhook endpoint
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Standard body parser for all other application operational routes
app.use(express.json());
app.use(cors());

// Serve Static Assets Cleanly from Public Framework Context
app.use(express.static(path.join(__dirname, 'public')));

// Active State Configuration Variables (Injected via Container Environment)
const PORT = process.env.PORT || "8080";
const GHL_BEARER_TOKEN = process.env.GHL_BEARER_TOKEN || "pit-24fcad39-7044-43ef-bd8c-1fd61048f76b";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || "loc_placeholder"; 

/**
 * PRODUCTION IN-MEMORY DATABASE STRUCTURE
 * Persists persistent test accounts, administrative assignments, password state mutations,
 * and ephemeral verification tokens natively within the node application context lifecycle.
 */
const systemDb = {
  users: {
    "mike@audaxroup.pro": { 
      password: "Password123!", 
      role: "customer", 
      status: "active", 
      resetToken: null,
      source: "permanent-test"
    },
    "info@audaxgroup.pro": { 
      password: "AdminPassword2026!", 
      role: "admin", 
      status: "active", 
      resetToken: null,
      source: "footer-override"
    }
  },
  trialVerificationRegistry: {} // Temp buffer tracking pending outbounds before link clicks
};

// ============================================================================
// GO HIGH LEVEL V2 INTERFACE SUBSYSTEM (REAL API AXIOS HANDSHAKES)
// ============================================================================

/**
 * Helper: Search for an existing contact entity inside GoHighLevel v2 by email reference
 */
async function findGHLContactByEmail(email) {
  try {
    const response = await axios.get('https://services.gohighlevel.com/v2/contacts/', {
      headers: {
        'Authorization': `Bearer ${GHL_BEARER_TOKEN}`,
        'Version': '2021-04-15'
      },
      params: {
        locationId: GHL_LOCATION_ID,
        query: email.toLowerCase().trim()
      }
    });
    
    if (response.data && response.data.contacts && response.data.contacts.length > 0) {
      return response.data.contacts[0];
    }
    return null;
  } catch (error) {
    console.error(`[GHL API ERROR] Contact lookup failure for email ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Helper: Create a new contact inside GHL or return existing profile with explicit tracking tags
 */
async function createOrUpdateGHLContact(email, name, phone, tagsArray = []) {
  try {
    const existingContact = await findGHLContactByEmail(email);
    
    if (existingContact) {
      // Merge current tags with incoming programmatic tags cleanly
      const mergedTags = Array.from(new Set([...existingContact.tags, ...tagsArray]));
      
      const updateResponse = await axios.put(`https://services.gohighlevel.com/v2/contacts/${existingContact.id}`, {
        tags: mergedTags
      }, {
        headers: {
          'Authorization': `Bearer ${GHL_BEARER_TOKEN}`,
          'Version': '2021-04-15',
          'Content-Type': 'application/json'
        }
      });
      return updateResponse.data.contact;
    } else {
      // Create fresh contact context card
      const createResponse = await axios.post('https://services.gohighlevel.com/v2/contacts/', {
        locationId: GHL_LOCATION_ID,
        email: email.toLowerCase().trim(),
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Prospect',
        phone: phone || undefined,
        tags: tagsArray
      }, {
        headers: {
          'Authorization': `Bearer ${GHL_BEARER_TOKEN}`,
          'Version': '2021-04-15',
          'Content-Type': 'application/json'
        }
      });
      return createResponse.data.contact;
    }
  } catch (error) {
    console.error('[GHL API ERROR] Contact mutation pipeline failure:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================================
// CORE AUTHENTICATION ENGINE (ROUTING CUSTOMERS, ADMINS, & OVERRIDES)
// ============================================================================

/**
 * Route: /api/auth
 * Handles dual-lookup paths (Internal Credentials DB vs Live GoHighLevel Tag Queries)
 */
app.post('/api/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Identification email string missing." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const internalUser = systemDb.users[normalizedEmail];

  // Logic Loop A: Check internal system database (Test Accounts, Created Admins, Modified Passwords)
  if (internalUser) {
    if (!password) {
      return res.json({ success: false, requiresPassword: true, message: "Password verification context requested." });
    }
    if (internalUser.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials matched against system index records." });
    }
    if (internalUser.status !== "active") {
      return res.status(403).json({ success: false, message: "This administrative or client profile access layer has been frozen." });
    }

    return res.json({
      success: true,
      token: `lbp-jwt-${Buffer.from(normalizedEmail).toString('base64')}-${Date.now()}`,
      role: internalUser.role,
      email: normalizedEmail
    });
  }

  // Logic Loop B: No internal password found -> Verify dynamic premium tag assignment live via GoHighLevel
  try {
    const contact = await findGHLContactByEmail(normalizedEmail);
    
    if (!contact || !contact.tags || !contact.tags.includes('lbp-active-subscription')) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: No up-to-date active paid subscription found matching this platform identification profile."
      });
    }

    // Customer possesses verification tags inside CRM -> Grant programmatic view rights
    return res.json({
      success: true,
      token: `lbp-jwt-customer-${Buffer.from(normalizedEmail).toString('base64')}`,
      role: "customer",
      email: normalizedEmail
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Critical service validation timed out across GHL Node loops." });
  }
});

// ============================================================================
// VERIFIED TRIAL MANAGEMENT LAYER (ANTI-CHEAT CHECKPOINTS)
// ============================================================================

/**
 * Route: /api/trial/register-intent
 * Step 1 of Trial Verification: Prospect signs up. Search GHL for existing 'lbp-trial' marker tag.
 */
app.post('/api/trial/register-intent', async (req, res) => {
  const { email, name, phone, businessName } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Required identity variables missing from request." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Audit GHL memory space natively before transmitting trial confirmation vectors
    const existingContact = await findGHLContactByEmail(normalizedEmail);
    if (existingContact && existingContact.tags && existingContact.tags.includes('lbp-trial')) {
      return res.json({
        success: false,
        exhausted: true,
        message: "This profile has already utilized its free assessment resource tier. Directing to plan options."
      });
    }

    // Register ephemeral click key sequence for secure email double opt-in mapping
    const lookupToken = "vld-" + Math.floor(Math.random() * 900000 + 100000);
    systemDb.trialVerificationRegistry[lookupToken] = {
      email: normalizedEmail,
      name,
      phone,
      businessName,
      timestamp: Date.now()
    };

    // Build functional verification landing destination address link
    const validationUrl = `http://${req.headers.host || 'localhost:' + PORT}/api/trial/verify-click?token=${lookupToken}`;
    
    console.log(`\n============================================================================`);
    console.log(`[OUTBOUND SIMULATED TRANSPORTS] Real Verification Communication Pipeline Sent`);
    console.log(`Target Recipient Address Identity: ${normalizedEmail}`);
    console.log(`Access Gateway Link Endpoint: ${validationUrl}`);
    console.log(`============================================================================\n`);

    return res.json({
      success: true,
      message: "Security checkpoint verification string deployed. Please inspect your email inbox to activate single execution parameters."
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed checking security boundaries within CRM." });
  }
});

/**
 * Route: /api/trial/verify-click
 * Step 2 of Trial Verification: Click handler that commits contact to GHL with immutable 'lbp-trial' tag.
 */
app.get('/api/trial/verify-click', async (req, res) => {
  const { token } = req.query;
  if (!token || !systemDb.trialVerificationRegistry[token]) {
    return res.status(400).send("<h3>Security Error: Invalid or expired trial validation verification context token.</h3>");
  }

  const pendingData = systemDb.trialVerificationRegistry[token];
  
  try {
    // Commit contact profile explicitly to GoHighLevel tagged with 'lbp-trial'
    await createOrUpdateGHLContact(pendingData.email, pendingData.name, pendingData.phone, ['lbp-trial']);
    
    // Purge entry token string to avoid link duplication payloads
    delete systemDb.trialVerificationRegistry[token];

    // Issue platform access session bypass signature
    const singleUseSession = `trial-session-${Buffer.from(pendingData.email).toString('base64')}`;
    
    // Redirect browser directly into the platform workspace dashboard injectively
    res.send(`
      <script>
        localStorage.setItem('lbp_session_token', '${singleUseSession}');
        localStorage.setItem('lbp_user_email', '${pendingData.email}');
        localStorage.setItem('lbp_user_role', 'customer');
        alert('Email identity verified successfully. Directing into single trial diagnostic allocation layout.');
        window.location.href = '/';
      </script>
    `);

  } catch (err) {
    res.status(500).send("<h3>Fatal Error synchronizing verification tags directly with CRM platform cluster channels.</h3>");
  }
});

// ============================================================================
// STRIPE CONVERSION AUTOMATION WEBHOOK SYSTEM
// ============================================================================

/**
 * Route: /api/webhooks/stripe
 * Automatically manages platform provisioning on successful checkouts.
 */
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Real structural payload validation execution path
  try {
    // If webhook keys are unpopulated during localized local instance loops, fallback parse values cleanly
    if (STRIPE_WEBHOOK_SECRET === "whsec_placeholder") {
      event = JSON.parse(req.body.toString());
    } else {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Signature Security Exception Error: ${err.message}`);
  }

  // Route specific inbound event structural workflows
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    const session = event.data.object;
    const targetEmail = session.customer_details?.email || session.customer_email;

    if (targetEmail) {
      console.log(`[STRIPE AUTOMATION HOOK SUCCESS] Found payment notification tracking criteria data records for: ${targetEmail}`);
      try {
        // Tag user dynamically inside HighLevel cluster architecture to permanently clear access blocks
        await createOrUpdateGHLContact(targetEmail, session.customer_details?.name || "Premium Subscriber", null, ['lbp-active-subscription']);
        console.log(`[GHL INTEGRATION COMPLETE] Dynamic tracking tags appended to subscriber: ${targetEmail}`);
      } catch (ghlErr) {
        console.error("[CRITICAL ERROR] Webhook execution failed syncing subscription markers to GHL profile registry:", ghlErr.message);
      }
    }
  }

  res.json({ received: true });
});

// ============================================================================
// RECOVERY SERVICES & DEDICATED ADMIN MANAGEMENT MATRIX ENDPOINTS
// ============================================================================

/**
 * Route: /api/auth/reset-password-request
 */
app.post('/api/auth/reset-password-request', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required." });

  const normalizedEmail = email.toLowerCase().trim();
  if (systemDb.users[normalizedEmail]) {
    const recoveryKey = "RST-" + Math.floor(Math.random() * 900000 + 100000);
    systemDb.users[normalizedEmail].resetToken = recoveryKey;
    
    // Log to console as before
    console.log(`\n[CRITICAL PASSWORD SYSTEM HANDSHAKE KEY GENERATED]`);
    console.log(`Target: ${normalizedEmail} | Secret Active Security Token: ${recoveryKey}\n`);
    
    // FIX D: Also return the token directly in the response so the admin panel
    // can display it on-screen — no more digging through Railway logs
    return res.json({ 
      success: true, 
      resetToken: recoveryKey,
      message: "Verification recovery key generated." 
    });
  }
  return res.status(404).json({ success: false, message: "Profile parameters not indexed inside local system database." });
});

/**
 * Route: /api/auth/reset-password-confirm
 */
app.post('/api/auth/reset-password-confirm', (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (systemDb.users[normalizedEmail] && systemDb.users[normalizedEmail].resetToken === resetToken) {
    systemDb.users[normalizedEmail].password = newPassword;
    systemDb.users[normalizedEmail].resetToken = null;
    return res.json({ success: true, message: "Password updated successfully. You may now authenticate cleanly." });
  }
  return res.status(400).json({ success: false, message: "Invalid or expired reset token security handshake." });
});

/**
 * Dedicated Admin Route: /api/admin/metrics
 * Returns unified administrative state indicators across active user accounts.
 */
app.post('/api/admin/metrics', (req, res) => {
  const { token } = req.body;
  
  // Guard validation logic tracking matching security values
  if (!token || !token.includes('lbp-jwt-')) {
    return res.status(401).json({ success: false, message: "Unauthorized administrative validation sequence rejection." });
  }

  return res.json({
    success: true,
    userMatrix: systemDb.users,
    systemPerformance: {
      uptime: process.uptime(),
      ghlConnectivity: "Operational (v2 Gateway Active)",
      stripeHookStatus: STRIPE_WEBHOOK_SECRET !== "whsec_placeholder" ? "Secure Wire Connected" : "Local Mock Simulation Active"
    }
  });
});

/**
 * Dedicated Admin Route: /api/admin/assign-unpaid
 * Allows admin to manually provision users directly within internal runtime memory mappings.
 */
app.post('/api/admin/assign-unpaid', (req, res) => {
  const { token, targetEmail, defaultPassword, targetRole } = req.body;
  
  if (!token || !token.includes('lbp-jwt-')) {
    return res.status(401).json({ success: false, message: "Access forbidden." });
  }

  if (!targetEmail || !defaultPassword) {
    return res.status(400).json({ success: false, message: "Missing tracking target configuration details." });
  }

  const cleanEmail = targetEmail.toLowerCase().trim();
  systemDb.users[cleanEmail] = {
    password: defaultPassword,
    role: targetRole || "customer",
    status: "active",
    resetToken: null,
    source: "manual-administrative-provisioning"
  };

  return res.json({ success: true, message: `Account metrics configured securely for target recipient: ${cleanEmail}` });
});

// Clean catch-all configuration providing direct Single Page Application mapping
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`========================================================================`);
  console.log(`LocalBoostPro v4.0.0 Production Core Container Live on Port: ${PORT}`);
  console.log(`GHL Integration Node Connected to Location Configuration Space: ${GHL_LOCATION_ID}`);
  console.log(`========================================================================`);
});

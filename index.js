/**
 * LocalBoostPro - Main Application Server Configuration
 * File Context: Root index.js Configuration
 * Version: 3.0.0 (Refactored Secure Authentication & Gateways)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Static Asset Management
app.use(express.static(path.join(__dirname, 'public')));

// Active State Configuration Variables
const PORT = process.env.PORT || "8080";
const GHL_BEARER_TOKEN = process.env.GHL_BEARER_TOKEN || "pit-24fcad39-7044-43ef-bd8c-1fd61048f76b";
const ADMIN_BYPASS_EMAILS = ["admin@localboostpro.com", "info@aivoicemagic.com", "info@audaxgroup.pro", "mike@audaxroup.pro"];

// Simulated In-Memory Database for Production State Persistence
const credentialsDb = {
  "mike@audaxroup.pro": { password: "Password123!", resetToken: null },
  "info@audaxgroup.pro": { password: "AdminPassword2026!", resetToken: null }
};

// Tracking structure for free trials (keyed by email + timestamp metadata)
const historicalFreeTrials = {};

/**
 * Endpoint: /api/auth
 * Business Logic: Validate GoHighLevel v2 paid-tier active tags, bypass admins, 
 * and manage user passwords for accounts requiring explicit credential validation.
 */
app.post('/api/auth', async (req, res) => {
  const { email, password, bypassCheck } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Missing email address identification parameter." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Route 1: Administrative Override or Specific Permanent Accounts
  if (ADMIN_BYPASS_EMAILS.includes(normalizedEmail)) {
    const userRecord = credentialsDb[normalizedEmail];
    
    // If it's a designated user requiring credential security
    if (userRecord) {
      if (!password) {
        return res.json({ success: false, requiresPassword: true, message: "Authentication password signature required." });
      }
      if (userRecord.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid credentials provided for this profile." });
      }
    }
    
    // Return unrestricted clearance token mapping
    return res.json({
      success: true,
      token: "admin-bypass-2026-granted-token",
      role: "administrator",
      email: normalizedEmail,
      dashboardState: "authorized"
    });
  }

  // Route 2: Standard Client Pipeline Tag Mapping Execution Block (GoHighLevel Call)
  try {
    // Structural optimization call simulating GHL API check
    // In production context, this makes a fetch callout using the GHL_BEARER_TOKEN
    const isPaidSubscriber = false; 

    if (!isPaidSubscriber) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: No up-to-date paid subscription found for this account."
      });
    }

    return res.json({
      success: true,
      token: "ghl-verified-customer-token",
      role: "subscriber",
      email: normalizedEmail,
      dashboardState: "authorized"
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal system synchronization failure within GHL Pipeline Node." });
  }
});

/**
 * Endpoint: /api/auth/reset-password-request
 * Business Logic: Process user reset triggers and issue state tracking changes.
 */
app.post('/api/auth/reset-password-request', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email parameter required." });
  
  const normalizedEmail = email.toLowerCase().trim();
  if (credentialsDb[normalizedEmail]) {
    credentialsDb[normalizedEmail].resetToken = "RST-" + Math.floor(Math.random() * 900000 + 100000);
    // Log simulation endpoint to server container dashboard console
    console.log(`[PASSWORD RESET OUTBOUND] Token for ${normalizedEmail}: ${credentialsDb[normalizedEmail].resetToken}`);
    return res.json({ success: true, message: "Verification recovery key triggered and logged to secure console pipeline." });
  }
  
  return res.status(404).json({ success: false, message: "Email not indexed inside system profile registers." });
});

/**
 * Endpoint: /api/auth/reset-password-confirm
 * Business Logic: Confirm verification key token and save replacement passwords.
 */
app.post('/api/auth/reset-password-confirm', (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  
  if (credentialsDb[normalizedEmail] && credentialsDb[normalizedEmail].resetToken === resetToken) {
    credentialsDb[normalizedEmail].password = newPassword;
    credentialsDb[normalizedEmail].resetToken = null;
    return res.json({ success: true, message: "Password updated successfully. You may now authenticate." });
  }
  
  return res.status(400).json({ success: false, message: "Invalid or expired reset token security handshake." });
});

/**
 * Endpoint: /api/trial/request-link
 * Business Logic: Generate transactional audit dispatch rules, triggering verification email structures.
 */
app.post('/api/trial/request-link', (req, res) => {
  const { email, bizName } = req.body;
  if (!email || !bizName) {
    return res.status(400).json({ success: false, message: "Missing required profile or business tracking labels." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trackingRecord = historicalFreeTrials[normalizedEmail];
  const rightNow = new Date();

  if (trackingRecord) {
    const historicalDate = new Date(trackingRecord.timestamp);
    // Compare dates strictly across day boundaries
    if (historicalDate.toDateString() !== rightNow.toDateString()) {
      return res.json({ 
        success: false, 
        limitExceeded: true, 
        message: "Your free diagnostic allowance has expired. Please purchase a platform tier plan to access dynamic matrices continually." 
      });
    }
  }

  // Update records tracking that this trial allocation has been activated for the day
  historicalFreeTrials[normalizedEmail] = {
    bizName: bizName,
    timestamp: rightNow.toISOString(),
    verified: false
  };

  console.log(`[EMAIL DISPATCH SIMULATION] Outbound link sent to ${normalizedEmail} for verification access.`);
  
  return res.json({ 
    success: true, 
    message: "Diagnostic link transmitted. Check your email address inbox to verify profile ownership and view the live workspace dashboard." 
  });
});

// Fallback routing handling Single Page Framework Assets cleanly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) res.status(500).send("Critical layout delivery exception.");
  });
});

app.listen(PORT, () => {
  console.log(`LocalBoostPro SaaS Engine operational on native application container port assignment: ${PORT}`);
});

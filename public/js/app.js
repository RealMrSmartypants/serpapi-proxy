/**
 * LocalBoostPro - Client Engine Architecture File
 * File Context: Public client asset routing map (/public/app.js)
 * Version: 3.0.0 (Integrated Authorization Gateways & Overrides)
 */

// Global Application Application View Layout State Control
let currentSessionToken = null;
let currentAuthenticatedEmail = null;

/**
 * Initialization routing triggered on startup
 */
document.addEventListener("DOMContentLoaded", () => {
  injectAuthenticationModals();
});

/**
 * Renders modal nodes cleanly to encapsulate all login, password demands, and resets inside a single shell
 */
function injectAuthenticationModals() {
  if (document.getElementById("lbp-auth-modal")) return;

  const modalHtml = `
    <div id="lbp-auth-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,10,31,0.9); z-index:99999; align-items:center; justify-content:center; font-family:'Poppins', sans-serif;">
      <div style="background:#14142B; border:2px solid #00E5FF; padding:40px; border-radius:16px; width:100%; max-width:440px; position:relative; box-sizing:border-box; color:#FFF;">
        <span onclick="toggleAuthModal(false)" style="position:absolute; top:15px; right:20px; cursor:pointer; color:#8892A4; font-size:20px;">&times;</span>
        
        <!-- View State 1: Primary Email Verification -->
        <div id="auth-state-email">
          <h3 style="margin-top:0; color:#00E5FF; font-size:22px;">Customer Portal Authentication</h3>
          <p style="color:#8892A4; font-size:13.5px; line-height:1.5;">Enter your registered account email to verify your subscription parameters and grant workspace access paths.</p>
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Account Registration Email</label>
            <input type="email" id="auth-input-email" style="width:100%; padding:14px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:8px; box-sizing:border-box;">
          </div>
          <button onclick="processEmailAuthenticationStep()" style="width:100%; padding:14px; background:#00E5FF; color:#000; border:none; font-weight:700; border-radius:8px; cursor:pointer; font-size:14px;">Verify Account Parameters</button>
        </div>

        <!-- View State 2: Explicit Password Credentials Demand -->
        <div id="auth-state-password" style="display:none;">
          <h3 style="margin-top:0; color:#00E5FF; font-size:22px;">Security Verification</h3>
          <p style="color:#8892A4; font-size:13.5px;">This test account or admin override route requires a password signature validation to pass the framework gate.</p>
          <div style="margin-bottom:20px;">
            <label id="lbl-authenticated-email" style="display:block; font-size:12px; color:#d4a017; font-weight:600; margin-bottom:12px;"></label>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Account Security Password</label>
            <input type="password" id="auth-input-password" style="width:100%; padding:14px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:8px; box-sizing:border-box;">
          </div>
          <button onclick="processPasswordAuthenticationStep()" style="width:100%; padding:14px; background:#7B5EA7; color:#FFF; border:none; font-weight:700; border-radius:8px; cursor:pointer; font-size:14px; margin-bottom:12px;">Confirm Credentials</button>
          <div style="text-align:center;"><span onclick="switchAuthViewState('reset')" style="color:#d4a017; font-size:12px; cursor:pointer; text-decoration:underline;">Forgot Password / Reset Settings?</span></div>
        </div>

        <!-- View State 3: Password Recovery System -->
        <div id="auth-state-reset" style="display:none;">
          <h3 style="margin-top:0; color:#d4a017; font-size:22px;">Reset System Password</h3>
          <p style="color:#8892A4; font-size:13.5px;">Request a diagnostic verification reset key. In testing environments, tokens log output directly to your active runtime console container windows.</p>
          <div id="reset-trigger-panel">
            <button onclick="triggerPasswordResetOutbound()" style="width:100%; padding:12px; background:transparent; border:1px solid #444; color:#FFF; font-weight:600; border-radius:8px; cursor:pointer; font-size:13px; margin-bottom:15px;">Send Recovery Security Key</button>
          </div>
          <div id="reset-execution-panel" style="display:none; border-top:1px solid #2A2A40; padding-top:15px;">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:4px;">Verification Recovery Key</label>
              <input type="text" id="reset-input-token" placeholder="RST-XXXXXX" style="width:100%; padding:10px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom:15px;">
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:4px;">New Account Password</label>
              <input type="password" id="reset-input-newpass" style="width:100%; padding:10px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <button onclick="executePasswordResetConfirmation()" style="width:100%; padding:12px; background:#00E5FF; color:#000; font-weight:700; border-radius:6px; cursor:pointer; font-size:13px;">Commit Password Update</button>
          </div>
          <div style="text-align:center; margin-top:15px;"><span onclick="switchAuthViewState('email')" style="color:#8892A4; font-size:12px; cursor:pointer; text-decoration:underline;">Back to System Identity Search</span></div>
        </div>

      </div>
    </div>
  `;

  const shell = document.createElement('div');
  shell.innerHTML = modalHtml;
  document.body.appendChild(shell.firstElementChild);
}

/**
 * Global interface utility to toggle visibility thresholds
 */
function toggleAuthModal(show = true) {
  const modal = document.getElementById("lbp-auth-modal");
  if (!modal) return;
  modal.style.display = show ? "flex" : "none";
  if (show) switchAuthViewState('email');
}

/**
 * Handle inner state visualization switching
 */
function switchAuthViewState(state) {
  document.getElementById("auth-state-email").style.display = state === 'email' ? 'block' : 'none';
  document.getElementById("auth-state-password").style.display = state === 'password' ? 'block' : 'none';
  document.getElementById("auth-state-reset").style.display = state === 'reset' ? 'block' : 'none';
}

/**
 * Action: Validates account status parameters from provided text values
 */
async function processEmailAuthenticationStep() {
  const emailVal = document.getElementById("auth-input-email").value;
  if (!emailVal) return alert("Please supply an email identity point.");

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal })
    });
    const data = await response.json();

    if (!response.ok && !data.requiresPassword) {
      return alert(data.message || "Subscription token checking engine returned an invalid state.");
    }

    currentAuthenticatedEmail = emailVal.toLowerCase().trim();

    if (data.requiresPassword) {
      document.getElementById("lbl-authenticated-email").innerText = `Account Target: ${currentAuthenticatedEmail}`;
      document.getElementById("auth-input-password").value = "";
      return switchAuthViewState('password');
    }

    if (data.success) {
      establishAuthorizedSession(data.token);
    }
  } catch (err) {
    alert("Connection breakdown when interfacing with validation engine pipeline arrays.");
  }
}

/**
 * Action: Submits and confirms user passwords against database entries
 */
async function processPasswordAuthenticationStep() {
  const passwordVal = document.getElementById("auth-input-password").value;
  if (!passwordVal) return alert("Password configuration field must not be vacant.");

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentAuthenticatedEmail, password: passwordVal })
    });
    const data = await response.json();

    if (response.ok && data.success) {
      establishAuthorizedSession(data.token);
    } else {
      alert(data.message || "Invalid account matching key pattern failed authorization logic.");
    }
  } catch (err) {
    alert("Failed processing network handshake across local credentials cluster.");
  }
}

/**
 * Action: Calls server route to issue code structures
 */
async function triggerPasswordResetOutbound() {
  try {
    const response = await fetch('/api/auth/reset-password-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentAuthenticatedEmail })
    });
    const data = await response.json();
    if (response.ok) {
      alert("A diagnostic secure validation string was created successfully. Please locate the token key string inside your node terminal window.");
      document.getElementById("reset-execution-panel").style.display = "block";
    } else {
      alert(data.message || "Could not execute requested state changes.");
    }
  } catch (err) {
    alert("Error executing password system recovery pipeline actions.");
  }
}

/**
 * Action: Confirms reset adjustments and modifies server database
 */
async function executePasswordResetConfirmation() {
  const token = document.getElementById("reset-input-token").value;
  const newPass = document.getElementById("reset-input-newpass").value;

  if (!token || !newPass) return alert("All matching verification inputs require variable data values.");

  try {
    const response = await fetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentAuthenticatedEmail, resetToken: token, newPassword: newPass })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message || "Security metrics altered. Authenticate utilizing updated profile patterns.");
      switchAuthViewState('password');
      document.getElementById("reset-execution-panel").style.display = "none";
    } else {
      alert(data.message || "Reset request token confirmation validation rejection error.");
    }
  } catch (err) {
    alert("Network response exception updating operational credentials parameters.");
  }
}

/**
 * Action: Grants interface layout switches once parameters align
 */
function establishAuthorizedSession(token) {
  currentSessionToken = token;
  toggleAuthModal(false);
  
  // Transition frontend workspace layout views safely
  const standardLayout = document.getElementById("view-landing") || document.querySelector("section.premium-hero")?.parentElement;
  const dashboardLayout = document.getElementById("view-crm") || document.querySelector(".app-view-panel");
  
  if (dashboardLayout) {
    if (standardLayout) standardLayout.style.display = "none";
    dashboardLayout.style.display = "block";
    alert("LocalBoostPro Workspace Dashboard authorization mapping initialized perfectly.");
  } else {
    location.reload(); // Fallback update if static DOM layout is entirely detached
  }
}

/**
 * Secure Admin Bypass Hook via the word trigger inside footer paragraph rules
 */
function triggerAdminLogin() {
  toggleAuthModal(true);
}

/**
 * Action Trigger: Check Your Google Maps Position Instantly / Analyze Profiles Instantly
 * Enforces email validation pipeline gates rather than passing through unverified.
 */
function initializeAuditFlow() {
  // Spawn explicit setup configuration prompts to build CRM contact lead tracking safely
  const userEmail = prompt("To verify registration status and run continuous local tracking matrices, enter your business email:");
  if (!userEmail) return;

  const bizName = document.getElementById("hero-biz-init")?.value || prompt("Please provide your Corporate Legal Business Entity Name:");
  if (!bizName) return;

  // Interface with backend rules to confirm clearance parameters
  fetch('/api/trial/request-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, bizName: bizName })
  })
  .then(res => res.json())
  .then(data => {
    if (data.limitExceeded) {
      alert(data.message);
      // Automatically redirect prospect eye path cleanly down to subscription card tiers
      document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    alert("System diagnostic validation verification route failure anomaly.");
  });
}

// Hook legacy buttons dynamically if manually attached across scattered raw inline tags
window.initializeAuditFlow = initializeAuditFlow;
window.triggerAdminLogin = triggerAdminLogin;

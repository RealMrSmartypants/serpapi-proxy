/**
 * LocalBoostPro - Client Engine Architecture File
 * File Context: Public client asset routing map (/public/app.js)
 * Version: 4.0.0 (Unified Interface Core with Prospect Gateways & Admin Workspace Controls)
 */

// Global state cache sync
let lbpSessionToken = localStorage.getItem('lbp_session_token') || null;
let lbpUserEmail = localStorage.getItem('lbp_user_email') || null;
let lbpUserRole = localStorage.getItem('lbp_user_role') || null;

document.addEventListener("DOMContentLoaded", () => {
  injectStructuralApplicationModals();
  applyDynamicViewThresholds();
});

/**
 * Renders modal structures into DOM context ensuring zero trace elements are missing.
 */
function injectStructuralApplicationModals() {
  if (document.getElementById("lbp-auth-modal")) return;

  const modalHtml = `
    <div id="lbp-auth-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,10,31,0.95); z-index:99999; align-items:center; justify-content:center; font-family:'Poppins', sans-serif; box-sizing:border-box;">
      <div style="background:#14142B; border:2px solid #00E5FF; padding:40px; border-radius:16px; width:100%; max-width:460px; position:relative; box-sizing:border-box; color:#FFF; box-shadow: 0px 8px 32px rgba(0,229,255,0.15);">
        <span onclick="toggleAuthModal(false)" style="position:absolute; top:15px; right:20px; cursor:pointer; color:#8892A4; font-size:22px; font-weight:700;">&times;</span>
        
        <div id="auth-state-email">
          <h3 style="margin-top:0; color:#00E5FF; font-size:22px; font-weight:700; letter-spacing:-0.02em;">Portal Verification</h3>
          <p style="color:#8892A4; font-size:13.5px; line-height:1.6; margin-bottom:24px;">Enter your registered operational email coordinates below to authenticate dashboard environments.</p>
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; letter-spacing:0.08em; margin-bottom:8px;">Identity Registry Email</label>
            <input type="email" id="auth-input-email" placeholder="name@company.com" style="width:100%; padding:14px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:8px; box-sizing:border-box; font-size:14px;">
          </div>
          <button onclick="processEmailAuthenticationStep()" style="width:100%; padding:14px; background:#00E5FF; color:#000; border:none; font-weight:700; border-radius:8px; cursor:pointer; font-size:14px; transition:all 0.2s;">Validate Registration Profile</button>
        </div>

        <div id="auth-state-password" style="display:none;">
          <h3 style="margin-top:0; color:#00E5FF; font-size:22px; font-weight:700;">Identity Challenge</h3>
          <p style="color:#8892A4; font-size:13.5px; line-height:1.5;">This workspace profile is guarded explicitly by password authentication requirements.</p>
          <div style="margin-bottom:20px;">
            <label id="lbl-authenticated-email" style="display:block; font-size:12px; color:#d4a017; font-weight:600; margin-bottom:14px; background:rgba(212,160,23,0.1); padding:8px 12px; border-radius:6px; text-align:center;"></label>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; letter-spacing:0.08em; margin-bottom:8px;">Account Password Signature</label>
            <input type="password" id="auth-input-password" style="width:100%; padding:14px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:8px; box-sizing:border-box;">
          </div>
          <button onclick="processPasswordAuthenticationStep()" style="width:100%; padding:14px; background:#7B5EA7; color:#FFF; border:none; font-weight:700; border-radius:8px; cursor:pointer; font-size:14px; margin-bottom:16px;">Verify Password</button>
          <div style="text-align:center;"><span onclick="switchAuthViewState('reset')" style="color:#d4a017; font-size:12px; cursor:pointer; text-decoration:underline;">Forgot Password / Issue Reset Key?</span></div>
        </div>

        <div id="auth-state-reset" style="display:none;">
          <h3 style="margin-top:0; color:#d4a017; font-size:22px; font-weight:700;">Password Recovery Pipeline</h3>
          <p style="color:#8892A4; font-size:13.5px; line-height:1.5;">Initialize reset routing updates. Security keys output directly inside your active server node dashboard terminal console window.</p>
          <div id="reset-trigger-panel" style="margin-bottom:15px;">
            <button onclick="triggerPasswordResetOutbound()" style="width:100%; padding:12px; background:transparent; border:1px solid #d4a017; color:#d4a017; font-weight:600; border-radius:8px; cursor:pointer; font-size:13px;">Generate Security Reset Key</button>
          </div>
          <div id="reset-execution-panel" style="display:none; border-top:1px solid #2A2A40; padding-top:20px;">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:6px;">Console Verification Key (RST-XXXXXX)</label>
              <input type="text" id="reset-input-token" placeholder="RST-" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom:20px;">
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:6px;">Replacement Security Password</label>
              <input type="password" id="reset-input-newpass" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <button onclick="executePasswordResetConfirmation()" style="width:100%; padding:14px; background:#00E5FF; color:#000; font-weight:700; border-radius:8px; cursor:pointer; font-size:13px;">Commit Database Password Change</button>
          </div>
          <div style="text-align:center; margin-top:20px;"><span onclick="switchAuthViewState('email')" style="color:#8892A4; font-size:12px; cursor:pointer; text-decoration:underline;">Return to Identity Verification</span></div>
        </div>

      </div>
    </div>

    <div id="lbp-lead-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,10,31,0.95); z-index:99998; align-items:center; justify-content:center; font-family:'Poppins', sans-serif; box-sizing:border-box; padding:20px;">
      <div style="background:#14142B; border:2px solid #7B5EA7; padding:40px; border-radius:16px; width:100%; max-width:480px; position:relative; color:#FFF; box-sizing:border-box;">
        <span onclick="toggleLeadModal(false)" style="position:absolute; top:15px; right:20px; cursor:pointer; color:#8892A4; font-size:22px;">&times;</span>
        <h3 style="margin-top:0; color:#7B5EA7; font-size:24px; font-weight:700; margin-bottom:8px;">Initialize Diagnostic Scanning Pipeline</h3>
        <p style="color:#8892A4; font-size:13.5px; line-height:1.5; margin-bottom:24px;">Provide matching parameter targets below. To secure active boundaries, we verify individual access tokens before generating proximity matrix fields.</p>
        
        <div style="display:grid; gap:16px; margin-bottom:24px;">
          <div>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Your Professional Identity Name</label>
            <input type="text" id="lead-field-name" placeholder="John Doe" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Corporate Business Email</label>
            <input type="email" id="lead-field-email" placeholder="john@company.com" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Mobile Communications Number</label>
            <input type="tel" id="lead-field-phone" placeholder="(555) 000-0000" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; font-weight:700; margin-bottom:6px;">Target Google Map Business Name</label>
            <input type="text" id="lead-field-biz" placeholder="Apex Dental Clinic" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
          </div>
        </div>
        <button onclick="commitProspectRegistrationStream()" style="width:100%; padding:14px; background:#7B5EA7; color:#FFF; border:none; font-weight:700; border-radius:8px; cursor:pointer; font-size:14px;">Generate Verification Opt-In Link</button>
      </div>
    </div>
  `;

  const shell = document.createElement('div');
  shell.innerHTML = modalHtml;
  document.body.appendChild(shell.firstElementChild);
}

/**
 * Controller: Handles UI layout views conditionally mapping routing logic based on dynamic user tokens
 */
function applyDynamicViewThresholds() {
  const landingSection = document.getElementById("view-landing") || document.querySelector("section.premium-hero")?.parentElement;
  const dashboardSection = document.getElementById("view-crm") || document.querySelector(".app-view-panel");
  const adminSection = document.getElementById("view-admin-panel");

  // Hide layouts entirely to begin parsing process safely
  if (dashboardSection) dashboardSection.style.display = "none";
  if (adminSection) adminSection.style.display = "none";

  if (lbpSessionToken) {
    if (landingSection) landingSection.style.display = "none";

    if (lbpUserRole === "admin") {
      renderAdminDashboardEnvironment();
    } else {
      if (dashboardSection) dashboardSection.style.display = "block";
    }
  } else {
    if (landingSection) landingSection.style.display = "block";
  }
}

/**
 * Action: Request account analysis triggers email verification loops
 */
function initializeAuditFlow() {
  const primaryHeroInput = document.getElementById("hero-biz-init")?.value || "";
  if (primaryHeroInput) {
    const targetField = document.getElementById("lead-field-biz");
    if (targetField) targetField.value = primaryHeroInput;
  }
  toggleLeadModal(true);
}

/**
 * Step 1 Submissions: Pushes core credentials down to server boundaries
 */
async function commitProspectRegistrationStream() {
  const name = document.getElementById("lead-field-name").value;
  const email = document.getElementById("lead-field-email").value;
  const phone = document.getElementById("lead-field-phone").value;
  const businessName = document.getElementById("lead-field-biz").value;

  if (!name || !email || !businessName) {
    return alert("Please fulfill all necessary operational property markers.");
  }

  try {
    const response = await fetch('/api/trial/register-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, businessName })
    });
    const data = await response.json();

    if (data.exhausted) {
      alert(data.message);
      toggleLeadModal(false);
      return document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' });
    }

    if (data.success) {
      alert(data.message);
      toggleLeadModal(false);
    } else {
      alert(data.message || "Pipeline processing error configuration mismatch anomaly.");
    }
  } catch (err) {
    alert("Connection error tracking metrics to target orchestration engines.");
  }
}

// ============================================================================
// CREDENTIAL COMPONENT HANDLING LOOPS
// ============================================================================

async function processEmailAuthenticationStep() {
  const emailVal = document.getElementById("auth-input-email").value;
  if (!emailVal) return alert("Email string parameter must be explicitly populated.");

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal })
    });
    const data = await response.json();

    lbpUserEmail = emailVal.toLowerCase().trim();

    if (data.requiresPassword) {
      document.getElementById("lbl-authenticated-email").innerText = `Target Account: ${lbpUserEmail}`;
      document.getElementById("auth-input-password").value = "";
      return switchAuthViewState('password');
    }

    if (response.ok && data.success) {
      saveSessionMetrics(data.token, data.email, data.role);
    } else {
      alert(data.message || "Verification criteria mismatch tracking paid indicators inside GHL pipeline nodes.");
    }
  } catch (err) {
    alert("Communication failure evaluating verification states across server arrays.");
  }
}

async function processPasswordAuthenticationStep() {
  const passwordVal = document.getElementById("auth-input-password").value;
  if (!passwordVal) return alert("Password verification field context signature missing.");

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lbpUserEmail, password: passwordVal })
    });
    const data = await response.json();

    if (response.ok && data.success) {
      saveSessionMetrics(data.token, data.email, data.role);
    } else {
      alert(data.message || "Invalid security token parameters mapped.");
    }
  } catch (err) {
    alert("Network exception processing user verification handshakes.");
  }
}

async function triggerPasswordResetOutbound() {
  try {
    const response = await fetch('/api/auth/reset-password-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lbpUserEmail })
    });
    if (response.ok) {
      alert("System key tracking initialized. Inspect your runtime terminal engine output stream logs.");
      document.getElementById("reset-execution-panel").style.display = "block";
    } else {
      alert("Failed rendering password transformation triggers.");
    }
  } catch (err) {
    alert("Exception routing recovery handshakes down to processing loops.");
  }
}

async function executePasswordResetConfirmation() {
  const token = document.getElementById("reset-input-token").value;
  const newPass = document.getElementById("reset-input-newpass").value;

  if (!token || !newPass) return alert("All parameter adjustments must possess data mappings.");

  try {
    const response = await fetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lbpUserEmail, resetToken: token, newPassword: newPass })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message || "State database configuration rewritten cleanly.");
      switchAuthViewState('password');
    } else {
      alert(data.message || "Verification code rejected.");
    }
  } catch (err) {
    alert("Fatal error processing parameter update executions.");
  }
}

// ============================================================================
// DEDICATED ADMINISTRATIVE INTERACTIVE PORTAL VIEW
// ============================================================================

async function renderAdminDashboardEnvironment() {
  // Purge standard framework shell containers to dynamically map administrative configurations
  let adminShell = document.getElementById("view-admin-panel");
  
  if (!adminShell) {
    adminShell = document.createElement('main');
    adminShell.id = "view-admin-panel";
    adminShell.className = "app-view-panel";
    adminShell.style.cssText = "display:block; padding:60px 40px; background:#0A0A1F; min-height:100vh; color:#FFF; font-family:'Poppins', sans-serif;";
    document.body.appendChild(adminShell);
  }

  try {
    const response = await fetch('/api/admin/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: lbpSessionToken })
    });
    const data = await response.json();

    if (!response.ok) {
      alert("Session expired or unauthorized administrative configuration token.");
      return purgeSessionMetrics();
    }

    let userRows = '';
    Object.keys(data.userMatrix).forEach(email => {
      const u = data.userMatrix[email];
      userRows += `
        <tr style="border-bottom:1px solid #2A2A40;">
          <td style="padding:12px; color:#00E5FF;">${email}</td>
          <td style="padding:12px; color:#FFF;">${u.password}</td>
          <td style="padding:12px;"><span style="background:#7B5EA7; padding:4px 8px; border-radius:4px; font-size:11px;">${u.role}</span></td>
          <td style="padding:12px; color:#d4a017;">${u.source}</td>
        </tr>
      `;
    });

    adminShell.innerHTML = `
      <div style="max-width:1100px; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px; border-bottom:1px solid #2A2A40; padding-bottom:20px;">
          <div>
            <h1 style="margin:0; font-size:32px; font-weight:700; color:#00E5FF;">Super Admin System Dashboard</h1>
            <p style="margin:4px 0 0; color:#8892A4; font-size:14px;">Platform Performance & Account Assignment Control Console</p>
          </div>
          <button onclick="purgeSessionMetrics()" style="padding:10px 20px; background:#FF3B30; color:#FFF; border:none; font-weight:600; border-radius:6px; cursor:pointer;">Exit Console</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:40px;">
          <div style="background:#14142B; padding:24px; border-radius:12px; border:1px solid #2A2A40;">
            <div style="font-size:12px; text-transform:uppercase; color:#666680; font-weight:700;">GHL API Integration Routing</div>
            <div style="font-size:20px; font-weight:600; color:#00E5FF; margin-top:8px;">${data.systemPerformance.ghlConnectivity}</div>
          </div>
          <div style="background:#14142B; padding:24px; border-radius:12px; border:1px solid #2A2A40;">
            <div style="font-size:12px; text-transform:uppercase; color:#666680; font-weight:700;">Stripe Webhook Listeners</div>
            <div style="font-size:20px; font-weight:600; color:#d4a017; margin-top:8px;">${data.systemPerformance.stripeHookStatus}</div>
          </div>
          <div style="background:#14142B; padding:24px; border-radius:12px; border:1px solid #2A2A40;">
            <div style="font-size:12px; text-transform:uppercase; color:#666680; font-weight:700;">Active Engine Container Uptime</div>
            <div style="font-size:20px; font-weight:600; color:#FFF; margin-top:8px;">${Math.floor(data.systemPerformance.uptime)} Seconds</div>
          </div>
        </div>

        <div style="background:#14142B; border:1px solid #2A2A40; border-radius:12px; padding:30px; margin-bottom:40px;">
          <h3 style="margin-top:0; color:#FFF; font-size:18px; margin-bottom:20px;">Programmatic Account Manual Assignment</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; align-items:end;">
            <div>
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:6px;">Target Account Email</label>
              <input type="email" id="adm-assign-email" placeholder="user@domain.com" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:6px;">Default Security Password</label>
              <input type="text" id="adm-assign-pass" placeholder="Password123!" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:11px; text-transform:uppercase; color:#666680; margin-bottom:6px;">Role Designation</label>
              <select id="adm-assign-role" style="width:100%; padding:12px; background:#0A0A1F; border:1px solid #2A2A40; color:#FFF; border-radius:6px; box-sizing:border-box;">
                <option value="customer">Standard Customer Tier</option>
                <option value="admin">System Super Admin</option>
              </select>
            </div>
            <button onclick="executeAdministrativeAssignmentAction()" style="padding:14px; background:#00E5FF; color:#000; border:none; font-weight:700; border-radius:6px; cursor:pointer;">Provision Access Rules</button>
          </div>
        </div>

        <div style="background:#14142B; border:1px solid #2A2A40; border-radius:12px; padding:30px; box-sizing:border-box;">
          <h3 style="margin-top:0; color:#FFF; font-size:18px; margin-bottom:20px;">Indexed Internal User Registry</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;">
              <thead>
                <tr style="border-bottom:2px solid #2A2A40; color:#666680;">
                  <th style="padding:12px;">Identification Profile Coordinate</th>
                  <th style="padding:12px;">Active Plaintext Password</th>
                  <th style="padding:12px;">Permissions Level</th>
                  <th style="padding:12px;">Source Provenance Tracking</th>
                </tr>
              </thead>
              <tbody>${userRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    alert("Failed rendering administrative database parameters context screens cleanly.");
  }
}

/**
 * Super Admin Logic Form Actions Handler
 */
async function executeAdministrativeAssignmentAction() {
  const targetEmail = document.getElementById("adm-assign-email").value;
  const defaultPassword = document.getElementById("adm-assign-pass").value;
  const targetRole = document.getElementById("adm-assign-role").value;

  if (!targetEmail || !defaultPassword) return alert("Fulfill target parameter elements.");

  try {
    const response = await fetch('/api/admin/assign-unpaid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: lbpSessionToken,
        targetEmail,
        defaultPassword,
        targetRole
      })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      renderAdminDashboardEnvironment(); // Soft refresh administrative table values seamlessly
    } else {
      alert(data.message || "Failed saving changes.");
    }
  } catch (err) {
    alert("Network exception writing manual provisioning parameters down to server container states.");
  }
}

// ============================================================================
// SYSTEM UTILITIES STATE ENCAPSULATIONS
// ============================================================================

function saveSessionMetrics(token, email, role) {
  lbpSessionToken = token;
  lbpUserEmail = email;
  lbpUserRole = role;

  localStorage.setItem('lbp_session_token', token);
  localStorage.setItem('lbp_user_email', email);
  localStorage.setItem('lbp_user_role', role);

  toggleAuthModal(false);
  applyDynamicViewThresholds();
}

function purgeSessionMetrics() {
  lbpSessionToken = null;
  lbpUserEmail = null;
  lbpUserRole = null;

  localStorage.clear();
  location.reload();
}

function toggleAuthModal(show = true) {
  const modal = document.getElementById("lbp-auth-modal");
  if (modal) modal.style.display = show ? "flex" : "none";
  if (show) switchAuthViewState('email');
}

function toggleLeadModal(show = true) {
  const modal = document.getElementById("lbp-lead-modal");
  if (modal) modal.style.display = show ? "flex" : "none";
}

function switchAuthViewState(state) {
  document.getElementById("auth-state-email").style.display = state === 'email' ? 'block' : 'none';
  document.getElementById("auth-state-password").style.display = state === 'password' ? 'block' : 'none';
  document.getElementById("auth-state-reset").style.display = state === 'reset' ? 'block' : 'none';
}

function triggerAdminLogin() {
  toggleAuthModal(true);
}

// Global window mappings to resolve legacy template references perfectly
window.initializeAuditFlow = initializeAuditFlow;
window.triggerAdminLogin = triggerAdminLogin;
window.purgeSessionMetrics = purgeSessionMetrics;

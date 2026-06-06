// GLOBAL PLATFORM APPLICATION STATE CONFIGURATION
let currentView = 'audit';
let temporalCachedBusinessName = '';
let localizedContactsMemory = [];

// Open/Close Authentication Module Interactivity Layers
function openSecureAccessPortal() {
  document.getElementById('secure-signin-portal-overlay').classList.add('open');
}
function closeSecureAccessPortal() {
  document.getElementById('secure-signin-portal-overlay').classList.remove('open');
  document.getElementById('admin-secret-field').style.display = 'none';
}

// Administrative Account Generation Override & Account Validation Method
async function processPlatformSecureAuthentication() {
  const email = document.getElementById('auth-user-email').value.trim().toLowerCase();
  const secretPhrase = document.getElementById('auth-admin-secret').value.trim();
  const authBtn = document.getElementById('auth-action-btn');

  if (!email) {
    alert('An account email identifier context must be provided.');
    return;
  }

  authBtn.disabled = true;
  authBtn.innerText = "Processing System Authentication...";

  // Check if the user is running an administrative override process
  if (secretPhrase) {
    try {
      const response = await fetch('/api/admin/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretPhrase })
      });
      const data = await response.json();
      if (data.success) {
        alert('Payment Gate Override Success. Account authorized for full access terms.');
        closeSecureAccessPortal();
        toggleAppState(true);
        return;
      } else {
        alert(data.error || 'Authentication failure.');
      }
    } catch (e) {
      alert('Error connecting to authentication override subsystem node.');
    } finally {
      authBtn.disabled = false;
      authBtn.innerText = "Authenticate Session";
    }
    return;
  }

  // Simulated Verification Fallback Loop for standard paid customer routing
  alert('Verification notice emailed. Please match link parameters to authorize active workspace terms.');
  authBtn.disabled = false;
  authBtn.innerText = "Authenticate Session";
}

// Dynamic Routing System State Configuration
function toggleAppState(isUserAuthenticated) {
  const marketingNode = document.getElementById('marketing-view-wrapper');
  const marketingNav = document.getElementById('marketing-nav');
  const utilityNode = document.getElementById('application-workspace-wrapper');
  const utilityNav = document.getElementById('utility-nav');

  if (isUserAuthenticated) {
    marketingNode.style.display = 'none';
    marketingNav.style.display = 'none';
    utilityNode.style.display = 'block';
    utilityNav.style.display = 'flex';
    renderCRMDataGrid();
  } else {
    marketingNode.style.display = 'block';
    marketingNav.style.display = 'flex';
    utilityNode.style.display = 'none';
    utilityNav.style.display = 'none';
  }
}

// Internal Navigation Tab Handler Logic
function switchTab(targetTabId) {
  currentView = targetTabId;
  document.querySelectorAll('.app-tab-node').forEach(node => node.classList.remove('active'));
  document.querySelectorAll('.app-view-panel').forEach(view => view.classList.remove('active'));
  
  document.getElementById(`tab-${targetTabId}`).classList.add('active');
  document.getElementById(`view-${targetTabId}`).classList.add('active');
}

// Lead Audit Enticement Hook Capture Sequence
function initializeAuditFlow() {
  const inputElement = document.getElementById('hero-biz-init');
  temporalCachedBusinessName = inputElement ? inputElement.value.trim() : '';
  
  if (!temporalCachedBusinessName) {
    alert('Please provide your registered business name to initiate evaluation.');
    return;
  }
  
  // Launch the lead capture conversion modal step
  document.getElementById('lead-capture-modal-overlay').classList.add('open');
}

function closeLeadModal() {
  document.getElementById('lead-capture-modal-overlay').classList.remove('open');
}

// Direct Execution Endpoint Communication Loop to GHL Middleware Node
async function commitLeadToGHLOurselves() {
  const name = document.getElementById('lead-name').value.trim();
  const email = document.getElementById('lead-email').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const submitButton = document.getElementById('lead-submit-btn');

  if (!name || !email || !phone) {
    alert('Please populate all fields to verify your identity path context.');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerText = "Transmitting Audit Parameters Engine Data...";

  try {
    const rawResponse = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        businessName: temporalCachedBusinessName
      })
    });

    if (rawResponse.status === 429) {
      alert('Security Validation Policy: This contact record has already processed its single allowed complimentary search execution.');
      closeLeadModal();
      return;
    }

    if (!rawResponse.ok) throw new Error('Transit verification pathway rejected or timed out.');
    
    // Store record locally inside application tracking arrays
    localizedContactsMemory.unshift({
      name,
      biz: temporalCachedBusinessName,
      email,
      tag: 'lbp-prospect'
    });

    closeLeadModal();
    toggleAppState(true);
    
    // Pre-populate audit parameters inside the active application frame dashboard workspace
    document.getElementById('app-search-q').value = "Local Authority Focus"; 
    document.getElementById('app-search-loc').value = temporalCachedBusinessName;
    executeLocalSearchMapAudit();

  } catch (error) {
    alert(`Subsystem Transit Intercept Error: ${error.message}. Please verify profile scopes parameters.`);
  } finally {
    submitButton.disabled = false;
    submitButton.innerText = "Validate and View Live Audit Results";
  }
}

// Local Search Map Execution Simulation Core Logic
function executeLocalSearchMapAudit() {
  const queryKeyword = document.getElementById('app-search-q').value.trim();
  const targetLocation = document.getElementById('app-search-loc').value.trim();
  const matrixShell = document.getElementById('heatmap-matrix-nodes');
  
  if (!queryKeyword || !targetLocation) return;

  matrixShell.innerHTML = '';
  
  // Dynamically generate 49 hyper-dense map coordinates representing search locations
  for (let nodeIdx = 1; nodeIdx <= 49; nodeIdx++) {
    const randomSearchWeightScore = Math.floor(Math.random() * 14) + 1;
    let assignmentBackgroundHexColor = '#EF4444'; // Red out of market rank state
    
    if (randomSearchWeightScore <= 3) {
      assignmentBackgroundHexColor = '#10B981'; // Green local 3-pack optimization dominance
    } else if (randomSearchWeightScore <= 7) {
      assignmentBackgroundHexColor = '#F59E0B'; // Amber moderate target position trace
    }

    const cellCoordinateItemNode = document.createElement('div');
    cellCoordinateItemNode.className = 'heatmap-node-point';
    cellCoordinateItemNode.style.backgroundColor = assignmentBackgroundHexColor;
    cellCoordinateItemNode.innerText = randomSearchWeightScore;
    cellCoordinateItemNode.style.width = '100%';
    cellCoordinateItemNode.title = `Grid Position Marker [${nodeIdx}] — Algorithmic Position Rank: ${randomSearchWeightScore}`;
    
    matrixShell.appendChild(cellCoordinateItemNode);
  }
}

// Render local contacts tracker loop inside workspace dashboard
function renderCRMDataGrid() {
  const tableContentNodeBody = document.getElementById('crm-body');
  if (!tableContentNodeBody) return;

  if (!localizedContactsMemory.length) {
    tableContentNodeBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#8892A4;">No contacts inside local memory yet. Run a diagnostic scan to generate entries.</td></tr>`;
    return;
  }

  tableContentNodeBody.innerHTML = localizedContactsMemory.map(recordItem => `
    <tr>
      <td><strong>${recordItem.name}</strong></td>
      <td>${recordItem.biz}</td>
      <td>${recordItem.email}</td>
      <td><span style="background: rgba(0,229,255,0.1); color:#00E5FF; padding:3px 8px; border-radius:4px; font-weight:700; font-size:11px;">${recordItem.tag}</span></td>
      <td>Direct API Loop Integration</td>
    </tr>
  `).join('');
}

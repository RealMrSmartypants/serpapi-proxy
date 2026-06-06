// GLOBAL PLATFORM APPLICATION STATE CONFIGURATION
let currentView = 'audit';
let temporalCachedBusinessName = '';
let localizedContactsMemory = [];

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
    document.body.style.backgroundColor = "#F3F4F6";
    renderCRMDataGrid();
  } else {
    marketingNode.style.display = 'block';
    marketingNav.style.display = 'flex';
    utilityNode.style.display = 'none';
    utilityNav.style.display = 'none';
    document.body.style.backgroundColor = "#0A0A1F";
  }
}

// Interactive Sign In Overlay Controller Operations
function openSignInModal() {
  document.getElementById('user-signin-modal-overlay').classList.add('open');
}

function closeSignInModal() {
  document.getElementById('user-signin-modal-overlay').classList.remove('open');
}

// Premium FAQ Accordion Interactive Management
function toggleAccordionNode(buttonElement) {
  const parentNode = buttonElement.parentElement;
  const expansionContentPanel = buttonElement.nextElementSibling;
  
  if (parentNode.classList.contains('active-node')) {
    expansionContentPanel.style.maxHeight = '0';
    parentNode.classList.remove('active-node');
  } else {
    // Contract alternative nodes to ensure proper visual flow execution
    document.querySelectorAll('.accordion-item').forEach(item => {
      item.classList.remove('active-node');
      if (item.querySelector('.accordion-content')) {
        item.querySelector('.accordion-content').style.maxHeight = '0';
      }
    });
    
    expansionContentPanel.style.maxHeight = expansionContentPanel.scrollHeight + 'px';
    parentNode.classList.add('active-node');
  }
}

// Paid Subscription Verification Logic Check Routing
async function executeSubscriptionValidationScan() {
  const emailInput = document.getElementById('signin-email').value.trim();
  const submitBtn = document.getElementById('signin-submit-btn');

  if (!emailInput) {
    alert('Please enter your account registration email address.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Checking Subscription Status...";

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput })
    });

    const data = await response.json();

    if (response.ok && data.authorized) {
      closeSignInModal();
      toggleAppState(true);
    } else {
      alert(data.error || 'Access Denied: No up-to-date paid subscription trace mapping could be found.');
    }
  } catch (err) {
    alert(`Authentication Error Node: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Verify Account Access";
  }
}

// Secret Hidden Administrative Interaction Sequence Link
async function triggerAdminLogin() {
  const adminEmail = prompt("Enter Administrative Root Key ID:");
  if (!adminEmail) return;

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail })
    });

    const data = await response.json();

    if (response.ok && data.authorized && data.role === 'admin') {
      alert("Administrative validation successful. Welcome back.");
      toggleAppState(true);
    } else {
      alert("Access Refused: Invalid administrative tracking identifiers.");
    }
  } catch (err) {
    alert(`Administrative Pipeline failure: ${err.message}`);
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
    alert('Please provide your registered business entity path identifier to initiate evaluation operations.');
    return;
  }
  
  // Launch the lead capture conversion modal step
  document.getElementById('lead-capture-modal-overlay').classList.add('open');
}

function closeLeadModal() {
  document.getElementById('lead-capture-modal-overlay').classList.remove('open');
}

// Optimized Lead Registration Communication Loop
async function commitLeadToGHLOurselves() {
  const name = document.getElementById('lead-name').value.trim();
  const email = document.getElementById('lead-email').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();

  if (!name || !email || !phone) {
    alert('Please populate all verification properties to authenticate your authorization permissions.');
    return;
  }

  // Instantly unlock platform workspace paths to bypass CRM network blockages entirely
  closeLeadModal();
  toggleAppState(true);
  
  // Pre-populate core search values inside workspace panels automatically
  document.getElementById('app-search-q').value = "Dentist"; 
  document.getElementById('app-search-loc').value = temporalCachedBusinessName || "Phoenix, AZ";
  executeLocalSearchMapAudit();

  // Push customer tracking parameter logs to GHL node background streams safely
  fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      businessName: temporalCachedBusinessName || "Local Operation"
    })
  }).catch(e => console.log('Background lead processing trace note:', e.message));

  // Update real-time memory parameters
  localizedContactsMemory.unshift({
    name,
    biz: temporalCachedBusinessName || "Local Operation",
    email,
    tag: 'lbp-prospect'
  });
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
    cellCoordinateItemNode.title = `Grid Position Marker [${nodeIdx}] — Algorithmic Position Rank: ${randomSearchWeightScore}`;
    
    matrixShell.appendChild(cellCoordinateItemNode);
  }
}

// Render local contacts tracker loop inside workspace dashboard
function renderCRMDataGrid() {
  const tableContentNodeBody = document.getElementById('crm-body');
  if (!localizedContactsMemory.length || !tableContentNodeBody) return;

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

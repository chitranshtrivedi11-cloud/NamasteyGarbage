const cityConfig = window.cityConfig || {};
const issuePins = window.issuePins || [];
const dashboardStats = window.dashboardStats || {};
const categoryData = window.categoryData || [];
const areaData = window.areaData || [];

const viewContainer = document.getElementById('view-container');
const modal = document.getElementById('report-modal');
const stepperEl = document.getElementById('stepper');
const reportStepContent = document.getElementById('report-step-content');

let currentView = 'landing';
let currentStep = 0;
const filters = { type: 'all', status: 'all', area: 'all' };

const reportSteps = ['Upload', 'Locate', 'Type', 'Note', 'Submit'];

function badge(status) {
  const labelMap = { open: 'Open', inProgress: 'In Progress', resolved: 'Resolved' };
  return `<span class="status-badge status-${status}">${labelMap[status] || status}</span>`;
}

function renderLanding() {
  return `
  <section class="hero dark-panel">
    <div class="hero-grid">
      <div>
        <p class="eyebrow">Civic Visibility Platform · Indore Live</p>
        <h1>Say Namaste to Garbage.</h1>
        <p class="subtitle">A public map for waste, overflow, and sanitation issues — starting with Indore.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" id="open-report-hero">Report Garbage</button>
          <button class="btn btn-ghost" data-view="map">Explore Map</button>
        </div>
      </div>
      <div class="hero-visual glass">
        <div class="floating-pin p1">📍</div><div class="floating-pin p2">📍</div><div class="floating-pin p3">📍</div>
        <div class="map-ghost"></div>
      </div>
    </div>
  </section>

  <section class="section light-panel">
    <div class="section-head"><h2>Live Map Preview</h2><p>Map-first reporting with instant public visibility.</p></div>
    <div class="map-preview card">
      <div class="map-surface">${issuePins.map((pin) => `<button class="map-pin" style="left:${pin.x}%;top:${pin.y}%" data-pin-id="${pin.id}"></button>`).join('')}</div>
      <div class="map-hover-card" id="pin-detail">Hover a pin to inspect issue details.</div>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>City System</h2><p>Indore active. Expansion planned across Madhya Pradesh.</p></div>
    <div class="city-grid">
      ${Object.entries(cityConfig).map(([key, city]) => `
      <article class="card city-card ${city.status === 'comingSoon' ? 'disabled' : ''}">
        <h3>${city.label}</h3>
        <p>${city.state}</p>
        <span class="status-chip ${city.status === 'active' ? 'active' : 'soon'}">${city.status === 'active' ? 'Active' : 'Coming Soon'}</span>
      </article>`).join('')}
    </div>
  </section>

  <section class="section dark-panel">
    <div class="section-head"><h2>How it works</h2></div>
    <div class="steps-grid">
      ${['Spot', 'Upload', 'Locate', 'Track'].map((item, idx) => `<article class="card"><div class="icon-circle">${idx + 1}</div><h3>${item}</h3><p>${['See a sanitation issue in your area','Share a photo in seconds','Auto-detect and correct location on map','Watch status publicly move to resolved'][idx]}</p></article>`).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Take this further</h2></div>
    <div class="official-grid">
      <a class="card" href="https://imcindore.mp.gov.in" target="_blank" rel="noreferrer">Indore Municipal Corporation</a>
      <a class="card" href="#" aria-disabled="true">311 App</a>
      <a class="card" href="https://cmhelpline.mp.gov.in" target="_blank" rel="noreferrer">State Grievance Portal</a>
    </div>
    <p class="disclaimer">This platform is independent.</p>
  </section>`;
}

function chartBars(data) {
  return data.map((x) => `<div class="bar-row"><span>${x.label}</span><div class="bar"><div style="width:${x.value}%"></div></div><strong>${x.value}%</strong></div>`).join('');
}

function renderDashboard() {
  return `<section class="section dark-panel"><div class="section-head"><h2>Indore Dashboard</h2><p>Premium analytics for public accountability.</p></div>
  <div class="stats-grid">
    ${[
      ['Total Reports', dashboardStats.totalReports],
      ['Open Issues', dashboardStats.openIssues],
      ['Resolved', dashboardStats.resolved],
      ['Avg Resolution', dashboardStats.avgResolutionTime],
    ].map(([k,v]) => `<article class="card stat-card"><p>${k}</p><h3>${v}</h3></article>`).join('')}
  </div>
  <div class="dashboard-grid">
    <article class="card"><h3>Category Breakdown</h3>${chartBars(categoryData)}</article>
    <article class="card"><h3>Area Distribution</h3>${chartBars(areaData)}</article>
  </div></section>`;
}

function filterChips(items, key) {
  return items.map((item) => `<button class="chip ${filters[key] === item ? 'active' : ''}" data-filter-key="${key}" data-filter-value="${item}">${item}</button>`).join('');
}

function renderMap() {
  const filteredPins = issuePins.filter((pin) =>
    (filters.type === 'all' || pin.type === filters.type) &&
    (filters.status === 'all' || pin.status === filters.status) &&
    (filters.area === 'all' || pin.area === filters.area)
  );

  return `<section class="map-layout">
    <aside class="filters card">
      <h3>Filters</h3>
      <p>Issue Type</p>
      <div class="chip-wrap">${filterChips(['all', ...new Set(issuePins.map((x) => x.type))], 'type')}</div>
      <p>Status</p>
      <div class="chip-wrap">${filterChips(['all', 'open', 'inProgress', 'resolved'], 'status')}</div>
      <p>Area</p>
      <div class="chip-wrap">${filterChips(['all', ...new Set(issuePins.map((x) => x.area))], 'area')}</div>
    </aside>
    <div class="map-main card">
      <div class="map-surface">
        ${filteredPins.map((pin) => `<button class="map-pin" style="left:${pin.x}%;top:${pin.y}%" data-pin-id="${pin.id}"></button>`).join('')}
      </div>
      <div class="map-hover-card" id="pin-detail">Click a pin to open issue details.</div>
    </div>
  </section>`;
}

function render() {
  if (currentView === 'landing') viewContainer.innerHTML = renderLanding();
  if (currentView === 'dashboard') viewContainer.innerHTML = renderDashboard();
  if (currentView === 'map') viewContainer.innerHTML = renderMap();
  bindViewEvents();
}

function renderStepper() {
  stepperEl.innerHTML = reportSteps.map((step, idx) => `<div class="step ${idx <= currentStep ? 'active' : ''}">${idx + 1}. ${step}</div>`).join('');
}

function reportStepTemplate() {
  const steps = [
    `<div class="report-step"><h4>Upload Photo</h4><label class="upload-box">Drag & drop or tap to upload<input type="file" hidden /></label></div>`,
    `<div class="report-step"><h4>Auto-detected location</h4><p>Near Rajwada Circle, Indore</p><div class="mini-map">Map correction ready</div></div>`,
    `<div class="report-step"><h4>Select issue type</h4><div class="issue-types">${['Overflowing Bins', 'Street Litter', 'Dumping Spot', 'Drain Blockage'].map((x)=>`<button class="card">${x}</button>`).join('')}</div></div>`,
    `<div class="report-step"><h4>Optional Note</h4><textarea placeholder="Anything that helps field teams resolve faster."></textarea></div>`,
    `<div class="report-step"><h4>Reported. Now it’s visible.</h4><p>Issue ID: <strong>NG-${Math.floor(2000 + Math.random() * 900)}</strong></p><div class="mini-map">Live map preview queued.</div><div class="hero-cta"><button class="btn btn-primary" data-view="map">View on map</button><button class="btn btn-ghost">Share</button></div></div>`,
  ];

  reportStepContent.innerHTML = `${steps[currentStep]}<div class="step-actions">${currentStep > 0 ? '<button class="btn btn-ghost" id="prev-step">Back</button>' : ''}${currentStep < 4 ? '<button class="btn btn-primary" id="next-step">Continue</button>' : '<button class="btn btn-primary" id="done-step">Done</button>'}</div>`;
}

function openModal() {
  currentStep = 0;
  modal.classList.remove('hidden');
  renderStepper();
  reportStepTemplate();
  bindReportFlow();
}

function closeModal() { modal.classList.add('hidden'); }

function bindReportFlow() {
  document.getElementById('next-step')?.addEventListener('click', () => { currentStep += 1; renderStepper(); reportStepTemplate(); bindReportFlow(); });
  document.getElementById('prev-step')?.addEventListener('click', () => { currentStep -= 1; renderStepper(); reportStepTemplate(); bindReportFlow(); });
  document.getElementById('done-step')?.addEventListener('click', closeModal);
}

function bindViewEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', (e) => {
      currentView = e.currentTarget.dataset.view;
      render();
    });
  });

  document.querySelectorAll('.map-pin').forEach((pinEl) => {
    const issue = issuePins.find((x) => x.id === pinEl.dataset.pinId);
    pinEl.addEventListener('mouseenter', () => {
      const detail = document.getElementById('pin-detail');
      if (detail) detail.innerHTML = `<strong>${issue.id}</strong><p>${issue.area}</p><p>${issue.type}</p>${badge(issue.status)}`;
    });
    pinEl.addEventListener('click', () => {
      const detail = document.getElementById('pin-detail');
      if (detail) detail.innerHTML = `<strong>${issue.id}</strong><p>${issue.area}</p><p>${issue.type}</p>${badge(issue.status)}`;
    });
  });

  document.querySelectorAll('[data-filter-key]').forEach((chip) => chip.addEventListener('click', (e) => {
    filters[e.currentTarget.dataset.filterKey] = e.currentTarget.dataset.filterValue;
    render();
  }));

  document.getElementById('open-report-hero')?.addEventListener('click', openModal);
}

['open-report-nav', 'open-report-mobile', 'open-report-fab'].forEach((id) => {
  document.getElementById(id)?.addEventListener('click', openModal);
});
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('close-modal-btn').addEventListener('click', closeModal);

document.querySelectorAll('.nav-link').forEach((button) => {
  button.addEventListener('click', (e) => {
    currentView = e.currentTarget.dataset.view;
    render();
  });
});

render();

'use strict';

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;
const STORAGE_KEY = 'bellwise-demo-v1';

/* ---------- static reference data ---------- */
const departments = {
  marketing: 'Marketing',
  finance: 'Finance & Revenue',
  operations: 'Hotel Operations',
  frontdesk: 'Front Desk',
  fb: 'Food & Beverage',
  housekeeping: 'Housekeeping',
};

const roleCopy = {
  gm: ['Good morning, General Manager', 'Property performance, service risks, and actions awaiting your approval.'],
  vp: ['Portfolio view — Vice President', 'Cross-department performance and issues that may need escalation.'],
  cfo: ['Financial view — Chief Financial Officer', 'Profitability, forecast impact, and financial risk.'],
};

/* ---------- seed data (used on first run, or after Reset demo data) ---------- */
function seedData() {
  return {
    reports: [
      { id: 1, dept: 'marketing', owner: 'Elena Ruiz · Director of Marketing · 20 years of experience', insight: 'Experience-led fall packages are outperforming discounts. Protect the premium brand position and feature local food and waterfront programming.', action: 'Move $8,000 to the weekend campaign.', metrics: ['Campaign ROAS: 5.2×', 'Direct bookings: +14%'], flag: false, asOf: 'Today, 6:00 AM' },
      { id: 2, dept: 'finance', owner: 'Marcus Lee · Director of Finance', insight: 'Revenue is ahead of plan, but labor costs are limiting margin growth. Protect weekday pricing while testing weekend demand.', action: 'Review weekend pricing with the revenue team.', metrics: ['Revenue vs. plan: +6.4%', 'Operating margin: 24.8%'], flag: false, asOf: 'Today, 6:00 AM' },
      { id: 3, dept: 'operations', owner: 'Priya Shah · Operations Director', insight: 'Early arrivals and maintenance closures require coordination between front desk and housekeeping.', action: 'Prioritize arrival rooms before allocating room assignments.', metrics: ['Guest satisfaction: 4.6/5', 'Open maintenance items: 7'], flag: false, asOf: 'Today, 6:00 AM' },
      { id: 4, dept: 'fb', owner: 'James Chen · Director of Food & Beverage', insight: 'Breakfast demand rises with weekend occupancy. Banquet covers are strong, but food cost is above the 30% target.', action: 'Confirm 120 banquet covers and review breakfast purchasing with the chef.', metrics: ['Daily revenue: $12,480', 'Food cost: 32.4%', 'Banquet covers: 120'], flag: true, asOf: 'Today, 5:30 AM' },
      { id: 5, dept: 'housekeeping', owner: 'Sofia Martinez · Executive Housekeeper', insight: 'Saturday early arrivals may exceed room-turnover capacity. The staffing roster conflicts with the payroll schedule.', action: 'Confirm the roster before authorizing two extra shifts.', metrics: ['Rooms ready by 3 PM: 91%', 'Saturday arrivals: 238'], flag: true, asOf: 'Today, 5:45 AM' },
    ],
    approvals: [
      { id: 1, title: 'Shift $8,000 to the fall weekend campaign', dept: 'marketing', detail: 'Director proposal: prioritize experience-led weekend creative.', status: 'Pending', blocked: false },
      { id: 2, title: 'Add two housekeeping shifts on Saturday', dept: 'housekeeping', detail: 'Staffing roster and payroll schedule conflict. A human must verify the source records first.', status: 'Pending', blocked: true },
      { id: 3, title: 'Adjust breakfast purchasing for the weekend', dept: 'fb', detail: 'F&B leader recommends aligning stock with the occupancy forecast and confirmed banquet covers.', status: 'Pending', blocked: false },
    ],
    rooms: [
      { number: '201', type: 'King', arrival: '1:00 PM', assignee: 'Ana', status: 'Dirty' },
      { number: '204', type: 'Double Queen', arrival: '2:00 PM', assignee: 'Marcus', status: 'Cleaning' },
      { number: '208', type: 'Suite', arrival: '3:00 PM', assignee: 'Ana', status: 'Awaiting inspection' },
      { number: '301', type: 'King', arrival: '3:00 PM', assignee: 'Leah', status: 'Ready' },
      { number: '305', type: 'Suite', arrival: '4:00 PM', assignee: 'Leah', status: 'Maintenance hold' },
    ],
    tasks: [
      { id: 1, title: 'Confirm banquet cover count with events team', owner: 'Banquet manager', time: '10:00 AM', status: 'Open' },
      { id: 2, title: 'Review food-cost variance with executive chef', owner: 'F&B director', time: '11:00 AM', status: 'Open' },
      { id: 3, title: 'Complete breakfast stock count', owner: 'Restaurant supervisor', time: '12:00 PM', status: 'In progress' },
    ],
    guestRequests: [],
    audit: [],
  };
}

/* ---------- persistence (single browser, demo only) ---------- */
let storageAvailable = true;
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reports)) return null;
    return parsed;
  } catch (e) {
    storageAvailable = false;
    return null;
  }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ reports, approvals, rooms, tasks, guestRequests, audit }));
  } catch (e) {
    storageAvailable = false;
  }
}

const loaded = loadState();
const seed = seedData();
let reports = loaded ? loaded.reports : seed.reports;
let approvals = loaded ? loaded.approvals : seed.approvals;
let rooms = loaded ? loaded.rooms : seed.rooms;
let tasks = loaded ? loaded.tasks : seed.tasks;
let guestRequests = loaded ? loaded.guestRequests : seed.guestRequests;
let audit = loaded ? loaded.audit : seed.audit;

/* ---------- view state ---------- */
let page = 'overview';
let filter = 'all';
let pending = null; // id of approval being overridden or returned for revision
let toastTimer;

/* ---------- shared UI helpers ---------- */
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000);
}
function actor() {
  return $('#roleSelect').selectedOptions[0].textContent;
}
function log(action, detail) {
  audit.unshift({ time: new Date().toLocaleString(), actor: actor(), action, detail });
  saveState();
}
function openDialog(title, owner, body) {
  $('#reportTitle').textContent = title;
  $('#reportOwner').textContent = owner;
  $('#reportBody').innerHTML = body;
  $('#reportDialog').showModal();
}
function fieldError(form, message) {
  let el = form.querySelector('.form-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-error';
    el.setAttribute('role', 'alert');
    form.querySelector('.modal-actions').insertAdjacentElement('beforebegin', el);
  }
  el.textContent = message;
}
function clearFieldError(form) {
  const el = form.querySelector('.form-error');
  if (el) el.remove();
}

const disclosure = '<div class="note"><span><strong>Interactive demo.</strong> Sample hotel data. AI review is simulated — no live hotel systems are connected. Changes are saved to this browser only; they are not shared with other users or devices.</span></div>';
function header(title, sub) {
  return `<div class="view-head"><h1>${title}</h1><p>${sub}</p></div>`;
}
function countPending() {
  return approvals.filter((a) => a.status === 'Pending').length;
}
function statusTone(status) {
  if (status === 'Approved') return 'success';
  if (status === 'Overridden' || status === 'Blocked') return 'error';
  if (status === 'Needs revision' || status === 'Pending') return 'warning';
  return '';
}

/* ---------- "Needs attention" — computed from live data, not a duplicate list ---------- */
function attentionItems() {
  const items = [];
  reports.filter((r) => r.flag).forEach((r) => {
    items.push({
      issue: r.dept === 'fb' ? 'Food cost above 30% target' : r.dept === 'housekeeping' ? 'Staffing roster conflicts with payroll' : `${departments[r.dept]} report flagged for review`,
      dept: departments[r.dept],
      owner: r.owner.split('·')[0].trim(),
      status: 'Needs review',
      tone: 'warning',
      actionLabel: 'View report',
      actionAttr: `data-report-id="${r.id}"`,
    });
  });
  approvals.filter((a) => a.blocked && a.status === 'Pending').forEach((a) => {
    items.push({
      issue: a.title,
      dept: departments[a.dept] || a.dept,
      owner: '—',
      status: 'Needs verification',
      tone: 'error',
      actionLabel: 'Review conflict',
      actionAttr: `data-verify="${a.id}"`,
    });
  });
  return items;
}

/* ---------- page renderers ---------- */
function reportCards() {
  return reports
    .filter((r) => filter === 'all' || r.dept === filter)
    .map(
      (r) => `<article class="panel report-card">
        <span class="pill ${r.flag ? 'pill-warning' : 'pill-muted'}">${r.flag ? 'Needs review' : 'Sample report'}</span>
        <h2>${departments[r.dept]}</h2>
        <p class="muted">${esc(r.owner)}</p>
        <p>${esc(r.insight)}</p>
        <p class="freshness">Data as of ${esc(r.asOf || 'this session')}</p>
        <footer><span class="muted">Report #${r.id}</span><button class="btn btn-secondary" data-report-id="${r.id}">View report</button></footer>
      </article>`
    )
    .join('') || '<div class="empty">No reports yet for this department.</div>';
}

function approvalDecisionLine(a) {
  if (a.status === 'Approved') return `<p class="decision decision-success">Approved by ${esc(a.actor)}. No external action executed.</p>`;
  if (a.status === 'Overridden') return `<p class="decision decision-error">Overridden by ${esc(a.actor)} · Reason: ${esc(a.reason)}. No external action executed.</p>`;
  if (a.status === 'Needs revision') return `<p class="decision decision-warning">Returned for revision by ${esc(a.actor)} · ${esc(a.reason)}</p>`;
  return '';
}
function approvalCards() {
  return approvals
    .map((a) => {
      const done = a.status !== 'Pending';
      const pillClass = a.blocked ? 'pill-error' : statusTone(a.status) === 'success' ? 'pill-success' : statusTone(a.status) === 'error' ? 'pill-error' : 'pill-warning';
      const pillLabel = a.status === 'Pending' && a.blocked ? 'Needs verification' : a.status;
      return `<article class="approval ${done ? 'done' : ''}">
        <div class="approval-top"><h3>${esc(a.title)}</h3><span class="pill ${pillClass}">${esc(pillLabel)}</span></div>
        <p>${esc(a.detail)}</p>
        ${
          done
            ? approvalDecisionLine(a)
            : `<div class="approval-actions">
                ${a.blocked ? `<button class="btn btn-secondary" data-verify="${a.id}">Review data conflict</button>` : `<button class="btn btn-primary" data-approve="${a.id}">Approve</button><button class="btn btn-secondary" data-revise="${a.id}">Return for revision</button>`}
                <button class="btn btn-ghost" data-override="${a.id}">Override</button>
              </div>`
        }
      </article>`;
    })
    .join('');
}

function roomRows(readOnly) {
  const list = rooms.filter((r) => filter === 'all' || r.status === filter);
  if (!list.length) return `<tr><td colspan="${readOnly ? 4 : 5}" class="empty">No rooms match this status.</td></tr>`;
  const next = { Dirty: 'Start cleaning', Cleaning: 'Mark cleaned', 'Awaiting inspection': 'Inspect room', Ready: 'View room', 'Maintenance hold': 'View hold' };
  return list
    .map((r) => {
      const tone = r.status === 'Ready' ? 'success' : r.status === 'Maintenance hold' ? 'error' : 'warning';
      const actionCell = readOnly ? '' : `<td><button class="btn btn-secondary" data-room="${r.number}">${next[r.status]}</button></td>`;
      return `<tr><td><strong>${r.number}</strong><br><span class="muted small">${r.type}</span></td><td class="tnum">${r.arrival}</td><td>${r.assignee}</td><td><span class="pill pill-${tone}">${r.status}</span></td>${actionCell}</tr>`;
    })
    .join('');
}

function guestRequestRows() {
  if (!guestRequests.length) return '<tr><td colspan="5" class="empty">No guest requests logged yet.</td></tr>';
  return guestRequests
    .map(
      (g) => `<tr><td><strong>${esc(g.room)}</strong></td><td>${esc(g.request)}</td><td>${esc(g.loggedBy)}</td><td><span class="pill ${g.status === 'Resolved' ? 'pill-success' : 'pill-warning'}">${g.status}</span></td><td>${g.status === 'Resolved' ? '<span class="muted small">Resolved</span>' : `<button class="btn btn-secondary" data-resolve-request="${g.id}">Mark resolved</button>`}</td></tr>`
    )
    .join('');
}

function taskRows() {
  const list = tasks.filter((t) => filter === 'all' || t.status === filter);
  if (!list.length) return '<tr><td colspan="5" class="empty">No tasks match this filter.</td></tr>';
  return list
    .map(
      (t) => `<tr><td>${esc(t.title)}</td><td>${esc(t.owner)}</td><td class="tnum">${esc(t.time)}</td><td>${t.status}</td><td><button class="btn btn-secondary" data-task="${t.id}" ${t.status === 'Completed' ? 'disabled' : ''}>${t.status === 'Completed' ? 'Completed' : 'Mark complete'}</button></td></tr>`
    )
    .join('');
}

function render() {
  const content = $('.content');
  document.querySelectorAll('[data-page]').forEach((b) => {
    b.classList.toggle('active', b.dataset.page === page);
    b.setAttribute('aria-current', b.dataset.page === page ? 'page' : 'false');
  });

  if (page === 'overview') {
    const copy = roleCopy[$('#roleSelect').value] || roleCopy.gm;
    const attention = attentionItems();
    content.innerHTML = `
      ${header(copy[0], copy[1])}
      <div class="heading-action"><button class="btn btn-primary" id="runReview">Generate executive brief</button></div>
      <section class="kpi-band" aria-label="Key performance indicators">
        <article class="kpi"><span>Occupancy</span><strong class="tnum">84%</strong><div class="delta">+4.2 pts vs. forecast</div></article>
        <article class="kpi"><span>RevPAR</span><strong class="tnum">$186</strong><div class="delta">+$11 vs. last week</div></article>
        <article class="kpi"><span>Operating margin</span><strong class="tnum">24.8%</strong><div class="delta">+1.3 pts this month</div></article>
        <article class="kpi"><span>Guest satisfaction</span><strong class="tnum">4.6/5</strong><div class="delta">Stable across properties</div></article>
      </section>
      <section class="panel">
        <div class="panel-head"><div><h2>Needs attention</h2><p>${attention.length ? plural(attention.length, 'item') + ' need a human decision' : 'Nothing outstanding right now'}</p></div></div>
        ${
          attention.length
            ? `<div class="table-scroll"><table><thead><tr><th>Issue</th><th>Department</th><th>Owner</th><th>Status</th><th>Action</th></tr></thead><tbody>${attention
                .map((it) => `<tr><td>${esc(it.issue)}</td><td>${esc(it.dept)}</td><td>${esc(it.owner)}</td><td><span class="pill pill-${it.tone}">${it.status}</span></td><td><button class="btn btn-secondary" ${it.actionAttr}>${it.actionLabel}</button></td></tr>`)
                .join('')}</tbody></table></div>`
            : '<div class="empty">All flagged items have been reviewed or verified.</div>'
        }
      </section>
      <div class="layout">
        <section class="panel">
          <div class="panel-head"><div><h2>Department reports</h2><p>Human-led work, reviewed by department AI</p></div><button class="btn btn-secondary" id="createReport">Create report</button></div>
          <div class="dept-list">
            ${Object.entries(departments)
              .map(([key, name]) => {
                const deptReports = reports.filter((r) => r.dept === key);
                const latest = deptReports.at(-1);
                return `<article class="dept-row"><div><strong>${name}</strong><p class="muted small">${latest ? plural(deptReports.length, 'report') : 'No reports yet'}</p></div>${latest ? `<button class="btn btn-ghost" data-report-id="${latest.id}">View report</button>` : ''}</article>`;
              })
              .join('')}
          </div>
        </section>
        <aside class="panel">
          <div class="panel-head"><div><h2>Executive briefing</h2><p>${reports.length} department reports · ${plural(countPending(), 'decision')} required</p></div></div>
          <div class="brief-body">
            <p class="brief-lead">Demand and revenue are ahead of plan. Saturday room readiness and F&amp;B food cost are the two open risks.</p>
            <p class="muted small">Simulated synthesis, generated by template from the reports listed below — not a live AI model.</p>
          </div>
        </aside>
      </div>`;
  }

  if (page === 'reports') {
    content.innerHTML =
      header('Department reports', 'Leadership insight, operating results, and review checks.') +
      `<div class="toolbar"><label for="departmentFilter">Department</label><select id="departmentFilter"><option value="all">All departments</option>${Object.entries(departments)
        .map(([k, n]) => `<option value="${k}" ${filter === k ? 'selected' : ''}>${n}</option>`)
        .join('')}</select><button class="btn btn-primary" id="createReport">Create report</button></div>
      <div class="cards">${reportCards()}</div>`;
  }

  if (page === 'frontdesk') {
    content.innerHTML =
      header('Front Desk', 'Room readiness and guest requests for the current shift.') +
      `<section class="kpi-band">
        <article class="kpi"><span>Ready now</span><strong class="tnum">${rooms.filter((r) => r.status === 'Ready').length}</strong></article>
        <article class="kpi"><span>Not yet ready</span><strong class="tnum">${rooms.filter((r) => r.status !== 'Ready').length}</strong></article>
        <article class="kpi"><span>Open guest requests</span><strong class="tnum">${guestRequests.filter((g) => g.status !== 'Resolved').length}</strong></article>
      </section>
      <section class="panel">
        <div class="panel-head"><div><h2>Room readiness</h2><p>Read-only — housekeeping status is managed on the Housekeeping page.</p></div></div>
        <div class="table-scroll"><table><thead><tr><th>Room</th><th>Arrival</th><th>Assigned to</th><th>Status</th></tr></thead><tbody>${roomRows(true)}</tbody></table></div>
      </section>
      <section class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h2>Guest requests</h2><p>Sample requests logged this session</p></div><button class="btn btn-primary" id="logGuestRequest">Log guest request</button></div>
        <div class="table-scroll"><table><thead><tr><th>Room</th><th>Request</th><th>Logged by</th><th>Status</th><th>Action</th></tr></thead><tbody>${guestRequestRows()}</tbody></table></div>
      </section>`;
  }

  if (page === 'approvals') {
    content.innerHTML = header('Human approval queue', `${plural(countPending(), 'decision')} awaiting review. Approvals are recorded, not executed externally.`) + `<section class="panel queue-list">${approvalCards()}</section>`;
  }

  if (page === 'audit') {
    content.innerHTML =
      header('Audit history', "This session's reports, room changes, and human decisions.") +
      `<div class="toolbar"><button class="btn btn-secondary" id="exportAudit" ${audit.length ? '' : 'disabled'}>Download audit CSV</button>${!storageAvailable ? '<span class="pill pill-warning">Browser storage unavailable — changes will not persist after refresh</span>' : ''}</div>
      <section class="panel">${
        audit.length
          ? audit.map((a) => `<article class="audit-row"><strong>${esc(a.action)}</strong><p>${esc(a.detail)}</p><small class="muted">${esc(a.time)} · ${esc(a.actor)}</small></article>`).join('')
          : '<div class="empty">No actions recorded yet. Create a report or review a recommendation to start the audit trail.</div>'
      }</section>`;
  }

  if (page === 'fb') {
    content.innerHTML =
      header('Food & Beverage', 'Restaurant, banquet, and kitchen coordination.') +
      `<section class="kpi-band">
        <article class="kpi"><span>Daily revenue</span><strong class="tnum">$12,480</strong><div class="delta">Sample operating day</div></article>
        <article class="kpi"><span>Food cost</span><strong class="tnum">32.4%</strong><div class="delta delta-warning">Target 30%</div></article>
        <article class="kpi"><span>Banquet covers</span><strong class="tnum">120</strong><div class="delta">Evening event</div></article>
        <article class="kpi"><span>Open tasks</span><strong class="tnum">${tasks.filter((t) => t.status !== 'Completed').length}</strong><div class="delta">Kitchen &amp; service</div></article>
      </section>
      <div class="toolbar">
        <button class="btn btn-primary" data-new-report="fb">Create F&amp;B report</button>
        <button class="btn btn-secondary" data-report-id="4">View department analysis</button>
        <button class="btn btn-secondary" id="addTask">Add task</button>
        <label for="taskFilter" class="toolbar-label">Status</label>
        <select id="taskFilter"><option value="all">All tasks</option>${['Open', 'In progress', 'Completed'].map((s) => `<option ${filter === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
      <section class="panel table-scroll"><table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>${taskRows()}</tbody></table></section>`;
  }

  if (page === 'housekeeping') {
    content.innerHTML =
      header('Housekeeping', 'Room readiness with a human inspection before release.') +
      `<section class="kpi-band">
        <article class="kpi"><span>Rooms in sample</span><strong class="tnum">${rooms.length}</strong></article>
        <article class="kpi"><span>Ready</span><strong class="tnum">${rooms.filter((r) => r.status === 'Ready').length}</strong></article>
        <article class="kpi"><span>Awaiting inspection</span><strong class="tnum">${rooms.filter((r) => r.status === 'Awaiting inspection').length}</strong></article>
        <article class="kpi"><span>Maintenance holds</span><strong class="tnum">${rooms.filter((r) => r.status === 'Maintenance hold').length}</strong></article>
      </section>
      <div class="toolbar"><label for="roomFilter" class="toolbar-label">Status</label><select id="roomFilter"><option value="all">All rooms</option>${['Dirty', 'Cleaning', 'Awaiting inspection', 'Ready', 'Maintenance hold'].map((s) => `<option ${filter === s ? 'selected' : ''}>${s}</option>`).join('')}</select><button class="btn btn-primary" data-new-report="housekeeping">Create housekeeping report</button></div>
      <section class="panel table-scroll"><table><thead><tr><th>Room</th><th>Arrival</th><th>Assigned to</th><th>Status</th><th>Action</th></tr></thead><tbody>${roomRows(false)}</tbody></table></section>`;
  }
}

/* ---------- navigation ---------- */
function closeMobileNav() {
  $('.sidebar').classList.remove('open');
  $('#navOverlay').classList.remove('show');
  $('#navOverlay').hidden = true;
  $('.mobile-menu').setAttribute('aria-expanded', 'false');
}
function navigate(next) {
  page = next;
  filter = 'all';
  closeMobileNav();
  render();
  window.scrollTo(0, 0);
}

/* ---------- dialogs ---------- */
function createReport(dept) {
  $('#deptInput').innerHTML = Object.entries(departments).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  if (dept) $('#deptInput').value = dept;
  clearFieldError($('#reportForm'));
  $('#createDialog').showModal();
}
function viewReport(id) {
  const r = reports.find((r) => r.id === id);
  if (!r) return;
  openDialog(
    departments[r.dept] + ' report',
    r.owner,
    `<section class="modal-section"><h3>Director's analysis</h3><div class="callout callout-human">${esc(r.insight)}</div></section>
     <section class="modal-section"><h3>Recommended action</h3><p>${esc(r.action)}</p></section>
     <section class="modal-section"><h3>Supporting metrics</h3><div class="checks-grid">${r.metrics.map((m) => `<div class="check tnum">${esc(m)}</div>`).join('')}</div></section>
     <section class="modal-section"><h3>Bellwise review</h3><div class="callout callout-ai">${r.flag ? 'Human verification required before this recommendation proceeds.' : 'No additional check flagged.'} This is a simulated review against the reports shown here, not validation against source systems. Data as of ${esc(r.asOf || 'this session')}.</div></section>
     <div class="modal-actions"><button class="btn btn-secondary" data-download-report="${id}">Download report</button><button class="btn btn-primary" data-ack="${id}">Acknowledge</button></div>`
  );
}
function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function openResetConfirm() {
  $('#resetDialog').showModal();
}

/* ---------- global click delegation ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.matches('[data-close]')) b.closest('dialog').close();
  if (b.dataset.page) navigate(b.dataset.page);
  if (b.matches('.mobile-menu')) {
    const open = $('.sidebar').classList.toggle('open');
    b.setAttribute('aria-expanded', String(open));
    $('#navOverlay').hidden = !open;
    $('#navOverlay').classList.toggle('show', open);
  }
  if (b.matches('#demoInfoToggle')) $('#demoDialog').showModal();
  if (b.matches('#resetDemo')) openResetConfirm();
  if (b.matches('#confirmReset')) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    location.reload();
  }

  if (b.dataset.reportId) viewReport(Number(b.dataset.reportId));
  if (b.id === 'createReport' || b.dataset.newReport) createReport(b.dataset.newReport);
  if (b.dataset.ack) {
    const r = reports.find((r) => r.id === Number(b.dataset.ack));
    if (r) r.flag = false;
    log('Report acknowledged', `Report #${b.dataset.ack} reviewed by a human.`);
    $('#reportDialog').close();
    render();
    toast('Acknowledgment recorded.');
  }
  if (b.dataset.downloadReport) {
    const r = reports.find((r) => r.id === Number(b.dataset.downloadReport));
    download('bellwise-report-' + r.id + '.txt', `BELLWISE — DEMO REPORT\n${departments[r.dept]}\n${r.owner}\nData as of ${r.asOf || 'this session'}\n\n${r.insight}\n\nRecommended action: ${r.action}\n\n${r.metrics.join('\n')}\n\nSample data; simulated AI checks.`);
  }
  if (b.dataset.approve) {
    const a = approvals.find((a) => a.id === Number(b.dataset.approve));
    if (!a || a.status !== 'Pending' || a.blocked) return;
    a.status = 'Approved';
    a.actor = actor();
    log('Recommendation approved', a.title + ' — demo decision only; no external action.');
    render();
    toast('Approval recorded. No external action was executed.');
  }
  if (b.dataset.override) {
    pending = Number(b.dataset.override);
    clearFieldError($('#overrideForm'));
    $('#overrideDialog').showModal();
  }
  if (b.dataset.revise) {
    pending = Number(b.dataset.revise);
    clearFieldError($('#revisionForm'));
    $('#revisionDialog').showModal();
  }
  if (b.dataset.verify) {
    openDialog(
      'Verify housekeeping data',
      'Human verification required',
      `<p>The sample roster shows two fewer shifts than the sample payroll schedule. In production, the source records would need to be reconciled before this recommendation could be approved.</p>
       <div class="note"><span>This button only simulates verification in the demo — it does not check any real system.</span></div>
       <div class="modal-actions"><button class="btn btn-primary" data-confirm-verify="${b.dataset.verify}">Simulate verification</button></div>`
    );
  }
  if (b.dataset.confirmVerify) {
    const a = approvals.find((a) => a.id === Number(b.dataset.confirmVerify));
    a.blocked = false;
    a.detail = 'Data conflict marked verified in the demo. Human approval is still required.';
    log('Demo verification recorded', a.title);
    $('#reportDialog').close();
    render();
  }
  if (b.dataset.task) {
    const t = tasks.find((t) => t.id === Number(b.dataset.task));
    t.status = 'Completed';
    log('F&B task completed', t.title);
    render();
    toast('Task completed.');
  }
  if (b.dataset.room) {
    const r = rooms.find((r) => r.number === b.dataset.room);
    if (r.status === 'Ready' || r.status === 'Maintenance hold') {
      openDialog(
        'Room ' + r.number,
        r.status,
        `<p>${r.status === 'Ready' ? 'Room is inspected and ready in this demo.' : 'Maintenance has blocked this room. Housekeeping cannot release it until engineering clears the hold — the "Ready" action is not available for a room on hold.'}</p><p>Assigned to ${r.assignee}. Arrival ${r.arrival}.</p>`
      );
    } else if (r.status === 'Awaiting inspection') {
      openDialog('Inspect room ' + r.number, 'Human release required', `<p>Confirm that cleaning and the room-readiness inspection are complete.</p><div class="modal-actions"><button class="btn btn-primary" data-inspect="${r.number}">Confirm inspection &amp; mark ready</button></div>`);
    } else {
      r.status = r.status === 'Dirty' ? 'Cleaning' : 'Awaiting inspection';
      log('Room status updated', `Room ${r.number}: ${r.status}`);
      render();
      toast('Room ' + r.number + ' updated.');
    }
  }
  if (b.dataset.inspect) {
    const r = rooms.find((r) => r.number === b.dataset.inspect);
    r.status = 'Ready';
    log('Room inspection confirmed', 'Room ' + r.number + ' marked ready by a human.');
    $('#reportDialog').close();
    render();
    toast('Room ' + r.number + ' is ready.');
  }
  if (b.dataset.resolveRequest) {
    const g = guestRequests.find((g) => g.id === Number(b.dataset.resolveRequest));
    g.status = 'Resolved';
    log('Guest request resolved', `${g.room}: ${g.request}`);
    render();
    toast('Guest request marked resolved.');
  }
  if (b.id === 'logGuestRequest') {
    openDialog(
      'Log guest request',
      'Sample requests are held in this demo session.',
      `<form id="guestRequestForm" class="form-grid">
        <div class="form-field"><label for="grRoom">Room</label><select id="grRoom" required>${rooms.map((r) => `<option>${r.number}</option>`).join('')}</select></div>
        <div class="form-field"><label for="grText">Request</label><input id="grText" maxlength="140" required placeholder="e.g. Extra towels, late checkout"></div>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Log request</button></div>
      </form>`
    );
  }
  if (b.id === 'runReview') {
    const findings = reports.map((r) => `${departments[r.dept]} — ${r.insight}\nProposed action: ${r.action}`);
    const decisions = approvals.filter((a) => a.status === 'Pending').map((a) => `• ${a.title}${a.blocked ? ' (needs verification first)' : ''}`);
    log('Executive brief generated', `${reports.length} reports combined; ${countPending()} decisions pending.`);
    openDialog(
      'Bellwise executive brief',
      `${reports.length} reports · Simulated synthesis · ${actor()}`,
      `<div class="note"><span>Generated from the current demo reports using a template, not a live AI model.</span></div>
       <section class="modal-section"><h3>Findings</h3><div class="review-result">${esc(findings.join('\n\n'))}</div></section>
       <section class="modal-section"><h3>Supporting reports</h3><div class="checks-grid">${reports.map((r) => `<div class="check">Report #${r.id} — ${departments[r.dept]} <span class="muted small">(as of ${esc(r.asOf || 'this session')})</span></div>`).join('')}</div></section>
       <section class="modal-section"><h3>Data freshness</h3><p class="muted small">Each figure reflects the sample snapshot timestamp shown on its report above. No live system refresh occurs in this demo.</p></section>
       <section class="modal-section"><h3>Decisions required</h3>${decisions.length ? `<div class="review-result">${esc(decisions.join('\n'))}</div>` : '<p class="muted small">No pending decisions.</p>'}</section>
       <div class="modal-actions"><button class="btn btn-primary" data-close>Close brief</button></div>`
    );
  }
  if (b.id === 'addTask') {
    openDialog(
      'Add Food & Beverage task',
      'Assigned tasks are held in this demo session.',
      `<form id="taskForm" class="form-grid">
        <div class="form-field"><label for="taskTitle">Task</label><input id="taskTitle" name="title" maxlength="180" required></div>
        <div class="form-field"><label for="taskOwner">Owner</label><input id="taskOwner" name="owner" maxlength="80" required></div>
        <div class="form-field"><label for="taskTime">Due time</label><input id="taskTime" name="time" type="time" required></div>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Add task</button></div>
      </form>`
    );
  }
  if (b.id === 'exportAudit') {
    const cell = (s) => '"' + String(s).replace(/^[=+@-]/, "'").replace(/"/g, '""') + '"';
    download('bellwise-audit.csv', ['Time,Actor,Action,Detail', ...audit.map((a) => [a.time, a.actor, a.action, a.detail].map(cell).join(','))].join('\r\n'), 'text/csv');
  }
});

$('#navOverlay').addEventListener('click', closeMobileNav);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('.sidebar').classList.contains('open')) closeMobileNav();
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'roleSelect') {
    render();
    toast('Demo perspective changed. This is not an access-control system.');
  }
  if (e.target.id === 'departmentFilter' || e.target.id === 'roomFilter' || e.target.id === 'taskFilter') {
    filter = e.target.value;
    render();
  }
});

document.addEventListener('submit', (e) => {
  if (e.target.id === 'reportForm') {
    e.preventDefault();
    const insight = $('#analysisInput').value.trim();
    const action = $('#actionInput').value.trim();
    if (!insight || !action) {
      fieldError(e.target, 'Add both an analysis and a recommended action before submitting.');
      return;
    }
    const dept = $('#deptInput').value;
    reports.push({ id: reports.length + 1, dept, owner: actor() + ' · Demo submission', insight, action, metrics: ['Source verification not performed'], flag: true, asOf: 'Just now' });
    log('Department report submitted', departments[dept] + ': ' + action);
    $('#createDialog').close();
    e.target.reset();
    navigate('reports');
    toast('Report added. Source verification is still required.');
  }
  if (e.target.id === 'overrideForm') {
    e.preventDefault();
    const reason = $('#overrideReason').value.trim();
    if (!reason) {
      fieldError(e.target, 'Explain the reason for this override.');
      return;
    }
    const a = approvals.find((a) => a.id === pending);
    a.status = 'Overridden';
    a.actor = actor();
    a.reason = reason;
    log('Recommendation overridden', a.title + ' — Reason: ' + reason);
    $('#overrideDialog').close();
    e.target.reset();
    pending = null;
    render();
    toast('Override and reason recorded.');
  }
  if (e.target.id === 'revisionForm') {
    e.preventDefault();
    const reason = $('#revisionReason').value.trim();
    if (!reason) {
      fieldError(e.target, 'Explain what needs to change before this can be approved.');
      return;
    }
    const a = approvals.find((a) => a.id === pending);
    a.status = 'Needs revision';
    a.actor = actor();
    a.reason = reason;
    log('Recommendation returned for revision', a.title + ' — ' + reason);
    $('#revisionDialog').close();
    e.target.reset();
    pending = null;
    render();
    toast('Returned for revision.');
  }
  if (e.target.id === 'taskForm') {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get('title').trim();
    const owner = f.get('owner').trim();
    if (!title || !owner) return;
    tasks.push({ id: tasks.length + 1, title, owner, time: f.get('time'), status: 'Open' });
    log('F&B task created', title + ' · ' + owner);
    $('#reportDialog').close();
    render();
    toast('Task added.');
  }
  if (e.target.id === 'guestRequestForm') {
    e.preventDefault();
    const room = $('#grRoom').value;
    const text = $('#grText').value.trim();
    if (!text) return;
    guestRequests.push({ id: guestRequests.length + 1, room, request: text, loggedBy: actor(), time: new Date().toLocaleString(), status: 'Open' });
    log('Guest request logged', `${room}: ${text}`);
    $('#reportDialog').close();
    render();
    toast('Guest request logged.');
  }
});

/* ---------- boot ---------- */
$('#createDialog .modal-head p').textContent = 'Add your analysis. Demo checks do not validate source data.';
$('#reportForm button[type="submit"]').textContent = 'Submit report';
$('.mobile-menu').setAttribute('aria-expanded', 'false');
if (!storageAvailable) toast('Browser storage is unavailable — changes will not be saved after refresh.');
render();

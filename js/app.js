/* ─── THEME (shared between admin & app via localStorage) ───────────────── */
const WELLAGE_THEME_KEY = 'wellage-theme';

function applyTheme(theme) {
  const html = document.documentElement;
  const dark = theme === 'dark';
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.innerHTML = dark
      ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
      : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
}

function initTheme() {
  let stored;
  try {
    stored = localStorage.getItem(WELLAGE_THEME_KEY);
  } catch (_) {
    stored = null;
  }
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    // default comes from HTML attribute
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(WELLAGE_THEME_KEY, next);
  } catch (_) {}
}

/* ─── AUTH ───────────────────────────────────── */
function showForm(which) {
  document.getElementById('loginBox').classList.toggle('hidden', which !== 'login');
  document.getElementById('signupBox').classList.toggle('hidden', which !== 'signup');
}

function selectRole(btn, tabsId) {
  document.getElementById(tabsId).querySelectorAll('.role-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) { toast('Please fill in all fields.', 'error'); return; }
  if (!email.includes('@')) { toast('Enter a valid email address.', 'error'); return; }
  showApp(email);
}

function handleSignup() {
  const first   = document.getElementById('signupFirst').value.trim();
  const last    = document.getElementById('signupLast').value.trim();
  const email   = document.getElementById('signupEmail').value.trim();
  const phone   = document.getElementById('signupPhone').value.trim();
  const house   = document.getElementById('signupHouse').value.trim();
  const pass    = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const pwdErr  = document.getElementById('pwdErr');

  if (!first || !last || !email || !phone || !house || !pass || !confirm) {
    toast('Please fill in all fields.', 'error'); return;
  }
  if (!email.includes('@')) { toast('Enter a valid email address.', 'error'); return; }
  if (pass !== confirm) {
    pwdErr.classList.remove('hidden');
    document.getElementById('signupConfirm').classList.add('invalid');
    return;
  }
  pwdErr.classList.add('hidden');
  document.getElementById('signupConfirm').classList.remove('invalid');
  toast('Account created. Signing you in...', 'success');
  setTimeout(() => showApp(email, `${first} ${last[0]}.`, house), 1500);
}

function showApp(email, name, unit) {
  document.getElementById('authView').classList.add('hidden');
  document.getElementById('appView').classList.remove('hidden');
  const n = name || email.split('@')[0];
  document.getElementById('userName').textContent = n;
  document.getElementById('userAvatar').textContent = n.slice(0,2).toUpperCase();
  // Web portal is admin-only; all web logins are admins
  document.getElementById('userRole').textContent = 'Admin';
  renderPendingResidents(); // keep dashboard "New resident signups" count in sync
  // toast('Welcome to Wellage Admin.', 'success');
}

function logout() {
  document.getElementById('appView').classList.add('hidden');
  document.getElementById('authView').classList.remove('hidden');
  toast('Signed out successfully.', 'info');
}

/* ─── NAV ────────────────────────────────────── */
const pageTitles = {
  dashboard: { title: 'Overview', sub: 'Monday, 2 March 2026' },
  payments:  { title: 'Payments', sub: 'Track and manage resident payments' },
  visitors:  { title: 'Visitors', sub: 'Digital access logbook' },
  notices:   { title: 'Notices', sub: 'Community announcements and polls' },
  residents: { title: 'Residents', sub: 'Manage district residents' },
};

function navTo(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');
  const info = pageTitles[page] || { title: page, sub: '' };
  document.getElementById('pageTitle').textContent = info.title;
  document.getElementById('pageSubtitle').textContent = info.sub;
  if (page === 'residents') renderPendingResidents();
}

/* ─── PAYMENTS FILTER ─────────────────────────── */
function filterPayments(search, status) {
  const rows = document.querySelectorAll('#paymentsBody tr');
  const s = (search || '').toLowerCase();
  const st = status || document.querySelector('#page-payments .filter-select').value;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const rowStatus = row.getAttribute('data-status') || '';
    const matchText = !s || text.includes(s);
    const matchStatus = !st || rowStatus === st;
    row.style.display = (matchText && matchStatus) ? '' : 'none';
  });
}

/* ─── VISITOR REGISTRATION ────────────────────── */
function registerVisitor() {
  const name  = document.getElementById('visitorName').value.trim();
  const plate = document.getElementById('visitorPlate').value.trim();
  const host  = document.getElementById('visitorHost').value.trim();
  if (!name || !host) { toast('Visitor name and host unit are required.', 'error'); return; }
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const tbody = document.getElementById('visitorsBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${plate || '—'}</td>
    <td>${host}</td>
    <td>${now}</td>
    <td>—</td>
    <td><span class="badge-status badge-paid">On-site</span></td>
  `;
  tbody.insertBefore(row, tbody.firstChild);
  document.getElementById('visitorName').value = '';
  document.getElementById('visitorPlate').value = '';
  document.getElementById('visitorHost').value = '';
  toast(`${name} checked in — ${host}.`, 'success');
}

/* ─── MODALS ──────────────────────────────────── */
function openModal(id) {
  document.getElementById('modal-' + id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function closeModalOutside(e, id) {
  if (e.target.classList.contains('modal-backdrop')) closeModal(id);
}

function submitPayment() {
  closeModal('modal-recordPayment');
  toast('Payment recorded successfully.', 'success');
}

function submitNotice() {
  closeModal('modal-addNotice');
  toast('Notice published to all residents.', 'success');
}

function submitResident() {
  closeModal('modal-addResident');
  toast('Resident added successfully.', 'success');
}

/* ─── PENDING RESIDENTS (signups from app — approve to allow login) ───────── */
const PENDING_RESIDENTS_KEY = 'wellage-pending-residents';
const APPROVED_RESIDENTS_KEY = 'wellage-approved-residents';

function getAdminPendingResidents() {
  try {
    const raw = localStorage.getItem(PENDING_RESIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function getAdminApprovedResidents() {
  try {
    const raw = localStorage.getItem(APPROVED_RESIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function renderPendingResidents() {
  const pending = getAdminPendingResidents();
  const countEl = document.getElementById('pending-residents-count');
  const emptyEl = document.getElementById('pending-residents-empty');
  const tableEl = document.getElementById('pending-residents-table');
  const tbody = document.getElementById('pending-residents-tbody');
  if (!countEl || !tbody) return;
  const countText = pending.length === 1 ? '1 request' : pending.length + ' requests';
  countEl.textContent = countText;
  const dashboardCountEl = document.getElementById('dashboard-pending-residents-count');
  if (dashboardCountEl) dashboardCountEl.textContent = countText;
  if (pending.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (tableEl) tableEl.classList.add('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  if (tableEl) tableEl.classList.remove('hidden');
  tbody.innerHTML = pending.map((r, i) => {
    const submitted = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' }) : '—';
    return `<tr data-index="${i}">
      <td>${escapeHtml(r.fullName || '—')}</td>
      <td>${escapeHtml(r.phone || '—')}</td>
      <td>${escapeHtml(r.unit || '—')}</td>
      <td>${escapeHtml(r.community || '—')}</td>
      <td>${submitted}</td>
      <td>
        <button type="button" class="btn-ghost btn-sm" onclick="approvePendingResident(${i})">Approve</button>
        <button type="button" class="btn-ghost btn-sm text-danger" onclick="rejectPendingResident(${i})">Reject</button>
      </td>
    </tr>`;
  }).join('');
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function approvePendingResident(index) {
  const pending = getAdminPendingResidents();
  const resident = pending[index];
  if (!resident) return;
  const approved = getAdminApprovedResidents();
  approved.push({
    fullName: resident.fullName,
    phone: resident.phone,
    unit: resident.unit,
    community: resident.community,
    password: resident.password,
  });
  pending.splice(index, 1);
  localStorage.setItem(PENDING_RESIDENTS_KEY, JSON.stringify(pending));
  localStorage.setItem(APPROVED_RESIDENTS_KEY, JSON.stringify(approved));
  renderPendingResidents();
  toast('Resident approved. They can now sign in from the app.', 'success');
}

function rejectPendingResident(index) {
  const pending = getAdminPendingResidents();
  pending.splice(index, 1);
  localStorage.setItem(PENDING_RESIDENTS_KEY, JSON.stringify(pending));
  renderPendingResidents();
  toast('Request rejected.', 'info');
}

/* ─── TOAST ───────────────────────────────────── */
function toast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };
  el.innerHTML = (icons[type] || '') + msg;
  wrap.appendChild(el);
  requestAnimationFrame(() => { requestAnimationFrame(() => el.classList.add('show')); });
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

/* ─── ESC TO CLOSE ───────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => m.classList.add('hidden'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
});
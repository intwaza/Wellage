/* Wellage App — plain JS */

// ─── Theme (shared via localStorage with admin portal) ─────────────────────
const WELLAGE_THEME_KEY = 'wellage-theme';

function applyTheme(theme) {
  var html = document.documentElement;
  var dark = theme === 'dark';
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  var sunMoonHtml = dark
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  document.querySelectorAll('.theme-icon').forEach(function (el) {
    el.innerHTML = sunMoonHtml;
  });
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

const PENDING_RESIDENTS_KEY = 'wellage-pending-residents';
const APPROVED_RESIDENTS_KEY = 'wellage-approved-residents';

function getPendingResidents() {
  try {
    const raw = localStorage.getItem(PENDING_RESIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function getApprovedResidents() {
  try {
    const raw = localStorage.getItem(APPROVED_RESIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

const WELLAGE_ESTATE_KEY = 'wellage_estate_name';

function getEstateName() {
  try { return localStorage.getItem(WELLAGE_ESTATE_KEY) || 'Wellage Estate'; } catch (_) { return 'Wellage Estate'; }
}

function populateResidentSignupCommunity() {
  const el = document.getElementById('residentSignupCommunityDisplay');
  if (el) el.textContent = getEstateName();
}

function submitResidentSignup() {
  const fullName = document.getElementById('residentSignupName').value.trim();
  const phone = document.getElementById('residentSignupPhone').value.trim();
  const unit = document.getElementById('residentSignupUnit').value.trim();
  const password = document.getElementById('residentSignupPassword').value;
  const community = getEstateName();
  if (!fullName) {
    toast('Please enter your full name.', 'error');
    return;
  }
  if (!phone) {
    toast('Please enter your phone number.', 'error');
    return;
  }
  if (!unit) {
    toast('Please enter your unit or house number.', 'error');
    return;
  }
  if (!password || password.length < 4) {
    toast('Please choose a password (at least 4 characters).', 'error');
    return;
  }
  const pending = getPendingResidents();
  if (pending.some(r => (r.phone || '').trim() === phone)) {
    toast('This phone number already has a pending registration.', 'error');
    return;
  }
  const approved = getApprovedResidents();
  if (approved.some(r => (r.phone || '').trim() === phone)) {
    toast('This phone number is already registered. Please sign in.', 'error');
    return;
  }
  pending.push({
    fullName,
    phone,
    unit,
    community,
    password,
    createdAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(PENDING_RESIDENTS_KEY, JSON.stringify(pending));
  } catch (_) {
    toast('Could not save registration. Try again.', 'error');
    return;
  }
  closeModal('modal-resident-auth');
  toast('Registration submitted. An admin will review your request. You\'ll be notified when you can sign in.', 'success');
}

function showResidentLogin() {
  closeModal('modal-resident-auth');
  document.getElementById('modal-resident-login').classList.remove('hidden');
}

function showResidentSignup() {
  closeModal('modal-resident-login');
  document.getElementById('modal-resident-auth').classList.remove('hidden');
  populateResidentSignupCommunity();
}


function submitResidentLogin() {
  const phone = document.getElementById('residentLoginPhone').value.trim();
  const password = document.getElementById('residentLoginPassword').value;
  if (!phone || !password) {
    toast('Please enter phone and password.', 'error');
    return;
  }
  const approved = getApprovedResidents();
  const user = approved.find(r => (r.phone || '').trim() === phone && r.password === password);
  if (!user) {
    toast('Phone or password incorrect, or your account is not yet approved.', 'error');
    return;
  }
  closeModal('modal-resident-login');
  enterResidentView(user);
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : 'Good evening';
}

function updateResidentGreeting() {
  const greeting = document.getElementById('residentGreeting');
  const nameEl = document.getElementById('residentUserName');
  if (!greeting) return;
  const fullName = (nameEl && nameEl.textContent) ? nameEl.textContent.trim() : 'Resident';
  const firstName = fullName.split(' ')[0] || 'Resident';
  const escaped = firstName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  greeting.innerHTML = getTimeOfDayGreeting() + ',<br><em>' + escaped + '</em> 👋';
}

function enterResidentView(user) {
  const name = (user && user.fullName) || 'Resident';
  const unit = (user && user.unit) || 'A-12';
  const community = (user && user.community) || '';
  RESIDENT_COMMUNITY = community;
  document.getElementById('residentUserName').textContent = name;
  updateResidentGreeting();
  setResidentUnit(unit);
  setResidentEstateName();
  showView('resident');
  residentNav('home');
}

function completeSecurityAuth() {
  const name = document.getElementById('securityAuthName').value.trim();
  if (!name) {
    toast('Please enter your name to continue.', 'error');
    return;
  }
  closeModal('modal-security-auth');
  showView('security');
  securityNav('checkin');
}

// ─── View switching ───────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + id);
  if (el) el.classList.add('active');
  const frame = document.querySelector('.app-phone-frame');
  if (frame) frame.classList.toggle('resident-active', id === 'resident');
  if (id === 'welcome') return;
  if (id === 'resident') setResidentUnit('A-12');
  if (id === 'security') renderLogbook();
  if (id === 'admin-app') {
    adminNav('overview');
    renderAdminPendingResidents();
  }
}

function enterAs(role) {
  if (role === 'resident') {
    document.getElementById('modal-resident-login').classList.remove('hidden');
  } else if (role === 'security') {
    document.getElementById('modal-security-auth').classList.remove('hidden');
  }
}

// ─── Admin auth & app ──────────────────────────────────────
function toggleAdminPw(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp || !icon) return;
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

function openAdminSigninModal() {
  try {
    const el = document.getElementById('modal-admin-signin');
    if (el) el.classList.remove('hidden');
  } catch (e) {
    console.error('openAdminSigninModal', e);
  }
}

function doAdminSignIn() {
  const btn = document.getElementById('adminSiBtn');
  const email = document.getElementById('adminSiEmail').value.trim();
  const pw = document.getElementById('adminSiPw').value;
  if (!email || !pw) {
    toast('Please enter your email and password.', 'error');
    return;
  }
  if (btn) btn.classList.add('loading');
  setTimeout(() => {
    if (btn) btn.classList.remove('loading');
    closeModal('modal-admin-signin');
    showView('admin-app');
    // toast('Welcome to Wellage Admin.', 'success');
  }, 1200);
}

const WELLAGE_ESTATE_CODE_KEY = 'wellage_estate_code';

function doAdminSignUp() {
  const btn = document.getElementById('adminSuBtn');
  const first = document.getElementById('adminSuFirst').value.trim();
  const last = document.getElementById('adminSuLast').value.trim();
  const email = document.getElementById('adminSuEmail').value.trim();
  const code = (document.getElementById('adminSuCode').value || '').trim().toUpperCase();
  const estateName = (document.getElementById('adminSuEstateName').value || '').trim();
  const pw = document.getElementById('adminSuPw').value;
  if (!first || !last || !email || !code || !estateName || !pw) {
    toast('Please fill in all fields.', 'error');
    return;
  }
  if (pw.length < 8) {
    toast('Password must be at least 8 characters.', 'error');
    return;
  }
  if (btn) btn.classList.add('loading');
  setTimeout(() => {
    if (btn) btn.classList.remove('loading');
    try {
      localStorage.setItem(WELLAGE_ESTATE_CODE_KEY, code);
      localStorage.setItem(WELLAGE_ESTATE_KEY, estateName);
    } catch (_) {}
    ['adminSuFirst', 'adminSuLast', 'adminSuEmail', 'adminSuPhone', 'adminSuCode', 'adminSuEstateName', 'adminSuPw'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    closeModal('modal-admin-signup');
    document.getElementById('modal-admin-signin').classList.remove('hidden');
    toast('Account created! You can now sign in.', 'success');
  }, 1200);
}

const adminPageTitles = {
  overview:   { title: 'Overview',   sub: 'Monday, 2 March 2026' },
  payments:   { title: 'Payments',   sub: 'March 2026 · Urugo Estate' },
  visitors:   { title: 'Visitors',   sub: 'Digital access logbook' },
  notices:    { title: 'Notices',    sub: 'Community announcements' },
  community:  { title: 'Community',  sub: 'Notices & resident chat' },
  residents:  { title: 'Residents',  sub: 'Manage district residents' },
  incidents:  { title: 'Incidents',  sub: 'Incident history & status' },
};

function adminNav(tab) {
  document.querySelectorAll('.admin-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-bottom-nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('admin-screen-' + tab);
  const navBtn = document.querySelector('.admin-bottom-nav-item[data-tab="' + tab + '"]');
  if (screen) screen.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  if (tab === 'incidents') renderAdminIncidents();
  if (tab === 'community') { renderAdminNotices(); renderChatList(true); }
  const shell = document.getElementById('adminAppShell');
  if (shell) {
    if (tab === 'overview') shell.classList.add('on-overview');
    else shell.classList.remove('on-overview');
  }
  const info = adminPageTitles[tab] || { title: tab, sub: '' };
  const titleEl = document.getElementById('adminAppTitle');
  const subEl = document.getElementById('adminAppSubtitle');
  if (titleEl) titleEl.textContent = info.title;
  if (subEl) subEl.textContent = info.sub;
  if (tab === 'residents') renderAdminPendingResidents();
  else if (tab === 'overview') updateAttentionCards();
}

function updateAttentionCards() {
  const today = todayKey();

  // Payments: count overdue + pending rows in the payments table
  const overdueRows = document.querySelectorAll('.admin-pay-row-overdue').length;
  const pendingRows = document.querySelectorAll('.admin-pay-row-pending').length;
  const payCard = document.getElementById('adminAttnPayments');
  const payMeta = document.getElementById('adminAttnPaymentsMeta');
  if (payCard) {
    const hasPayments = overdueRows > 0 || pendingRows > 0;
    payCard.style.display = hasPayments ? '' : 'none';
    if (payMeta && hasPayments) {
      const parts = [];
      if (overdueRows > 0) parts.push('<strong>' + overdueRows + ' overdue</strong>');
      if (pendingRows > 0) parts.push(pendingRows + ' pending confirmation');
      payMeta.innerHTML = parts.join(' · ');
    }
  }

  // Residents: count pending signups
  const pending = getPendingResidents();
  const resCard = document.getElementById('adminAttnResidents');
  const countEl = document.getElementById('adminAppPendingCount');
  if (resCard) resCard.style.display = pending.length > 0 ? '' : 'none';
  if (countEl) countEl.textContent = pending.length === 1 ? '1 request' : pending.length + ' requests';

  // Visitors: count onsite entries for today
  const onsiteCount = logbook.filter(e => e.status === 'onsite' && (e.dateKey || today) === today).length;
  const visCard = document.getElementById('adminAttnVisitors');
  const visCount = document.getElementById('adminAttnVisitorCount');
  if (visCard) visCard.style.display = onsiteCount > 0 ? '' : 'none';
  if (visCount) visCount.textContent = onsiteCount + (onsiteCount === 1 ? ' visitor' : ' visitors');

  // Hide the whole section header if no cards are visible
  const sectionHead = document.getElementById('adminAttnSectionHead');
  const attnList = document.getElementById('adminAttnSectionHead');
  if (sectionHead) {
    const anyVisible = (overdueRows > 0 || pendingRows > 0) || pending.length > 0 || onsiteCount > 0;
    sectionHead.style.display = anyVisible ? '' : 'none';
    const list = sectionHead.nextElementSibling;
    if (list) list.style.display = anyVisible ? '' : 'none';
  }
}

function adminLogout() {
  showView('welcome');
  toast('Signed out successfully.', 'info');
}

function renderAdminPendingResidents() {
  const pending = getPendingResidents();
  const countEl = document.getElementById('adminAppPendingCount');
  const metaEl = document.getElementById('adminAppPendingMeta');
  const emptyEl = document.getElementById('adminPendingEmpty');
  const tableEl = document.getElementById('adminPendingTable');
  const tbody = document.getElementById('adminPendingTbody');
  const countText = pending.length === 1 ? '1 request' : pending.length + ' requests';
  if (countEl) countEl.textContent = countText;
  if (metaEl) metaEl.textContent = countText;
  if (pending.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (tableEl) tableEl.classList.add('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  if (tableEl) tableEl.classList.remove('hidden');
  if (tbody) {
    tbody.innerHTML = pending.map((r, i) => {
      const name = (r.fullName || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const unit = (r.unit || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<tr data-index="${i}"><td>${name}</td><td>${unit}</td><td><button type="button" class="admin-card-action" onclick="approveAdminPending(${i})">Approve</button></td></tr>`;
    }).join('');
  }
}

function approveAdminPending(index) {
  const pending = getPendingResidents();
  const resident = pending[index];
  if (!resident) return;
  const approved = getApprovedResidents();
  approved.push({
    fullName: resident.fullName,
    phone: resident.phone,
    unit: resident.unit,
    community: resident.community,
  });
  pending.splice(index, 1);
  try {
    localStorage.setItem(PENDING_RESIDENTS_KEY, JSON.stringify(pending));
    localStorage.setItem(APPROVED_RESIDENTS_KEY, JSON.stringify(approved));
  } catch (_) {}
  renderAdminPendingResidents();
  toast('Resident approved. They can now sign in.', 'success');
}

// Admin payments screen (new layout) — stubs so onclick never throws
function adminOpenAddPaymentSheet() {
  // TODO: open add-payment bottom sheet when implemented
}
function adminPaymentsSetTab(el) {
  if (!el || !el.classList) return;
  const wrap = el.closest('.admin-pay-tabs') || document.getElementById('adminPayTabs');
  if (wrap) wrap.querySelectorAll('.admin-pay-tab').forEach(t => t.classList.remove('admin-pay-tab-active'));
  el.classList.add('admin-pay-tab-active');

  const filter = el.getAttribute('data-filter') || 'all';
  const approvalSection = document.getElementById('adminPayApprovalSection');
  const tableSection = document.getElementById('adminPayTableSection');
  const table = tableSection && tableSection.querySelector('.admin-pay-table');

  if (approvalSection) {
    approvalSection.classList.toggle('admin-pay-filter-hidden', filter !== 'all' && filter !== 'to-approve');
  }
  if (tableSection) {
    tableSection.classList.toggle('admin-pay-filter-hidden', filter === 'to-approve');
  }
  if (table) {
    table.querySelectorAll('.admin-pay-row').forEach(row => {
      const isPaid = row.classList.contains('admin-pay-row-paid');
      const isOverdue = row.classList.contains('admin-pay-row-overdue');
      const isPending = row.classList.contains('admin-pay-row-pending');
      let show = true;
      if (filter === 'paid') show = isPaid;
      else if (filter === 'overdue') show = isOverdue;
      else if (filter === 'pending') show = isPending;
      else if (filter === 'all' || filter === 'to-approve') show = true;
      row.classList.toggle('admin-pay-filter-hidden', !show);
    });
  }
}
function adminOpenApprovePaymentSheet() {
  // TODO: open approve/review sheet when implemented
}
function adminQuickApprovePayment(btn) {
  const card = btn && btn.closest && btn.closest('.admin-approval-card');
  if (card) card.remove();
}
function adminQuickRejectPayment(btn) {
  const card = btn && btn.closest && btn.closest('.admin-approval-card');
  if (card) card.remove();
}

// ─── Admin Visitors ───────────────────────────────────
function adminVisitSetTab(el) {
  if (!el || !el.classList) return;
  const wrap = document.getElementById('adminVisitTabs');
  if (wrap) wrap.querySelectorAll('.admin-visit-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const filter = el.getAttribute('data-filter') || 'all';
  const onsiteSection = document.getElementById('adminVisitOnsiteSection');
  const fullLogSection = document.getElementById('adminVisitFullLogSection');
  const logTable = document.querySelector('#admin-screen-visitors .admin-visit-log-table');
  if (onsiteSection) {
    onsiteSection.classList.toggle('admin-visit-filter-hidden', filter === 'out' || filter === 'week');
  }
  if (fullLogSection) {
    fullLogSection.classList.toggle('admin-visit-filter-hidden', filter === 'onsite');
  }
  if (logTable) {
    logTable.querySelectorAll('.admin-visit-log-row').forEach(row => {
      const isOnsite = row.classList.contains('admin-visit-log-onsite');
      const isLeft = row.classList.contains('admin-visit-log-left');
      let show = true;
      if (filter === 'onsite') show = isOnsite;
      else if (filter === 'out') show = isLeft;
      else if (filter === 'week') show = true;
      row.classList.toggle('admin-visit-filter-hidden', !show);
    });
  }
}

function adminOpenVisitorSheet(hostName, hostInitials, unit, phone, checkin, checkout, plate, onsite) {
  const titleEl = document.getElementById('adminVisitorSheetTitle');
  const avatarEl = document.getElementById('adminVisitorSheetAvatar');
  const nameEl = document.getElementById('adminVisitorSheetName');
  const phoneEl = document.getElementById('adminVisitorSheetPhone');
  const unitEl = document.getElementById('adminVisitorSheetUnit');
  const inEl = document.getElementById('adminVisitorSheetIn');
  const outEl = document.getElementById('adminVisitorSheetOut');
  const plateEl = document.getElementById('adminVisitorSheetPlate');
  const unitTagEl = document.getElementById('adminVisitorSheetUnitTag');
  const statusTagEl = document.getElementById('adminVisitorSheetStatusTag');
  const outBtnEl = document.getElementById('adminVisitorSheetOutBtn');
  if (titleEl) titleEl.textContent = 'Visit to ' + hostName;
  if (avatarEl) avatarEl.textContent = hostInitials;
  if (nameEl) nameEl.textContent = hostName;
  if (phoneEl) phoneEl.textContent = phone || '—';
  if (unitEl) unitEl.textContent = unit;
  if (inEl) inEl.textContent = checkin;
  if (outEl) outEl.textContent = checkout;
  if (plateEl) plateEl.textContent = plate;
  if (unitTagEl) unitTagEl.textContent = unit;
  if (statusTagEl) {
    statusTagEl.className = 'admin-visitor-sheet-tag ' + (onsite ? 'admin-visitor-sheet-tag-green' : '');
    statusTagEl.textContent = onsite ? 'On site' : 'Checked out';
  }
  if (outBtnEl) outBtnEl.style.display = onsite ? 'flex' : 'none';
  const bg = document.getElementById('adminVisitorSheetBg');
  if (bg) bg.classList.add('open');
}

function adminCloseVisitorSheet() {
  const bg = document.getElementById('adminVisitorSheetBg');
  if (bg) bg.classList.remove('open');
}

// ─── Resident ──────────────────────────────────────────
let RESIDENT_UNIT = 'A-12';
let RESIDENT_COMMUNITY = '';

const residentPageSubs = {
  home: 'Monday, 2 March 2026',
  payments: 'Personal payment history',
  qr: 'Pre-register guests & track entry',
  notices: 'Official announcements & community notices',
};

function setResidentUnit(unit) {
  RESIDENT_UNIT = unit;
  const qrUnitBadge = document.getElementById('residentQrUnitBadge');
  if (qrUnitBadge) {
    const estateLabel = RESIDENT_COMMUNITY ? (RESIDENT_COMMUNITY + ' estate') : 'Your estate';
    qrUnitBadge.textContent = 'Unit ' + unit + ' · ' + estateLabel;
  }
  const qrPhSub = document.getElementById('residentQrPhSub');
  if (qrPhSub) qrPhSub.textContent = 'House ' + unit + ' · Today';
  const userUnit = document.getElementById('residentUserUnit');
  if (userUnit) userUnit.textContent = 'Unit ' + unit;
  const greetingSub = document.getElementById('residentGreetingSub');
  if (greetingSub) greetingSub.textContent = (residentPageSubs.home || '') + ' · House ' + unit;
  const avatar = document.getElementById('residentAvatar');
  if (avatar) avatar.textContent = 'AN';
  drawQRPlaceholder(unit);
  updateQrExpiryLabel();
  renderResidentVisitors();
  renderResidentPayments();
  renderResidentHomePaymentCard();
}

function setResidentEstateName() {
  const el = document.getElementById('residentEstateName');
  if (el) {
    el.textContent = RESIDENT_COMMUNITY ? (RESIDENT_COMMUNITY + ' estate') : 'Your estate';
  }
}

function residentNav(tab) {
  document.querySelectorAll('#residentMain .screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.resident-nav-item, .resident-bottom-nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('resident-' + tab);
  const navBtn = document.querySelector('.resident-nav-item[data-tab="' + tab + '"]') || document.querySelector('.resident-bottom-nav-item[data-tab="' + tab + '"]');
  if (screen) screen.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  const titles = { home: 'Home', payments: 'My Payments', qr: 'My Visitors', notices: 'Notice Board', community: 'Community', incidents: 'Incidents', profile: 'My account' };
  if (tab === 'incidents') renderResidentIncidents();
  const subEl = document.getElementById('residentGreetingSub');
  if (subEl && tab === 'home')
    subEl.textContent = (residentPageSubs.home || '') + ' · House ' + (RESIDENT_UNIT || 'A-12');
  toggleResidentSidebar(false);
  updateResidentEmergencyStrip();
  if (tab === 'qr') {
    const qrPhSub = document.getElementById('residentQrPhSub');
    if (qrPhSub) qrPhSub.textContent = 'House ' + (RESIDENT_UNIT || 'A-12') + ' · Today';
    const qrUnitBadge = document.getElementById('residentQrUnitBadge');
    if (qrUnitBadge) {
      const estateLabel = RESIDENT_COMMUNITY ? (RESIDENT_COMMUNITY + ' estate') : 'Your estate';
      qrUnitBadge.textContent = 'Unit ' + (RESIDENT_UNIT || 'A-12') + ' · ' + estateLabel;
    }
    renderResidentVisitors();
    clearResidentNotificationDot();
  }
  if (tab === 'payments') renderResidentPayments();
  if (tab === 'community') {
    const noticePhSub = document.getElementById('noticePhSub');
    if (noticePhSub) {
      const estateLabel = RESIDENT_COMMUNITY ? (RESIDENT_COMMUNITY + ' estate') : 'Your estate';
      noticePhSub.textContent = estateLabel + ' · March 2026';
    }
    renderResidentNotices();
    renderChatList(false);
  }
  if (tab === 'home') {
    updateResidentGreeting();
    setResidentEstateName();
    renderResidentHomePaymentCard();
    renderResidentAtAGlance();
  }
  if (tab === 'profile') loadProfileIntoForm();
}

function loadProfileIntoForm() {
  const nameEl = document.getElementById('profileNameInput');
  const unitEl = document.getElementById('profileUnitInput');
  const phoneEl = document.getElementById('profilePhoneInput');
  const emailEl = document.getElementById('profileEmailInput');
  const nameDisplay = document.getElementById('profileName');
  const unitDisplay = document.getElementById('profileUnit');
  const avatarEl = document.getElementById('profileAvatar');
  if (nameEl) nameEl.value = (nameDisplay && nameDisplay.textContent) || 'Amina N.';
  if (unitEl) unitEl.value = RESIDENT_UNIT || 'A-12';
  if (phoneEl) phoneEl.value = phoneEl.value || '+250 788 123 456';
  if (emailEl) emailEl.value = emailEl.value || 'amina@example.com';
}

function saveProfile() {
  const nameEl = document.getElementById('profileNameInput');
  const unitEl = document.getElementById('profileUnitInput');
  const phoneEl = document.getElementById('profilePhoneInput');
  const emailEl = document.getElementById('profileEmailInput');
  const name = nameEl ? nameEl.value.trim() : '';
  const unit = unitEl ? unitEl.value.trim() : '';
  if (unit) {
    RESIDENT_UNIT = unit;
    setResidentUnit(unit);
  }
  const nameDisplay = document.getElementById('profileName');
  const unitDisplay = document.getElementById('profileUnit');
  const avatarEl = document.getElementById('profileAvatar');
  if (nameDisplay && name) nameDisplay.textContent = name;
  if (unitDisplay && unit) unitDisplay.textContent = 'Unit ' + unit;
  const sidebarName = document.getElementById('residentUserName');
  const sidebarUnit = document.getElementById('residentUserUnit');
  if (sidebarName) sidebarName.textContent = name || 'Amina N.';
  if (sidebarUnit) sidebarUnit.textContent = 'Unit ' + (unit || RESIDENT_UNIT || 'A-12');
  if (avatarEl) avatarEl.textContent = name ? name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AN';
  const mainAvatar = document.getElementById('residentAvatar');
  if (mainAvatar) mainAvatar.textContent = avatarEl ? avatarEl.textContent : 'AN';
  toast('Profile updated.', 'success');
}

function openSignoutSheet() {
  const sheet = document.getElementById('signoutSheetBg');
  if (!sheet) return;
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => sheet.classList.add('open'));
}

function closeSignoutSheet() {
  const sheet = document.getElementById('signoutSheetBg');
  if (!sheet) return;
  sheet.classList.remove('open');
  setTimeout(() => sheet.classList.add('hidden'), 280);
}

function confirmSignout() {
  closeSignoutSheet();
  showView('welcome');
}

function toggleResidentSidebar(open) {
  const sidebar = document.getElementById('residentSidebar');
  const backdrop = document.getElementById('residentSidebarBackdrop');
  if (sidebar && backdrop) {
    const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', isOpen);
    backdrop.classList.toggle('hidden', !isOpen);
  }
}

function drawQRPlaceholder(unit) {
  const el = document.getElementById('residentQRCode');
  if (!el) return;
  // Simple QR-like grid (placeholder; real app would use a QR library or API)
  const size = 200;
  const cell = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  const cols = Math.floor(size / cell);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      if ((i + j) % 3 === 0 || (i * 7 + j) % 11 === 0) ctx.fillRect(i * cell, j * cell, cell, cell);
    }
  }
  // Finder patterns (corners)
  [[0,0],[cols-7,0],[0,cols-7]].forEach(([ox, oy]) => {
    ctx.fillRect(ox*cell, oy*cell, 7*cell, 7*cell);
    ctx.fillStyle = '#fff';
    ctx.fillRect((ox+1)*cell, (oy+1)*cell, 5*cell, 5*cell);
    ctx.fillStyle = '#000';
    ctx.fillRect((ox+2)*cell, (oy+2)*cell, 3*cell, 3*cell);
  });
  el.innerHTML = '';
  el.appendChild(canvas);
}

function updateQrExpiryLabel() {
  const el = document.getElementById('residentQrExpiryDate');
  if (!el) return;
  const d = new Date();
  d.setDate(d.getDate() + 7);
  el.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function generateGuestQR() {
  drawQRPlaceholder(RESIDENT_UNIT || 'A-12');
  updateQrExpiryLabel();
  toast('New guest QR generated for ' + (RESIDENT_UNIT || 'your unit') + '.', 'success');
}

function shareGuestLink() {
  const unit = RESIDENT_UNIT || 'A-12';
  const shareText = 'Wellage guest QR for unit ' + unit + '. Show this code at the gate.';
  const shareUrl = window.location.href.split('#')[0] + '#guest-' + encodeURIComponent(unit);
  if (navigator.share) {
    navigator
      .share({ title: 'Wellage guest QR', text: shareText, url: shareUrl })
      .catch(() => {/* user closed share */});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast('Guest QR link copied. Share it with your visitor.', 'success');
    }).catch(() => {
      toast('Unable to copy link, but QR is ready to scan.', 'info');
    });
  } else {
    toast('Your guest can scan the QR on this screen at the gate.', 'info');
  }
}

// Resident payment history per service: period, amount, datePaid, status (pending|paid|overdue|partial)
const residentPaymentsByService = {
  security: [
    { period: 'March 2026', amount: 'RWF 15,000', datePaid: '—', status: 'overdue', note: 'Due Mar 10, 2026' },
    { period: 'February 2026', amount: 'RWF 15,000', datePaid: '1 Feb 2026', status: 'paid', note: 'Paid on time' },
    { period: 'January 2026', amount: 'RWF 15,000', datePaid: '2 Jan 2026', status: 'paid', note: 'Paid on time' },
  ],
  cleaning: [
    { period: 'March 2026', amount: 'RWF 15,000', datePaid: '—', status: 'pending', note: 'Due Mar 10, 2026' },
    { period: 'February 2026', amount: 'RWF 15,000', datePaid: '1 Feb 2026', status: 'paid', note: 'Paid on time' },
    { period: 'January 2026', amount: 'RWF 15,000', datePaid: '2 Jan 2026', status: 'paid', note: 'Paid on time' },
  ],
  waste: [
    { period: 'March 2026', amount: 'RWF 10,000', datePaid: '1 Mar 2026', status: 'paid', note: 'Paid on time' },
    { period: 'February 2026', amount: 'RWF 10,000', datePaid: '1 Feb 2026', status: 'paid', note: 'Paid on time' },
    { period: 'January 2026', amount: 'RWF 10,000', datePaid: '2 Jan 2026', status: 'paid', note: 'Paid on time' },
  ],
  pool: [
    { period: 'March 2026', amount: 'RWF 8,000', datePaid: '—', status: 'paid', note: 'Paid on time' },
    { period: 'February 2026', amount: 'RWF 8,000', datePaid: '1 Feb 2026', status: 'paid', note: 'Paid on time' },
  ],
};

let activePaymentTab = 'all';

function parseAmountStr(s) {
  if (typeof s === 'number') return s;
  const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// Flat list of all payments for the new payments UI
function getResidentPaymentsFlat() {
  const flat = [];
  let id = 1;
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  Object.keys(residentPaymentsByService).forEach((service) => {
    (residentPaymentsByService[service] || []).forEach((p) => {
      flat.push({
        id: id++,
        service,
        period: p.period,
        amount: p.amount,
        amountNum: parseAmountStr(p.amount),
        datePaid: p.datePaid || null,
        status: p.status || 'pending',
        note: p.note || (p.status === 'paid' ? 'Paid ' + (p.datePaid || '') : 'Not yet paid'),
      });
    });
  });
  flat.sort((a, b) => {
    const [aM, aY] = a.period.split(' ');
    const [bM, bY] = b.period.split(' ');
    const aIdx = monthOrder.indexOf(aM) + (parseInt(aY, 10) * 12);
    const bIdx = monthOrder.indexOf(bM) + (parseInt(bY, 10) * 12);
    return bIdx - aIdx;
  });
  return flat;
}

// Payable = overdue or pending (or partial) — for total outstanding
function getPayablePayments() {
  const flat = getResidentPaymentsFlat();
  return flat.filter((p) => p.status === 'overdue' || p.status === 'pending' || p.status === 'partial');
}

// All payments across services, for home card summary (pending + overdue)
function getOutstandingPayments() {
  const out = [];
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  Object.keys(residentPaymentsByService).forEach((service) => {
    (residentPaymentsByService[service] || []).forEach((p) => {
      if (p.status === 'pending' || p.status === 'overdue') out.push({ ...p, service });
    });
  });
  out.sort((a, b) => {
    const [aM, aY] = a.period.split(' ');
    const [bM, bY] = b.period.split(' ');
    const aIdx = monthOrder.indexOf(aM) + (parseInt(aY, 10) * 12);
    const bIdx = monthOrder.indexOf(bM) + (parseInt(bY, 10) * 12);
    return bIdx - aIdx;
  });
  return out;
}

function getNextDueDateWhenNoDebt() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderResidentHomePaymentCard() {
  const textEl = document.getElementById('residentPaymentCardText');
  const wrapEl = document.getElementById('residentHomePaymentCard');
  const titleEl = document.getElementById('residentPaymentAlertTitle');
  if (!textEl || !wrapEl) return;
  const outstanding = getOutstandingPayments();
  if (outstanding.length > 0) {
    const periods = outstanding.map((o) => o.period);
    const uniquePeriods = [...new Set(periods)];
    const msg = uniquePeriods.length === 1
      ? uniquePeriods[0] + ' is unpaid.'
      : uniquePeriods.length === 2
        ? uniquePeriods[0] + ' and ' + uniquePeriods[1] + ' are unpaid.'
        : uniquePeriods.slice(0, -1).join(', ') + ' and ' + uniquePeriods[uniquePeriods.length - 1] + ' are unpaid.';
    textEl.textContent = msg;
    wrapEl.classList.remove('up-to-date', 'warning', 'hidden');
    wrapEl.classList.add('danger');
    if (titleEl) titleEl.textContent = uniquePeriods.length + ' month' + (uniquePeriods.length > 1 ? 's' : '') + ' overdue';
  } else {
    wrapEl.classList.add('hidden');
    wrapEl.classList.remove('danger', 'warning', 'up-to-date');
  }
}

function renderResidentAtAGlance() {
  const nextDueEl = document.getElementById('residentNextDueValue');
  const servicesEl = document.getElementById('residentNextDueServices');
  if (!nextDueEl) return;
  const outstanding = getOutstandingPayments();
  if (outstanding.length > 0) {
    nextDueEl.textContent = outstanding[0].period;
    nextDueEl.classList.remove('overdue');
    if (servicesEl) {
      const label = (s) => PAYMENT_SVC_LABELS[s] || s;
      const amt = (a) => (typeof a === 'string' && a.startsWith('RWF ') ? a.slice(4) : a);
      servicesEl.innerHTML = outstanding.map((o) =>
        '<span class="home-due-service-item">' + escapeHtml(label(o.service)) + ' · ' + escapeHtml(amt(o.amount)) + '</span>'
      ).join('');
      servicesEl.classList.remove('hidden');
    }
  } else {
    nextDueEl.textContent = getNextDueDateWhenNoDebt();
    nextDueEl.classList.remove('overdue');
    if (servicesEl) {
      servicesEl.innerHTML = '';
      servicesEl.classList.add('hidden');
    }
  }
  renderResidentHomeVisitors();
}

function renderResidentHomeVisitors() {
  const container = document.getElementById('residentHomeVisitorsList');
  if (!container) return;
  const unit = (RESIDENT_UNIT || 'A-12').toLowerCase();
  const myVisitors = logbook.filter((e) => (e.host || '').toLowerCase() === unit);
  const recent = myVisitors.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<p class="home-visitors-empty">No visitors yet</p>';
    return;
  }
  container.innerHTML = recent.map((v) => {
    const surname = getSurname(v.name);
    const dateTime = (v.date || '') + (v.date && v.checkIn ? ', ' : '') + (v.checkIn || '');
    return '<div class="home-visitor-item"><span class="home-visitor-name">' + surname + '</span><span class="home-visitor-dt">' + (dateTime || '—') + '</span></div>';
  }).join('');
}

function renderResidentPayMonths() {
  const container = document.getElementById('residentPayMonths');
  if (!container) return;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const monthOrder = ['January', 'February', 'March', 'April', 'May'];
  const outstanding = getOutstandingPayments();
  const unpaidPeriods = new Set(outstanding.map((o) => o.period));
  const paidPeriods = new Set();
  Object.keys(residentPaymentsByService).forEach((service) => {
    (residentPaymentsByService[service] || []).forEach((p) => {
      if (p.status === 'paid') paidPeriods.add(p.period);
    });
  });
  let html = '';
  months.forEach((name, i) => {
    const periodName = monthOrder[i] + ' 2026';
    const isUnpaid = unpaidPeriods.has(periodName);
    const isPaid = paidPeriods.has(periodName) && !isUnpaid;
    const cls = isPaid ? 'paid' : isUnpaid ? 'unpaid' : 'upcoming';
    const sym = isPaid ? '✓' : isUnpaid ? '✗' : '—';
    html += '<div class="pay-month ' + cls + '"><span class="pay-month-name">' + name + '</span>' + sym + '</div>';
  });
  container.innerHTML = html;
}

const PAYMENT_SVC_LABELS = { security: 'Security', cleaning: 'Cleaning', waste: 'Waste', pool: 'Pool maintenance' };
const PAYMENT_ICONS = {
  paid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  pending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  overdue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  partial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 10"/></svg>',
};

function switchPaymentTab(btn) {
  activePaymentTab = btn.dataset.tab || 'all';
  document.querySelectorAll('#residentPayTabs .pay-tab').forEach((t) => t.classList.remove('active'));
  btn.classList.add('active');
  renderResidentPayments();
}

function renderResidentPayments() {
  const subEl = document.getElementById('residentPayPhSub');
  const amountEl = document.getElementById('residentPaySummaryAmount');
  const badgesEl = document.getElementById('residentPaySummaryBadges');
  const payNowWrap = document.getElementById('residentPayNowWrap');
  const payNowLabel = document.getElementById('residentPayNowLabel');
  const list = document.getElementById('residentPaymentsList');
  if (subEl) subEl.textContent = 'House ' + (RESIDENT_UNIT || 'A-12') + ' · March 2026';

  const flat = getResidentPaymentsFlat();
  const payable = getPayablePayments();
  const totalOut = payable.reduce((sum, p) => sum + (p.amountNum || 0), 0);

  if (amountEl) amountEl.innerHTML = '<span>RWF</span>' + totalOut.toLocaleString();
  const overdueCount = flat.filter((p) => p.status === 'overdue').length;
  const pendingCount = flat.filter((p) => p.status === 'pending').length;
  const paidCount = flat.filter((p) => p.status === 'paid').length;
  const partialCount = flat.filter((p) => p.status === 'partial').length;
  if (badgesEl) {
    let badgesHtml = '';
    if (overdueCount) badgesHtml += '<span class="pay-sbadge ov">' + PAYMENT_ICONS.overdue + overdueCount + ' overdue</span>';
    if (pendingCount) badgesHtml += '<span class="pay-sbadge pd">' + PAYMENT_ICONS.pending + pendingCount + ' pending</span>';
    if (partialCount) badgesHtml += '<span class="pay-sbadge pd">' + PAYMENT_ICONS.partial + partialCount + ' partial</span>';
    badgesHtml += '<span class="pay-sbadge ok">' + PAYMENT_ICONS.paid + paidCount + ' paid</span>';
    badgesEl.innerHTML = badgesHtml;
  }
  if (payNowWrap) payNowWrap.style.display = totalOut > 0 ? '' : 'none';
  if (payNowLabel) payNowLabel.textContent = 'Pay all due — RWF ' + totalOut.toLocaleString();

  // Tab badges (overdue count per service)
  ['security', 'cleaning', 'waste', 'pool'].forEach((svc) => {
    const badge = document.getElementById('payTabBadge' + (svc.charAt(0).toUpperCase() + svc.slice(1)));
    if (badge) {
      const n = flat.filter((p) => p.service === svc && (p.status === 'overdue' || p.status === 'pending')).length;
      badge.textContent = n;
      badge.classList.toggle('hidden', n === 0);
        }
  });

  const filtered = activePaymentTab === 'all' ? flat : flat.filter((p) => p.service === activePaymentTab);
  const byPeriod = {};
  filtered.forEach((p) => {
    if (!byPeriod[p.period]) byPeriod[p.period] = [];
    byPeriod[p.period].push(p);
  });
  const periodOrder = ['March 2026', 'February 2026', 'January 2026', 'April 2026', 'May 2026'];
  const sortedPeriods = Object.keys(byPeriod).sort((a, b) => periodOrder.indexOf(a) - periodOrder.indexOf(b));
  let listHtml = '';
  sortedPeriods.forEach((period) => {
    listHtml += '<div class="pay-mgroup"><p class="pay-mlbl">' + escapeHtml(period) + '</p>';
    byPeriod[period].forEach((p) => {
      const canPay = p.status === 'overdue' || p.status === 'pending' || p.status === 'partial';
      const meta = p.status === 'paid' ? (p.datePaid ? 'Paid ' + p.datePaid : 'Paid') : (p.note || '—');
      const stLabel = p.status.charAt(0).toUpperCase() + p.status.slice(1);
      listHtml += '<div class="pay-prow ' + p.status + '">';
      listHtml += '<div class="pay-prow-ic ' + p.status + '">' + (PAYMENT_ICONS[p.status] || PAYMENT_ICONS.pending) + '</div>';
      listHtml += '<div class="pay-prow-c"><p class="pay-prow-period">' + escapeHtml(PAYMENT_SVC_LABELS[p.service] || p.service) + '</p><p class="pay-prow-meta">' + escapeHtml(meta) + '</p></div>';
      listHtml += '<div class="pay-prow-r"><span class="pay-prow-amt">' + escapeHtml(p.amount) + '</span>';
      listHtml += canPay ? '<button type="button" class="pay-prb" onclick="openPaymentSheet(\'' + String(p.service).replace(/'/g, "\\'") + '\', \'' + String(p.period).replace(/'/g, "\\'") + '\')">Pay now</button>' : '<span class="pay-stbadge ' + p.status + '">' + escapeHtml(stLabel) + '</span>';
      listHtml += '</div></div>';
    });
    listHtml += '</div>';
  });
  if (!listHtml) listHtml = '<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:24px">No payments for this service yet.</p>';
  if (list) list.innerHTML = listHtml;
}

let paymentSheetScope = null; // null = pay all; { service, period } = pay single item
function openPaymentSheet(service, period) {
  let payable = getPayablePayments();
  if (service != null && period != null) {
    paymentSheetScope = { service, period };
    payable = payable.filter((p) => p.service === service && p.period === period);
  } else {
    paymentSheetScope = null;
  }
  if (payable.length === 0) return;
  const total = payable.reduce((sum, p) => sum + (p.amountNum || 0), 0);
  const subEl = document.getElementById('paymentSheetSub');
  const breakdownEl = document.getElementById('paymentSheetBreakdown');
  const totalEl = document.getElementById('paymentSheetTotal');
  if (subEl) subEl.textContent = 'House ' + (RESIDENT_UNIT || 'A-12') + (payable.length === 1 ? ' · ' + payable[0].period : ' · March 2026');
  if (totalEl) totalEl.textContent = 'RWF ' + total.toLocaleString();
  let breakdownHtml = '';
  payable.forEach((p) => {
    const isOverdue = p.status === 'overdue';
    breakdownHtml += '<div class="pay-bkrow"><span class="pay-bklbl"><span class="pay-bkdot' + (isOverdue ? '' : ' am') + '"></span>' + escapeHtml(PAYMENT_SVC_LABELS[p.service] || p.service) + ' — ' + escapeHtml(p.period) + (isOverdue ? ' <span style="font-size:10px;color:var(--danger);font-weight:700;margin-left:4px">OVERDUE</span>' : '') + '</span><span class="pay-bkval">' + escapeHtml(p.amount) + '</span></div>';
  });
  if (breakdownEl) breakdownEl.innerHTML = breakdownHtml;
  document.getElementById('paymentSheetStep1').classList.remove('hidden');
  document.getElementById('paymentSheetStep2').classList.add('hidden');
  document.getElementById('paymentSheetBg').classList.remove('hidden');
  document.getElementById('paymentSheetBg').classList.add('open');
}

function closePaymentSheet() {
  document.getElementById('paymentSheetBg').classList.remove('open');
  setTimeout(() => document.getElementById('paymentSheetBg').classList.add('hidden'), 280);
}

function paymentSheetBgClick(e) {
  if (e.target.id === 'paymentSheetBg') closePaymentSheet();
}

let selectedPaymentMethod = 'mtn';
function selectPaymentMethod(cardEl, method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.pay-mc').forEach((c) => c.classList.remove('pay-mc-sel'));
  if (cardEl) cardEl.classList.add('pay-mc-sel');
  const isMomo = method === 'mtn' || method === 'airtel';
  const momoWrap = document.getElementById('paymentMomoWrap');
  const cardWrap = document.getElementById('paymentCardWrap');
  if (momoWrap) { momoWrap.classList.toggle('vis', isMomo); }
  if (cardWrap) { cardWrap.classList.toggle('hidden', method !== 'card'); }
  const inp = document.getElementById('paymentMomoNum');
  if (inp) inp.placeholder = method === 'airtel' ? '73X XXX XXX' : '78X XXX XXX';
}

function formatPaymentCard(inp) {
  const v = inp.value.replace(/\D/g, '').substring(0, 16);
  inp.value = (v.match(/.{1,4}/g) || [v]).join(' ');
}

function confirmPayment() {
  let payable = getPayablePayments();
  if (paymentSheetScope) {
    payable = payable.filter((p) => p.service === paymentSheetScope.service && p.period === paymentSheetScope.period);
  }
  if (payable.length === 0) return;
  const total = payable.reduce((sum, p) => sum + (p.amountNum || 0), 0);
  document.getElementById('paymentSuccessBody').innerHTML = '<strong>RWF ' + total.toLocaleString() + '</strong> sent successfully.<br/>Your balance is updated.';
  document.getElementById('paymentSheetStep1').classList.add('hidden');
  document.getElementById('paymentSheetStep2').classList.remove('hidden');
  payable.forEach((p) => {
    const arr = residentPaymentsByService[p.service] || [];
    const item = arr.find((x) => x.period === p.period);
    if (item) { item.status = 'paid'; item.datePaid = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); item.note = 'Awaiting confirmation'; }
  });
  renderResidentPayments();
  renderResidentHomePaymentCard();
  renderResidentAtAGlance();
  const stillDue = getPayablePayments();
  document.getElementById('residentPayNowWrap').style.display = stillDue.length > 0 ? '' : 'none';
}

function openUploadProof() {
  document.getElementById('modal-upload').classList.remove('hidden');
}

function submitProof() {
  closeModal('modal-upload');
  toast('Payment proof submitted. We\'ll confirm shortly.', 'success');
}

// ─── Security ──────────────────────────────────────────
function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function formatDateLabel(dateKey) {
  const d = new Date(dateKey + 'T12:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return day + ' ' + month + ' ' + year;
}
const todayKey = () => formatDateKey(new Date());
const yesterdayKey = () => formatDateKey(new Date(Date.now() - 86400000));

// Demo visitor log: name, plate, host, checkIn, checkOut, status, date (display), dateKey (YYYY-MM-DD)
// Initial list uses dynamic today/yesterday so "Today" and "Yesterday" labels are correct on load
function getInitialLogbook() {
  const today = formatDateKey(new Date());
  const yesterday = formatDateKey(new Date(Date.now() - 86400000));
  return [
    { name: 'Marie Uwera', phone: '+250 788 123 456', plate: 'RAB 123A', host: 'A-12', checkIn: '10:45', checkOut: null, status: 'onsite', date: formatDateLabel(today), dateKey: today },
    { name: 'Jean Claude Niyonzima', phone: '+250 078 456 789', plate: 'RAC 456B', host: 'A-12', checkIn: '09:15', checkOut: '10:30', status: 'left', date: formatDateLabel(today), dateKey: today },
    { name: 'Grace Murekatete', phone: '+250 789 321 012', plate: 'RAD 789C', host: 'A-12', checkIn: '08:00', checkOut: '08:45', status: 'left', date: formatDateLabel(yesterday), dateKey: yesterday },
    { name: 'Eric Kamana', phone: '+250 722 555 888', plate: '', host: 'A-12', checkIn: '14:00', checkOut: '16:30', status: 'left', date: formatDateLabel(yesterday), dateKey: yesterday },
    { name: 'David Habimana', phone: '+250 783 100 200', plate: '—', host: 'A-12', checkIn: '14:20', checkOut: null, status: 'onsite', date: formatDateLabel(today), dateKey: today },
    { name: 'Sarah Mukiza', phone: '+250 788 999 000', plate: 'RAE 012D', host: 'B-04', checkIn: '11:00', checkOut: '12:15', status: 'left', date: formatDateLabel(today), dateKey: today },
  ];
}
let logbook = getInitialLogbook();

function submitCheckin() {
  const name = document.getElementById('visitorName').value.trim();
  const plate = document.getElementById('visitorPlate').value.trim();
  const host = document.getElementById('visitorHost').value.trim();
  if (!name || !host) {
    toast('Visitor name and host unit are required.', 'error');
    return;
  }
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  logbook.unshift({
    name,
    plate: plate || '—',
    host,
    checkIn: timeStr,
    checkOut: null,
    status: 'onsite',
    date: dateStr,
    dateKey: formatDateKey(now),
  });
  document.getElementById('visitorName').value = '';
  document.getElementById('visitorPlate').value = '';
  document.getElementById('visitorHost').value = '';
  const purposeEl = document.getElementById('visitorPurpose');
  if (purposeEl) purposeEl.value = '';
  closeSecurityManualSheet();
  renderLogbook();
  handleResidentVisitorNotification(host, name);
  toast(name + ' checked in — ' + host, 'success');
}

function renderLogbook() {
  const list = document.getElementById('securityLogbook');
  if (!list) return;
  const today = todayKey();
  const todayEntries = logbook.filter(function (e) { return (e.dateKey || today) === today; });
  const inside = todayEntries.filter(function (e) { return e.status === 'onsite'; }).length;
  const exited = todayEntries.filter(function (e) { return e.status === 'left'; }).length;

  const tEl = document.getElementById('securityVisitorsToday');
  const iEl = document.getElementById('securityVisitorsInside');
  const eEl = document.getElementById('securityVisitorsExited');
  if (tEl) tEl.textContent = todayEntries.length;
  if (iEl) iEl.textContent = inside;
  if (eEl) eEl.textContent = exited;

  if (todayEntries.length === 0) {
    list.innerHTML = '<p class="text-muted" style="text-align:center;padding:24px;">No visitors today yet.</p>';
    return;
  }

  var html = '';
  todayEntries.forEach(function (e, i) {
    var idx = logbook.indexOf(e);
    var timeText = e.checkOut ? 'In ' + e.checkIn + ' · Out ' + e.checkOut : 'In ' + e.checkIn;
    var statusClass = e.status === 'onsite' ? 'onsite' : 'left';
    var statusLabel = e.status === 'onsite' ? 'On site' : 'Left';
    var plateDisplay = (e.plate && e.plate !== '—') ? escapeHtml(e.plate) : '—';
    var hostDisplay = (e.host && e.host !== '—') ? ('Unit ' + escapeHtml(e.host)) : '—';
    html += '<div class="security-v-card">';
    html += '<div class="security-v-card-main">';
    html += '<div class="security-v-card-body">';
    html += '<p class="security-v-card-name">' + escapeHtml(e.name) + '</p>';
    html += '<div class="security-v-card-plate">' + plateDisplay + '</div>';
    html += '<p class="security-v-card-unit">' + hostDisplay + '</p>';
    html += '</div>';
    html += '<div class="security-v-card-right">';
    html += '<div class="security-v-card-times"><span>In</span> ' + escapeHtml(e.checkIn) + (e.checkOut ? ' · <span>Out</span> ' + escapeHtml(e.checkOut) : '') + '</div>';
    html += '<span class="security-v-status ' + statusClass + '">' + (e.status === 'onsite' ? '<span class="security-v-dot"></span>' : '') + statusLabel + '</span>';
    html += '</div></div>';
    if (e.status === 'onsite') {
      html += '<div class="security-v-exit-row"><button type="button" class="security-v-exit-btn" onclick="checkoutVisitor(' + idx + ')">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Mark exit</button></div>';
    }
    html += '</div>';
  });
  list.innerHTML = html;
}

function getSurname(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || '—';
}

const VISITOR_AVATAR_CLASSES = ['av-green', 'av-blue', 'av-amber', 'av-slate'];
const CAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return '—';
}

function renderResidentVisitors() {
  const list = document.getElementById('residentVisitorsList');
  const countEl = document.getElementById('residentVisitorsCount');
  if (!list) return;
  const unit = (RESIDENT_UNIT || 'A-12').toLowerCase();
  const today = todayKey();
  const yesterday = yesterdayKey();
  const visitors = logbook
    .filter((e) => (e.host || '').toLowerCase() === unit)
    .map((e) => ({ ...e, dateKey: e.dateKey || today }));

  const todayCount = visitors.filter((e) => e.dateKey === today).length;
  if (countEl) countEl.textContent = todayCount + ' today';

  if (!visitors.length) {
    list.innerHTML = '<div class="resident-visitors-list-empty">No visitors yet.</div>';
    return;
  }

  const byDate = {};
  visitors.forEach((e) => {
    const k = e.dateKey || today;
    if (!byDate[k]) byDate[k] = [];
    byDate[k].push(e);
  });
  const sortedKeys = Object.keys(byDate).sort().reverse();

  let html = '';
  sortedKeys.forEach((dateKey) => {
    let dateLabel = formatDateLabel(dateKey);
    if (dateKey === today) dateLabel = 'Today — ' + dateLabel.replace(/^\d+\s+/, '');
    else if (dateKey === yesterday) dateLabel = 'Yesterday — ' + dateLabel.replace(/^\d+\s+/, '');
    html += '<p class="resident-visitors-date-sep">' + escapeHtml(dateLabel) + '</p>';
    byDate[dateKey].forEach((e, i) => {
      const avClass = VISITOR_AVATAR_CLASSES[i % VISITOR_AVATAR_CLASSES.length];
      const initials = getInitials(e.name);
      const hasPlate = e.plate && e.plate !== '—' && e.plate.toLowerCase() !== 'no vehicle';
      const plateHtml = hasPlate
        ? '<span class="resident-visitor-card-plate">' + CAR_ICON + ' ' + escapeHtml(e.plate) + '</span>'
        : '<span class="resident-visitor-card-plate" style="color:var(--text-muted)">No vehicle</span>';
      const phoneText = (e.phone && e.phone.trim()) ? e.phone.trim() : '—';
      const phoneHtml = '<span class="resident-visitor-card-phone">' + PHONE_ICON + ' ' + escapeHtml(phoneText) + '</span>';
      const timeText = e.status === 'onsite'
        ? 'Arrived ' + e.checkIn
        : (e.checkIn + ' – ' + (e.checkOut || ''));
      const statusClass = e.status === 'onsite' ? 'onsite' : 'left';
      const statusLabel = e.status === 'onsite' ? 'On-site' : 'Left';
      html +=
        '<div class="resident-visitor-card">' +
        '<div class="resident-visitor-card-avatar ' + avClass + '">' + escapeHtml(initials) + '</div>' +
        '<div class="resident-visitor-card-content">' +
        '<p class="resident-visitor-card-name">' + escapeHtml(e.name) + '</p>' +
        phoneHtml +
        plateHtml +
        '</div>' +
        '<div class="resident-visitor-card-right">' +
        '<span class="resident-visitor-card-time">' + escapeHtml(timeText) + '</span>' +
        '<span class="resident-visitor-status ' + statusClass + '">' + escapeHtml(statusLabel) + '</span>' +
        '</div></div>';
    });
  });
  list.innerHTML = html;
}

function openInviteSheet() {
  const sheet = document.getElementById('residentInviteSheetBg');
  if (!sheet) return;
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => sheet.classList.add('open'));
  const dateInp = document.getElementById('inviteGuestDate');
  if (dateInp && !dateInp.value) {
    const t = new Date();
    dateInp.value = t.toISOString().slice(0, 10);
  }
  const timeInp = document.getElementById('inviteGuestTime');
  if (timeInp && !timeInp.value) timeInp.value = '10:00';
}

function closeInviteSheet() {
  const sheet = document.getElementById('residentInviteSheetBg');
  if (!sheet) return;
  sheet.classList.remove('open');
  setTimeout(() => sheet.classList.add('hidden'), 280);
}

function submitInviteGuest() {
  const name = document.getElementById('inviteGuestName');
  const phoneEl = document.getElementById('inviteGuestPhone');
  const plate = document.getElementById('inviteGuestPlate');
  const dateEl = document.getElementById('inviteGuestDate');
  const timeEl = document.getElementById('inviteGuestTime');
  const n = (name && name.value) ? name.value.trim() : '';
  if (!n) {
    toast('Please enter the guest name.', 'error');
    return;
  }
  const phone = (phoneEl && phoneEl.value) ? phoneEl.value.trim() : '';
  if (!phone) {
    toast('Please enter the guest phone number.', 'error');
    return;
  }
  const when = (dateEl && dateEl.value) ? dateEl.value : '';
  const t = (timeEl && timeEl.value) ? timeEl.value : '10:00';
  closeInviteSheet();
  if (name) name.value = '';
  if (phoneEl) phoneEl.value = '';
  if (plate) plate.value = '';
  toast('Guest pass sent to ' + n + ' (' + phone + ')' + (when ? ' for ' + when + ' at ' + t : '') + '.', 'success');
}

function checkoutVisitor(idx) {
  const entry = logbook[idx];
  if (!entry || entry.status !== 'onsite') return;
  const now = new Date();
  entry.checkOut = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  entry.status = 'left';
  renderLogbook();
  renderResidentVisitors();
}

function handleResidentVisitorNotification(host, name) {
  const unit = (RESIDENT_UNIT || 'A-12').toLowerCase();
  if (!host || host.toLowerCase() !== unit) return;
  renderResidentVisitors();
  const dot = document.getElementById('residentNotifDot');
  if (dot) dot.classList.add('active');
  toast('New visitor: ' + name + ' just checked in for your unit.', 'info');
}

function clearResidentNotificationDot() {
  const dot = document.getElementById('residentNotifDot');
  if (dot) dot.classList.remove('active');
}

function toggleResidentNotifications() {
  const dropdown = document.getElementById('residentNotifPanel');
  const backdrop = document.getElementById('residentNotifBackdrop');
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains('open');
  if (isOpen) {
    closeResidentNotifications();
  } else {
    dropdown.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    clearResidentNotificationDot();
  }
}

function closeResidentNotifications() {
  const dropdown = document.getElementById('residentNotifPanel');
  const backdrop = document.getElementById('residentNotifBackdrop');
  if (dropdown) dropdown.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

// Notices tab: filter tabs and poll vote
// ─── Resident Notices (redesigned) ──────────────────────────────────────────
const RESIDENT_NOTICES = [
  {
    id: 'water', type: 'urgent', pinned: true,
    title: 'Water Maintenance — Friday 7 Mar',
    body: 'Water supply will be interrupted from 8:00 AM to 2:00 PM on Friday due to scheduled pipe maintenance. Please store sufficient water in advance and inform any visitors.',
    fullText: 'The main water supply to the estate will be off on Friday 7 March 2026 from 8:00 AM to 2:00 PM due to scheduled maintenance on the main pipeline.\n\nAll residents are advised to store sufficient water before Friday morning. The estate tank will be partially topped up on Thursday evening.\n\nFor urgent issues during the maintenance window, contact the estate manager at +250 788 000 001.',
    audience: 'All residents', date: 'Mar 2, 2026', poll: null,
  },
  {
    id: 'payment', type: 'general', pinned: false,
    title: 'March Payment Deadline — 10 March',
    body: 'Monthly service fees are due by 10 March 2026. Late payments will incur a 10% penalty. Pay via Mobile Money or upload your receipt in the Payments tab.',
    fullText: 'Monthly service fees for March 2026 are due by 10 March 2026. Payments received after the deadline will incur a 10% late penalty on the unpaid balance.\n\nYou can pay directly through the app via MTN MoMo, Airtel Money, card, or bank transfer. Tap the Payments tab to settle your balance.',
    audience: 'All residents', date: 'Mar 1, 2026', poll: null,
  },
  {
    id: 'gate', type: 'poll', pinned: false,
    title: 'New Gate Opening Hours — Vote Now',
    body: 'Should the main gate extend its operating hours to midnight on weekends? Your vote helps shape community decisions.',
    fullText: 'Should the main gate extend its operating hours to midnight on weekends? Your vote helps shape community decisions. The result will be shared with the estate management.',
    audience: 'All residents', date: 'Feb 28, 2026',
    poll: { voted: null, options: [{ label: 'Yes, extend to midnight', votes: 23 }, { label: 'No, keep current hours', votes: 11 }] },
  },
  {
    id: 'meeting', type: 'info', pinned: false,
    title: 'Community Meeting — 15 March',
    body: 'Quarterly community meeting on Saturday 15 March at 10:00 AM in the community hall. Agenda: security review and landscaping proposal.',
    fullText: 'Quarterly community meeting on Saturday 15 March at 10:00 AM in the community hall.\n\nAgenda: security review, landscaping proposal, and estate updates. Attendance is encouraged for all residents.',
    audience: 'All residents', date: 'Feb 26, 2026', poll: null,
  },
];

const RN_COLORS = { urgent: '#DC2626', general: '#1A9E6B', poll: '#D97706', info: '#2563EB' };
let rnActiveFilter = '';

function renderResidentNotices() {
  const list = document.getElementById('residentNoticeList');
  if (!list) return;
  const rows = RESIDENT_NOTICES
    .filter(n => !rnActiveFilter || n.type === rnActiveFilter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (!rows.length) {
    list.innerHTML = `<div class="rn-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p>No notices</p><span>Check back later</span></div>`;
    return;
  }

  const pinned = rows.filter(n => n.pinned);
  const rest = rows.filter(n => !n.pinned);
  let html = '';
  if (pinned.length) html += `<p class="rn-section-lbl">Pinned</p>` + pinned.map(rnCardHTML).join('');
  if (rest.length) {
    if (pinned.length) html += `<p class="rn-section-lbl">Recent</p>`;
    html += rest.map(rnCardHTML).join('');
  }
  list.innerHTML = html;
}

function rnCardHTML(n) {
  const color = RN_COLORS[n.type] || '#64748b';
  const total = n.poll ? n.poll.options.reduce((s, o) => s + o.votes, 0) : 0;
  const pinBadge = n.pinned
    ? `<span class="rn-pin-badge-card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="9" height="9"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>Pinned</span>`
    : `<span class="rn-card-date">${n.date}</span>`;
  const pollHTML = n.poll
    ? `<div class="rn-poll-wrap">${n.poll.options.map(o => {
        const pct = total ? Math.round(o.votes / total * 100) : 0;
        return `<div class="rn-poll-opt"><div class="rn-poll-opt-head"><span class="rn-poll-lbl">${o.label}</span><span class="rn-poll-pct">${pct}%</span></div><div class="rn-poll-track"><div class="rn-poll-fill" style="width:${pct}%"></div></div></div>`;
      }).join('')}<div class="rn-poll-votes">${total} votes · tap to vote</div></div>`
    : '';
  return `<div class="rn-card" onclick="openNoticeDetail('${n.id}')">
    <div class="rn-card-bar" style="background:${color}"></div>
    <div class="rn-card-inner">
      <div class="rn-card-top">
        <span class="rn-ntag rn-ntag-${n.type}">${n.type.toUpperCase()}</span>
        ${pinBadge}
      </div>
      <p class="rn-card-title">${n.title}</p>
      <p class="rn-card-body">${n.body}</p>
      ${pollHTML}
    </div>
  </div>`;
}

function switchNoticeFilter(btn) {
  document.querySelectorAll('#rnFilterRow .rn-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  rnActiveFilter = btn.dataset.filter || '';
  renderResidentNotices();
}

// Keep old name so any other references still work
function switchNoticeTab(btn) { switchNoticeFilter(btn); }

// ── Admin Notices ─────────────────────────────────────────────
let anActiveFilter = '';

function renderAdminNotices() {
  const list = document.getElementById('adminNoticeList');
  if (!list) return;

  const rows = RESIDENT_NOTICES
    .filter(n => !anActiveFilter || n.type === anActiveFilter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (!rows.length) {
    list.innerHTML = `<div class="rn-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p>No notices</p><span>Check back later</span></div>`;
    return;
  }

  const pinned = rows.filter(n => n.pinned);
  const rest   = rows.filter(n => !n.pinned);
  let html = '';
  if (pinned.length) html += `<p class="rn-section-lbl">Pinned</p>` + pinned.map(anCardHTML).join('');
  if (rest.length) {
    if (pinned.length) html += `<p class="rn-section-lbl" style="margin-top:4px">Recent</p>`;
    html += rest.map(anCardHTML).join('');
  }
  list.innerHTML = html;
}

function anCardHTML(n) {
  const color = RN_COLORS[n.type] || '#64748b';
  const total = n.poll ? n.poll.options.reduce((s, o) => s + o.votes, 0) : 0;
  const pinBadge = n.pinned
    ? `<span class="rn-pin-badge-card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="9" height="9"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>Pinned</span>`
    : `<span class="rn-card-date">${n.date}</span>`;
  const pollHTML = n.poll
    ? `<div class="rn-poll-wrap">${n.poll.options.map(o => {
        const pct = total ? Math.round(o.votes / total * 100) : 0;
        return `<div class="rn-poll-opt"><div class="rn-poll-opt-head"><span class="rn-poll-lbl">${o.label}</span><span class="rn-poll-pct">${pct}%</span></div><div class="rn-poll-track"><div class="rn-poll-fill" style="width:${pct}%"></div></div></div>`;
      }).join('')}<div class="rn-poll-votes">${total} votes total</div></div>`
    : '';
  return `<div class="rn-card an-card" onclick="openNoticeDetail('${n.id}')">
    <div class="rn-card-bar" style="background:${color}"></div>
    <div class="rn-card-inner">
      <div class="rn-card-top">
        <span class="rn-ntag rn-ntag-${n.type}">${n.type.toUpperCase()}</span>
        ${pinBadge}
      </div>
      <p class="rn-card-title">${n.title}</p>
      <p class="rn-card-body">${n.body}</p>
      ${pollHTML}
      <div class="rn-card-foot">
        <span class="rn-card-aud">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="10" height="10"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${n.audience}
        </span>
        <span class="an-reach-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="9" height="9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          48 reached
        </span>
      </div>
    </div>
  </div>`;
}

function setAdminNoticeFilter(btn) {
  document.querySelectorAll('#anFilterRow .an-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  anActiveFilter = btn.dataset.filter || '';
  renderAdminNotices();
}

function openNoticeDetail(id) {
  const n = RESIDENT_NOTICES.find(x => x.id === id);
  if (!n) return;
  const color = RN_COLORS[n.type] || '#64748b';
  const tagEl = document.getElementById('rnSheetTag');
  const pinEl = document.getElementById('rnSheetPin');
  const titleEl = document.getElementById('rnSheetTitle');
  const dateEl = document.getElementById('rnSheetDate');
  const audEl = document.getElementById('rnSheetAud');
  const textEl = document.getElementById('rnSheetText');
  const pollEl = document.getElementById('rnSheetPoll');

  if (tagEl) { tagEl.textContent = n.type.toUpperCase(); tagEl.className = `rn-ntag rn-ntag-${n.type}`; }
  if (pinEl) pinEl.classList.toggle('hidden', !n.pinned);
  if (titleEl) titleEl.textContent = n.title;
  if (dateEl) dateEl.textContent = n.date;
  if (audEl) audEl.textContent = n.audience;
  if (textEl) textEl.textContent = n.fullText;

  if (pollEl) {
    if (n.poll) {
      const total = n.poll.options.reduce((s, o) => s + o.votes, 0);
      pollEl.innerHTML = `<div class="rn-sheet-poll">
        <p class="rn-sheet-poll-title">Cast your vote</p>
        ${n.poll.options.map((o, i) => {
          const pct = total ? Math.round(o.votes / total * 100) : 0;
          const voted = n.poll.voted === i;
          return `<div class="rn-sheet-poll-opt${voted ? ' voted' : ''}" onclick="rnVote('${id}',${i},this)">
            <div class="rn-sheet-poll-top"><span class="rn-sheet-poll-lbl">${o.label}</span><span class="rn-sheet-poll-pct" style="color:${color}">${pct}%</span></div>
            <div class="rn-sheet-poll-track"><div class="rn-sheet-poll-fill" style="width:${pct}%;background:${color}"></div></div>
          </div>`;
        }).join('')}
        <p class="rn-sheet-poll-footer">${total} votes total</p>
      </div>`;
    } else {
      pollEl.innerHTML = '';
    }
  }

  const sheet = document.getElementById('noticeDetailSheetBg');
  if (!sheet) return;
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => sheet.classList.add('open'));
}

function rnVote(noticeId, optIdx, el) {
  const n = RESIDENT_NOTICES.find(x => x.id === noticeId);
  if (!n || !n.poll) return;
  if (n.poll.voted !== null && n.poll.voted !== optIdx) {
    n.poll.options[n.poll.voted].votes = Math.max(0, n.poll.options[n.poll.voted].votes - 1);
  }
  if (n.poll.voted !== optIdx) n.poll.options[optIdx].votes++;
  n.poll.voted = optIdx;
  openNoticeDetail(noticeId); // re-render sheet with updated counts
  renderResidentNotices();    // update card inline bars
}

function closeNoticeDetail() {
  const sheet = document.getElementById('noticeDetailSheetBg');
  if (!sheet) return;
  sheet.classList.remove('open');
  setTimeout(() => sheet.classList.add('hidden'), 280);
}

function markAllNotificationsRead() {
  document.querySelectorAll('.resident-notif-item.unread').forEach((el) => el.classList.remove('unread'));
  document.querySelectorAll('.resident-notif-unread-dot').forEach((el) => el.remove());
  clearResidentNotificationDot();
  closeResidentNotifications();
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function openScanQR() {
  document.getElementById('modal-scan').classList.remove('hidden');
}

// ─── Modals ─────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  if (id === 'modal-resident-auth') closeCommunityDropdown();
}

document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.add('hidden');
  });
});

// Upload zone click
const uploadZone = document.getElementById('uploadZone');
const receiptFile = document.getElementById('receiptFile');
if (uploadZone && receiptFile) {
  uploadZone.addEventListener('click', () => receiptFile.click());
}

// ─── Toast ─────────────────────────────────────────────
function toast(msg, type) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'success');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3000);
}

// ═══════════════════════════════════════════════════════════════════
//  COMMUNITY CHAT
// ═══════════════════════════════════════════════════════════════════

const CHAT_KEY = 'wellage_chats';
let _currentChatId  = null;
let _currentChatIsAdmin = false;
let _chatOpenedByAdmin  = true;
let _activeCommunityTab = { resident: 'notices', admin: 'notices' };

// ── App users (all residents visible for search/DM) ─────────────
const APP_USERS = [
  { id: 'res-amara', name: 'Amara Ngozi',   unit: 'A-12', initials: 'AN', color: '#16a34a' },
  { id: 'res-kemi',  name: 'Kemi Osei',     unit: 'B-05', initials: 'KO', color: '#7C3AED' },
  { id: 'res-james', name: 'James Mutua',   unit: 'C-08', initials: 'JM', color: '#F97316' },
  { id: 'res-fati',  name: 'Fatima Diallo', unit: 'A-03', initials: 'FD', color: '#0891B2' },
  { id: 'res-david', name: 'David Kariuki', unit: 'D-11', initials: 'DK', color: '#DC2626' },
];

// ── Default seed chats ──────────────────────────────────────────
const SEED_CHATS = [
  {
    id: 'community',
    type: 'group',
    name: 'Community Chat',
    emoji: '🏘️',
    desc: 'Estate-wide group for all residents',
    messages: [
      { id: 1, sender: 'Management', role: 'admin', text: 'Welcome to Wellage Community Chat! Use this space to connect with your neighbours.', time: fmtChatTime(new Date(Date.now() - 86400000 * 2)), date: 'Mar 16' }
    ],
    unread: 1
  },
  {
    id: 'dm-management',
    type: 'dm',
    name: 'Management',
    emoji: '🏢',
    desc: 'Direct line to estate management',
    messages: [],
    unread: 0
  }
];

function fmtChatTime(d) {
  return (d || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function fmtChatDate(d) {
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function loadChats() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    // Merge any missing seed chats
    const storedIds = new Set(stored.map(c => c.id));
    const missing = SEED_CHATS.filter(s => !storedIds.has(s.id));
    if (missing.length) {
      const merged = [...missing, ...stored];
      localStorage.setItem(CHAT_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch (_) { return [...SEED_CHATS]; }
}

function saveChats(chats) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(chats)); } catch (_) {}
}

function getChat(id) {
  return loadChats().find(c => c.id === id) || null;
}

function _totalUnread(chats) {
  return chats.reduce((s, c) => s + (c.unread || 0), 0);
}

// ── Sub-tab switcher ────────────────────────────────────────────
function openCommunityTab(tab, isAdmin) {
  const prefix = isAdmin ? 'admin' : 'resident';
  _activeCommunityTab[isAdmin ? 'admin' : 'resident'] = tab;

  // Update subtab buttons
  const bar = isAdmin
    ? document.querySelector('#admin-screen-community .ch-subtab-bar')
    : document.querySelector('#resident-community .ch-subtab-bar');
  if (bar) bar.querySelectorAll('.ch-subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === tab));

  // Show/hide panels
  if (isAdmin) {
    document.getElementById('adminCommunityNotices')?.classList.toggle('hidden', tab !== 'notices');
    document.getElementById('adminCommunityChat')?.classList.toggle('hidden', tab !== 'chat');
    if (tab === 'notices') renderAdminNotices();
    if (tab === 'chat') renderChatList(true);
  } else {
    document.getElementById('residentCommunityNotices')?.classList.toggle('hidden', tab !== 'notices');
    document.getElementById('residentCommunityChat')?.classList.toggle('hidden', tab !== 'chat');
    if (tab === 'notices') renderResidentNotices();
    if (tab === 'chat') renderChatList(false);
  }
}

// ── Chat list ───────────────────────────────────────────────────
function renderChatList(isAdmin) {
  const listEl = document.getElementById(isAdmin ? 'adminChatList' : 'residentChatList');
  if (!listEl) return;
  const chats = loadChats();

  // Update nav dots
  const total = _totalUnread(chats);
  ['adminChatDot', 'residentChatDot', 'adminChatSubDot', 'residentChatSubDot'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', total === 0);
  });

  let html = '';

  // Resident-only: quick People strip for starting DMs
  if (!isAdmin && APP_USERS.length) {
    html += `<div class="ch-section-lbl">People</div>
    <div class="ch-people-strip">
      ${APP_USERS.map(u => `
        <div class="ch-people-pill" onclick="startDM('${u.id}',false)">
          <div class="ch-user-av" style="background:${u.color}22;color:${u.color}">${u.initials}</div>
          <span class="ch-people-fname">${u.name.split(' ')[0]}</span>
          <span class="ch-people-unit">${u.unit}</span>
        </div>`).join('')}
    </div>
    <div class="ch-section-lbl" style="margin-top:4px">Conversations</div>`;
  }

  if (!chats.length) {
    html += `<div class="ch-list-empty"><p>No conversations yet</p></div>`;
    listEl.innerHTML = html;
    return;
  }

  html += chats.map(chat => {
    const lastMsg = chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
    const preview = lastMsg ? lastMsg.text.slice(0, 55) + (lastMsg.text.length > 55 ? '…' : '') : 'No messages yet';
    const time    = lastMsg ? lastMsg.time : '';
    const unread  = chat.unread || 0;
    const typeTag = chat.type === 'group'
      ? `<span class="ch-type-tag">Group</span>`
      : (chat.type === 'dm' ? `<span class="ch-type-tag ch-tag-dm">DM</span>` : '');
    const avatarHtml = chat.initials
      ? `<div class="ch-conv-avatar ch-initials-av" style="background:${chat.color}22;color:${chat.color}">${chat.initials}</div>`
      : `<div class="ch-conv-avatar">${chat.emoji || '💬'}</div>`;
    return `<div class="ch-conv-card" onclick="openChatThread('${chat.id}',${isAdmin})">
      ${avatarHtml}
      <div class="ch-conv-body">
        <div class="ch-conv-top">
          <span class="ch-conv-name">${chat.name}</span>
          <div style="display:flex;align-items:center;gap:6px">
            ${typeTag}
            <span class="ch-conv-time">${time}</span>
          </div>
        </div>
        <div class="ch-conv-bottom">
          <span class="ch-conv-preview">${preview}</span>
          ${unread ? `<span class="ch-unread-badge">${unread}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  listEl.innerHTML = html;
}

// ── Chat thread ─────────────────────────────────────────────────
function openChatThread(chatId, isAdmin) {
  const chat = getChat(chatId);
  if (!chat) return;
  _currentChatId = chatId;
  _currentChatIsAdmin = isAdmin;

  // Clear unread
  const chats = loadChats();
  const idx = chats.findIndex(c => c.id === chatId);
  if (idx !== -1) { chats[idx].unread = 0; saveChats(chats); }

  // Populate header
  const avatarEl = document.getElementById('chatThreadAvatar');
  const nameEl   = document.getElementById('chatThreadName');
  const subEl    = document.getElementById('chatThreadSub');
  if (avatarEl) {
    if (chat.initials) {
      avatarEl.textContent = chat.initials;
      avatarEl.style.cssText = `background:${chat.color}22;color:${chat.color};font-size:15px;font-weight:700`;
    } else {
      avatarEl.textContent = chat.emoji || '💬';
      avatarEl.style.cssText = '';
    }
  }
  if (nameEl) nameEl.textContent = chat.name;
  if (subEl) subEl.textContent = chat.type === 'group' ? (chat.desc || 'Group chat') : (chat.desc || 'Direct message');

  renderChatMessages(chat);

  const overlay = document.getElementById('chatThreadOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('open'));
  }
  // Scroll to bottom
  setTimeout(() => {
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 80);
}

function renderChatMessages(chat) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  if (!chat.messages.length) {
    container.innerHTML = `<div class="ch-msgs-empty"><p>No messages yet</p><span>Say hello! 👋</span></div>`;
    return;
  }

  let html = '';
  let lastDate = '';
  chat.messages.forEach(msg => {
    if (msg.date && msg.date !== lastDate) {
      html += `<div class="ch-date-divider">${msg.date}</div>`;
      lastDate = msg.date;
    }
    const isMine = _currentChatIsAdmin ? msg.role === 'admin' : msg.role === 'resident';
    const bubbleClass = isMine ? 'ch-bubble ch-bubble-mine' : 'ch-bubble ch-bubble-theirs';
    const senderLine = !isMine && chat.type === 'group'
      ? `<span class="ch-bubble-sender">${msg.sender}</span>`
      : '';
    html += `<div class="ch-msg-row ${isMine ? 'ch-row-mine' : 'ch-row-theirs'}">
      <div class="${bubbleClass}">
        ${senderLine}
        <p class="ch-bubble-text">${msg.text}</p>
        <span class="ch-bubble-time">${msg.time}</span>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function closeChatThread() {
  _currentChatId = null;
  const overlay = document.getElementById('chatThreadOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
  const input = document.getElementById('chatInput');
  if (input) input.value = '';
  // Refresh list
  renderChatList(_currentChatIsAdmin);
}

// ── Send message ────────────────────────────────────────────────
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text  = (input?.value || '').trim();
  if (!text || !_currentChatId) return;

  const chats = loadChats();
  const chat  = chats.find(c => c.id === _currentChatId);
  if (!chat) return;

  const now  = new Date();
  const msg  = {
    id:     Date.now(),
    sender: _currentChatIsAdmin ? 'Management' : ('Unit ' + (RESIDENT_UNIT || 'A-12')),
    senderUnit: RESIDENT_UNIT || 'A-12',
    role:   _currentChatIsAdmin ? 'admin' : 'resident',
    text,
    time:   fmtChatTime(now),
    date:   fmtChatDate(now)
  };

  chat.messages.push(msg);
  chat.unread = 0;

  // Mark unread for the other party's perspective
  // (other chats track unread separately; storage event triggers re-render)
  saveChats(chats);

  if (input) input.value = '';
  renderChatMessages(chat);
  setTimeout(() => {
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 30);
}

// ── Start / open a DM with a resident ──────────────────────────
function startDM(userId, isAdmin) {
  const user = APP_USERS.find(u => u.id === userId);
  if (!user) return;

  const dmId = 'dm-' + userId;
  const chats = loadChats();
  if (!chats.find(c => c.id === dmId)) {
    chats.push({
      id:       dmId,
      type:     'dm',
      name:     user.name,
      initials: user.initials,
      color:    user.color,
      desc:     `Unit ${user.unit} · resident`,
      messages: [],
      unread:   0
    });
    saveChats(chats);
  }

  // Clear search field if present
  const searchEl = document.getElementById('residentChatSearch');
  if (searchEl) searchEl.value = '';

  openChatThread(dmId, isAdmin);
}

// ── Live search across people + conversations ───────────────────
function renderChatSearch(query, isAdmin) {
  const listEl = document.getElementById(isAdmin ? 'adminChatList' : 'residentChatList');
  if (!listEl) return;

  const q = query.trim().toLowerCase();
  if (!q) { renderChatList(isAdmin); return; }

  const chats = loadChats();
  const users = isAdmin ? [] : APP_USERS.filter(u =>
    u.name.toLowerCase().includes(q) || u.unit.toLowerCase().includes(q)
  );
  const convs = chats.filter(c => c.name.toLowerCase().includes(q));

  let html = '';

  if (users.length) {
    html += `<div class="ch-section-lbl">People</div>`;
    html += users.map(u => `
      <div class="ch-search-user-row" onclick="startDM('${u.id}',${isAdmin})">
        <div class="ch-user-av" style="background:${u.color}22;color:${u.color}">${u.initials}</div>
        <div class="ch-search-user-info">
          <span class="ch-search-user-name">${u.name}</span>
          <span class="ch-search-user-unit">Unit ${u.unit}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14" style="color:var(--text-muted,#B8CCC7);flex-shrink:0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>`).join('');
  }

  if (convs.length) {
    html += `<div class="ch-section-lbl">${users.length ? 'Conversations' : 'Results'}</div>`;
    html += convs.map(chat => {
      const lastMsg = chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
      const preview = lastMsg ? lastMsg.text.slice(0, 55) + (lastMsg.text.length > 55 ? '…' : '') : 'No messages yet';
      const time    = lastMsg ? lastMsg.time : '';
      const unread  = chat.unread || 0;
      const typeTag = chat.type === 'group'
        ? `<span class="ch-type-tag">Group</span>`
        : `<span class="ch-type-tag ch-tag-dm">DM</span>`;
      const avatarHtml = chat.initials
        ? `<div class="ch-conv-avatar ch-initials-av" style="background:${chat.color}22;color:${chat.color}">${chat.initials}</div>`
        : `<div class="ch-conv-avatar">${chat.emoji || '💬'}</div>`;
      return `<div class="ch-conv-card" onclick="openChatThread('${chat.id}',${isAdmin})">
        ${avatarHtml}
        <div class="ch-conv-body">
          <div class="ch-conv-top">
            <span class="ch-conv-name">${chat.name}</span>
            <div style="display:flex;align-items:center;gap:6px">${typeTag}<span class="ch-conv-time">${time}</span></div>
          </div>
          <div class="ch-conv-bottom">
            <span class="ch-conv-preview">${preview}</span>
            ${unread ? `<span class="ch-unread-badge">${unread}</span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  if (!users.length && !convs.length) {
    html = `<div class="ch-list-empty"><p>No results for "<strong>${query}</strong>"</p></div>`;
  }

  listEl.innerHTML = html;
}

// ── New Group (admin + resident) ────────────────────────────────
function openNewGroupModal(isAdmin = true) {
  _chatOpenedByAdmin = isAdmin;
  const bg = document.getElementById('newGroupModalBg');
  if (!bg) return;
  document.getElementById('newGroupName').value = '';
  document.getElementById('newGroupDesc').value = '';
  bg.classList.remove('hidden');
  requestAnimationFrame(() => bg.classList.add('open'));
}

function closeNewGroupModal() {
  const bg = document.getElementById('newGroupModalBg');
  if (!bg) return;
  bg.classList.remove('open');
  setTimeout(() => bg.classList.add('hidden'), 280);
}

function submitNewGroup() {
  const name = (document.getElementById('newGroupName')?.value || '').trim();
  const desc = (document.getElementById('newGroupDesc')?.value || '').trim();
  if (!name) { toast('Please enter a group name.', 'error'); return; }

  const isAdmin    = _chatOpenedByAdmin;
  const senderName = isAdmin ? 'Management' : ('Unit ' + (RESIDENT_UNIT || 'A-12'));
  const chats = loadChats();
  const newGroup = {
    id:       'group-' + Date.now(),
    type:     'group',
    name,
    emoji:    '👥',
    desc:     desc || (isAdmin ? 'Group created by management' : 'Resident group'),
    messages: [
      { id: Date.now(), sender: senderName, role: isAdmin ? 'admin' : 'resident',
        text: `Welcome to "${name}"! 👋`, time: fmtChatTime(new Date()), date: fmtChatDate(new Date()) }
    ],
    unread: 1
  };
  chats.push(newGroup);
  saveChats(chats);
  closeNewGroupModal();
  renderChatList(isAdmin);
  toast(`Group "${name}" created! 🎉`, 'success');
}

// ─── Notice Composer ─────────────────────────────────────────────────────────

function openNoticeComposer() {
  const bg = document.getElementById('noticeComposerBg');
  if (!bg) return;
  // Reset form
  document.getElementById('ncTitle').value = '';
  document.getElementById('ncBody').value = '';
  document.getElementById('ncOpt1').value = '';
  document.getElementById('ncOpt2').value = '';
  if (document.getElementById('ncPinned')) document.getElementById('ncPinned').checked = false;
  document.querySelectorAll('.nc-type-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('ncPollFields').classList.add('hidden');
  bg.classList.remove('hidden');
  requestAnimationFrame(() => bg.classList.add('open'));
}

function closeNoticeComposer() {
  const bg = document.getElementById('noticeComposerBg');
  if (!bg) return;
  bg.classList.remove('open');
  setTimeout(() => bg.classList.add('hidden'), 280);
}

function selectNoticeType(btn) {
  document.querySelectorAll('.nc-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const isPoll = btn.dataset.type === 'poll';
  document.getElementById('ncPollFields').classList.toggle('hidden', !isPoll);
}

function submitNoticeComposer() {
  const typeBtn = document.querySelector('.nc-type-btn.active');
  const type    = typeBtn ? typeBtn.dataset.type : 'general';
  const title   = (document.getElementById('ncTitle')?.value || '').trim();
  const body    = (document.getElementById('ncBody')?.value || '').trim();
  const pinned  = document.getElementById('ncPinned')?.checked || false;

  if (!title) { toast('Please enter a title.', 'error'); return; }
  if (!body)  { toast('Please enter a message.', 'error'); return; }

  let poll = null;
  if (type === 'poll') {
    const opt1 = (document.getElementById('ncOpt1')?.value || '').trim();
    const opt2 = (document.getElementById('ncOpt2')?.value || '').trim();
    if (!opt1 || !opt2) { toast('Please fill in both poll options.', 'error'); return; }
    poll = { voted: null, options: [{ label: opt1, votes: 0 }, { label: opt2, votes: 0 }] };
  }

  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  RESIDENT_NOTICES.unshift({
    id:       'notice-' + Date.now(),
    type, pinned, title, body,
    fullText: body,
    audience: 'All residents',
    date:     dateStr,
    poll
  });

  // Update counts
  const cnt = RESIDENT_NOTICES.length;
  ['adminNoticesCount','residentNoticesCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = cnt;
  });

  closeNoticeComposer();
  renderAdminNotices();
  renderResidentNotices();
  toast('Notice posted! 📣', 'success');
}

// ─── End Notice Composer ──────────────────────────────────────────────────────

// Init: ensure welcome is shown and resident QR drawn when entering resident view
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  showView('welcome');
  drawQRPlaceholder(RESIDENT_UNIT);
  updateQrExpiryLabel();
  initCommunityDropdown();
  // Restore any active emergencies from a previous session or another tab
  if (activeEmergencies.length > 0) {
    updateEmergencyBanners();
    updateAdminEmergencyState();
  }
  // Always render incident log (shows resolved history even when no active alerts)
  renderIncidentLog();
  // Render unified incidents tab
  renderAdminIncidents();
  renderResidentIncidents();
  // Pre-render notices so they're ready when user opens the tab
  renderResidentNotices();
});

// Sync emergency alert across tabs in real time
window.addEventListener('storage', (e) => {
  if (e.key === EMERGENCY_KEY) {
    activeEmergencies = loadEmergencyFromStorage();
    updateEmergencyBanners();
    updateAdminEmergencyState();
    updateAttentionCards();
  }
  if (e.key === EMERGENCY_LOG_KEY) {
    renderIncidentLog();
  }
  if (e.key === INCIDENTS_KEY) {
    renderAdminIncidents();
    renderResidentIncidents();
  }
  if (e.key === CHAT_KEY) {
    renderChatList(true);
    renderChatList(false);
    // If thread is open, refresh it too
    if (_currentChatId) {
      const chat = getChat(_currentChatId);
      if (chat) renderChatMessages(chat);
    }
  }
});

// Close resident notifications when clicking outside (backdrop handles most cases; this is a fallback)
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('residentNotifPanel');
  const wrap = document.querySelector('.resident-notif-wrap');
  if (!dropdown || !dropdown.classList.contains('open')) return;
  if (dropdown.contains(e.target) || (wrap && wrap.contains(e.target))) return;
  closeResidentNotifications();
});

function openSecurityManualSheet() {
  var sheet = document.getElementById('security-manual-sheet');
  if (sheet) sheet.classList.add('open');
}

function closeSecurityManualSheet() {
  var sheet = document.getElementById('security-manual-sheet');
  if (sheet) sheet.classList.remove('open');
}

function openSecurityQRModal() {
  var modal = document.getElementById('security-qr-modal');
  if (modal) modal.classList.add('open');
}

function closeSecurityQRModal() {
  var modal = document.getElementById('security-qr-modal');
  if (modal) modal.classList.remove('open');
  var success = document.getElementById('security-qr-success');
  if (success) success.classList.remove('show');
}

function simulateSecurityScan() {
  var success = document.getElementById('security-qr-success');
  if (success) success.classList.add('show');
}

function confirmSecurityCheckin() {
  closeSecurityQRModal();
  // Optional: add demo check-in (e.g. Diane Mukamana) — for demo only
  var now = new Date();
  var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  var dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  logbook.unshift({
    name: 'Diane Mukamana',
    plate: 'RAB 441C',
    host: 'B-07',
    checkIn: timeStr,
    checkOut: null,
    status: 'onsite',
    date: dateStr,
    dateKey: formatDateKey(now),
  });
  renderLogbook();
  renderResidentVisitors();
  toast('Diane Mukamana checked in — B-07', 'success');
}

// ─── Emergency Alert ───────────────────────────────────────────────────────
const EMERGENCY_KEY = 'wellage_active_emergency';
const EMERGENCY_LOG_KEY = 'wellage_resolved_emergencies';
const INCIDENTS_KEY = 'wellage_incidents';

// ─── Seed / demo incidents (merged in if not already present) ─────────────────
const SEED_INCIDENTS = [
  {
    id: 'seed-001',
    type: 'Security Threat',
    msg: 'Suspicious person spotted near Gate B. Security was alerted immediately.',
    reportedAt: '17 Mar 2026 03:39 PM',
    status: 'resolved',
    note: 'Person identified as delivery worker. No threat. Gate secured.',
    resolvedAt: '03:39 PM'
  },
  {
    id: 'seed-002',
    type: 'Fire',
    msg: 'Small fire reported in the waste disposal area near Block A. Estate security responded promptly and extinguished the fire. No injuries were reported.',
    reportedAt: '14 Mar 2026 02:10 PM',
    status: 'resolved',
    note: 'Fire extinguished by security. Area inspected and cleared.',
    resolvedAt: '02:18 PM'
  }
];

// ─── Unified Incident Log (active + resolved, manually logged + from alerts) ──
function loadIncidents() {
  try {
    const raw = localStorage.getItem(INCIDENTS_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    // Merge seed incidents that aren't already saved
    const storedIds = new Set(stored.map(i => String(i.id)));
    const missing = SEED_INCIDENTS.filter(s => !storedIds.has(s.id));
    if (missing.length) {
      const merged = [...stored, ...missing];
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch (_) { return SEED_INCIDENTS; }
}

function saveIncidents(list) {
  try {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(list));
  } catch (_) {}
}

function addIncidentEntry(entry) {
  const list = loadIncidents();
  list.unshift(entry);
  saveIncidents(list);
}

function updateIncidentEntry(id, updates) {
  const list = loadIncidents();
  const idx = list.findIndex(i => i.id === id);
  if (idx !== -1) Object.assign(list[idx], updates);
  saveIncidents(list);
}

function renderAdminIncidents() {
  const listEl = document.getElementById('adminIncidentList');
  const emptyEl = document.getElementById('adminIncidentsEmpty');
  const dotEl = document.getElementById('adminIncidentDot');
  if (!listEl) return;

  // Merge: active emergencies (as active incidents) + all stored incidents
  const stored = loadIncidents();
  // Active emergencies that haven't been stored yet appear first
  const storedIds = new Set(stored.map(i => i.id));
  const activeEntries = activeEmergencies
    .filter(a => !storedIds.has(a.id))
    .map(a => ({ id: a.id, type: a.type, msg: a.msg, reportedAt: a.time, status: 'active', note: null, resolvedAt: null }));
  const all = [...activeEntries, ...stored];

  const hasActive = all.some(i => i.status === 'active');
  if (dotEl) dotEl.classList.toggle('hidden', !hasActive);

  if (all.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  listEl.innerHTML = all.map(i => incidentCardHTML(i, true)).join('');
}

// ── Resident Incidents — type config ──────────────────────────
const RI_CFG = {
  'Fire':           { color: '#F97316', bg: '#FFF7ED', bar: 'ri-bar-fire',     label: 'Fire',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>` },
  'Security Threat':{ color: '#DC2626', bg: '#FEF2F2', bar: 'ri-bar-security', label: 'Security', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  'Accident':       { color: '#7C3AED', bg: '#F5F3FF', bar: 'ri-bar-medical',  label: 'Medical',  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  'Other':          { color: '#8FA89F', bg: '#F0F4F2', bar: 'ri-bar-other',    label: 'Other',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="9" x2="12" y2="13"/></svg>` },
};
function _riCfg(type) { return RI_CFG[type] || RI_CFG['Other']; }

let _riActiveFilter = '';

function setResidentIncidentFilter(btn) {
  document.querySelectorAll('#riFilterRow .ri-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  _riActiveFilter = btn.dataset.filter || '';
  renderResidentIncidents();
}

function renderResidentIncidents() {
  const listEl = document.getElementById('residentIncidentList');
  const dotEl  = document.getElementById('residentIncidentDot');
  if (!listEl) return;

  // Merge active emergencies + stored incidents
  const stored = loadIncidents();
  const storedIds = new Set(stored.map(i => i.id));
  const activeEntries = activeEmergencies
    .filter(a => !storedIds.has(a.id))
    .map(a => ({ id: a.id, type: a.type, msg: a.msg, reportedAt: a.time, status: 'active', note: null, resolvedAt: null }));
  let all = [...activeEntries, ...stored];

  // Update nav dot
  const hasActive = all.some(i => i.status === 'active');
  if (dotEl) dotEl.classList.toggle('hidden', !hasActive);

  // Apply filter
  if (_riActiveFilter === 'active') {
    all = all.filter(i => i.status === 'active');
  } else if (_riActiveFilter === 'resolved') {
    all = all.filter(i => i.status !== 'active');
  } else if (_riActiveFilter) {
    all = all.filter(i => i.type === _riActiveFilter);
  }

  if (!all.length) {
    listEl.innerHTML = `<div class="ri-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <p>No incidents found</p><span>All clear in this category</span></div>`;
    return;
  }

  const active = all.filter(i => i.status === 'active');
  const past   = all.filter(i => i.status !== 'active');
  let html = '';

  // Active alert cards
  active.forEach(inc => {
    const cfg = _riCfg(inc.type);
    html += `<div class="ri-alert-card" onclick="openResidentIncidentSheet('${inc.id}')">
      <div class="ri-alert-top">
        <span class="ri-alert-badge"><span class="ri-badge-pulse"></span>ACTIVE</span>
        <span class="ri-alert-time">${inc.reportedAt || '—'}</span>
      </div>
      <div class="ri-alert-type-row">
        <div class="ri-alert-type-ic">${cfg.icon}</div>
        <span class="ri-alert-type-name">${inc.type}</span>
      </div>
      <p class="ri-alert-desc">${(inc.msg || '').slice(0, 90)}${inc.msg && inc.msg.length > 90 ? '…' : ''}</p>
      <div class="ri-alert-meta">
        <span class="ri-alert-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="11" height="11"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Reported ${inc.reportedAt || '—'}</span>
      </div>
      <div class="ri-alert-actions">
        <button class="ri-alert-btn ri-btn-secondary" onclick="event.stopPropagation()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call Security
        </button>
        <button class="ri-alert-btn ri-btn-primary" onclick="event.stopPropagation();openResidentIncidentSheet('${inc.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          View Details
        </button>
      </div>
    </div>`;
  });

  // Report strip (always shown unless filtering for resolved/type with no active)
  if (!_riActiveFilter || _riActiveFilter === 'active') {
    html += `<div class="ri-report-strip" onclick="openResidentReportSheet()">
      <div class="ri-report-strip-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <div class="ri-report-strip-text">
        <div class="ri-report-strip-title">Report an incident</div>
        <div class="ri-report-strip-sub">Fire, security, medical or other</div>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`;
  }

  // Past incidents
  if (past.length) {
    html += `<p class="ri-section-lbl">Past incidents</p>`;
    past.forEach(inc => {
      const cfg = _riCfg(inc.type);
      const statusCls = inc.status === 'resolved' ? 'ri-status-resolved' : 'ri-status-monitoring';
      const statusLbl = inc.status === 'resolved' ? 'RESOLVED' : inc.status.toUpperCase();
      html += `<div class="ri-inc-card" onclick="openResidentIncidentSheet('${inc.id}')">
        <div class="ri-inc-bar ${cfg.bar}"></div>
        <div class="ri-inc-inner">
          <div class="ri-inc-top">
            <div class="ri-inc-title-row">
              <div class="ri-inc-ic" style="background:${cfg.bg};color:${cfg.color}">${cfg.icon}</div>
              <span class="ri-inc-name">${inc.type}</span>
            </div>
            <span class="ri-inc-status ${statusCls}">${statusLbl}</span>
          </div>
          <p class="ri-inc-body">${inc.msg || '—'}</p>
          <div class="ri-inc-foot">
            <span class="ri-inc-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="11" height="11"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${inc.reportedAt || '—'}</span>
            ${inc.note ? `<span class="ri-inc-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="11" height="11"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${inc.note.slice(0, 40)}${inc.note.length > 40 ? '…' : ''}</span>` : ''}
          </div>
        </div>
      </div>`;
    });
  }

  listEl.innerHTML = html;
}

function incidentCardHTML(i, isAdmin) {
  // Used only by admin incidents tab — kept for compatibility
  const typeColors = { 'Fire': '#F97316', 'Security Threat': '#DC2626', 'Accident': '#7C3AED', 'Other': '#64748b' };
  const color = typeColors[i.type] || '#64748b';
  const isActive = i.status === 'active';
  const statusBadge = isActive
    ? `<span class="incident-badge incident-badge-active">Active</span>`
    : `<span class="incident-badge incident-badge-resolved">Resolved</span>`;
  const meta = isActive
    ? `<span class="incident-meta">Reported at ${i.reportedAt || '—'}</span>`
    : `<span class="incident-meta">Reported ${i.reportedAt || '—'}${i.resolvedAt ? ' · Resolved ' + i.resolvedAt : ''}</span>`;
  const note = !isActive && i.note
    ? `<p class="incident-note">${i.note}</p>`
    : (!isActive ? `<p class="incident-note incident-note-muted">No resolution note.</p>` : '');
  const pulseHtml = isActive ? `<span class="incident-card-pulse"></span>` : '';
  return `
    <div class="incident-card ${isActive ? 'incident-card-active' : 'incident-card-resolved'}">
      ${pulseHtml}
      <div class="incident-card-left">
        <span class="incident-type-dot" style="background:${color}"></span>
        <div class="incident-card-body">
          <div class="incident-card-top">
            <span class="incident-type-label">${i.type}</span>
            ${statusBadge}
          </div>
          ${i.msg ? `<p class="incident-msg">${i.msg}</p>` : ''}
          ${note}
          ${meta}
        </div>
      </div>
    </div>`;
}

// Resident incident detail sheet
function _riGetAll() {
  const stored = loadIncidents();
  const storedIds = new Set(stored.map(i => i.id));
  const activeEntries = activeEmergencies
    .filter(a => !storedIds.has(a.id))
    .map(a => ({ id: a.id, type: a.type, msg: a.msg, reportedAt: a.time, status: 'active', note: null, resolvedAt: null }));
  return [...activeEntries, ...stored];
}

function openResidentIncidentSheet(id) {
  const all = _riGetAll();
  const inc = all.find(x => String(x.id) === String(id));
  if (!inc) return;
  const cfg = _riCfg(inc.type);

  const tagEl    = document.getElementById('riSheetTag');
  const subEl    = document.getElementById('riSheetSub');
  const titleEl  = document.getElementById('riSheetTitle');
  const metaEl   = document.getElementById('riSheetMeta');
  const textEl   = document.getElementById('riSheetText');
  const detailEl = document.getElementById('riSheetDetails');
  const tlEl     = document.getElementById('riSheetTimeline');
  const footEl   = document.getElementById('riSheetFooter');

  if (tagEl) {
    tagEl.textContent = inc.status === 'active' ? 'ACTIVE' : inc.status.toUpperCase();
    tagEl.className = 'ri-status-tag ' + (inc.status === 'active' ? 'ri-tag-active' : inc.status === 'resolved' ? 'ri-tag-resolved' : 'ri-tag-monitoring');
  }
  if (subEl) subEl.textContent = cfg.label;
  if (titleEl) titleEl.textContent = inc.type;
  if (metaEl) metaEl.innerHTML = `
    <span class="ri-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="11" height="11"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${inc.reportedAt || '—'}</span>
    ${inc.resolvedAt ? `<span class="ri-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="11" height="11"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Resolved ${inc.resolvedAt}</span>` : ''}`;
  if (textEl) textEl.textContent = inc.msg || 'No description provided.';
  if (detailEl) detailEl.innerHTML = `
    <div class="ri-detail-row"><span class="ri-detail-key">Type</span><span class="ri-detail-val">${cfg.label}</span></div>
    <div class="ri-detail-row"><span class="ri-detail-key">Status</span><span class="ri-detail-val">${inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}</span></div>
    ${inc.note ? `<div class="ri-detail-row"><span class="ri-detail-key">Resolution note</span><span class="ri-detail-val" style="max-width:60%;text-align:right">${inc.note}</span></div>` : ''}
    <div class="ri-detail-row"><span class="ri-detail-key">Reported at</span><span class="ri-detail-val">${inc.reportedAt || '—'}</span></div>`;

  // Build simple timeline from available data
  const tl = [{ dot: 'ri-tl-red', time: inc.reportedAt || '—', text: 'Incident reported' }];
  if (inc.status === 'active') {
    tl.push({ dot: 'ri-tl-amber', time: 'Now', text: 'Security team notified and monitoring' });
  } else {
    tl.push({ dot: 'ri-tl-amber', time: '—', text: 'Security team responded' });
    tl.push({ dot: 'ri-tl-green', time: inc.resolvedAt || '—', text: inc.note ? `Resolved — ${inc.note}` : 'Situation resolved' });
  }
  if (tlEl) tlEl.innerHTML = tl.map(t => `
    <div class="ri-tl-item"><div class="ri-tl-dot ${t.dot}"></div><div class="ri-tl-time">${t.time}</div><div class="ri-tl-text">${t.text}</div></div>`).join('');

  if (footEl) footEl.innerHTML = inc.status === 'active'
    ? `<button class="ri-sheet-btn ri-btn-ghost"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call Security</button>
       <button class="ri-sheet-btn ri-btn-primary" onclick="closeResidentIncidentSheet()">Understood</button>`
    : `<button class="ri-sheet-btn ri-btn-primary" onclick="closeResidentIncidentSheet()" style="flex:1">Close</button>`;

  const overlay = document.getElementById('riDetailOverlay');
  const sheet   = document.getElementById('riDetailSheet');
  if (!sheet) return;
  overlay?.classList.remove('hidden');
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => { overlay?.classList.add('open'); sheet.classList.add('open'); });
}

function closeResidentIncidentSheet() {
  const overlay = document.getElementById('riDetailOverlay');
  const sheet   = document.getElementById('riDetailSheet');
  overlay?.classList.remove('open');
  sheet?.classList.remove('open');
  setTimeout(() => { overlay?.classList.add('hidden'); sheet?.classList.add('hidden'); }, 320);
}

// Resident Report Sheet
function openResidentReportSheet() {
  const overlay = document.getElementById('riReportOverlay');
  const sheet   = document.getElementById('riReportSheet');
  if (!sheet) return;
  // Reset
  document.querySelectorAll('#riReportTypeGrid .ri-type-opt').forEach((o, i) => o.classList.toggle('ri-type-sel', i === 0));
  const loc  = document.getElementById('riReportLoc');
  const desc = document.getElementById('riReportDesc');
  if (loc)  loc.value  = '';
  if (desc) desc.value = '';
  overlay?.classList.remove('hidden');
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => { overlay?.classList.add('open'); sheet.classList.add('open'); });
}

function closeResidentReportSheet() {
  const overlay = document.getElementById('riReportOverlay');
  const sheet   = document.getElementById('riReportSheet');
  overlay?.classList.remove('open');
  sheet?.classList.remove('open');
  setTimeout(() => { overlay?.classList.add('hidden'); sheet?.classList.add('hidden'); }, 320);
}

function selectResidentReportType(el) {
  document.querySelectorAll('#riReportTypeGrid .ri-type-opt').forEach(o => o.classList.remove('ri-type-sel'));
  el.classList.add('ri-type-sel');
}

function submitResidentReport() {
  const typeEl = document.querySelector('#riReportTypeGrid .ri-type-opt.ri-type-sel');
  const type   = typeEl ? typeEl.dataset.type : 'Other';
  const loc    = (document.getElementById('riReportLoc')?.value || '').trim();
  const desc   = (document.getElementById('riReportDesc')?.value || '').trim();
  if (!desc) { toast('Please describe the incident.', 'error'); return; }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const entry = {
    id: Date.now(),
    type,
    msg: loc ? `[${loc}] ${desc}` : desc,
    reportedAt: dateStr + ' ' + timeStr,
    status: 'active',
    note: null,
    resolvedAt: null
  };
  addIncidentEntry(entry);
  closeResidentReportSheet();
  renderResidentIncidents();
  renderAdminIncidents();
  toast('Your report has been sent to security.', 'success');
}

// Log Incident modal (non-emergency, manual entry)
let _logIncidentStatus = 'resolved';

function openLogIncidentModal() {
  const bg = document.getElementById('logIncidentModalBg');
  if (!bg) return;
  // Reset form
  document.querySelectorAll('#logIncidentTypeGrid .emergency-type-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  const desc = document.getElementById('logIncidentDesc');
  const note = document.getElementById('logIncidentNote');
  if (desc) desc.value = '';
  if (note) note.value = '';
  _logIncidentStatus = 'resolved';
  document.getElementById('logIncidentStatusResolved')?.classList.add('active');
  document.getElementById('logIncidentStatusActive')?.classList.remove('active');
  bg.classList.remove('hidden');
  requestAnimationFrame(() => bg.classList.add('open'));
}

function closeLogIncidentModal() {
  const bg = document.getElementById('logIncidentModalBg');
  if (!bg) return;
  bg.classList.remove('open');
  setTimeout(() => bg.classList.add('hidden'), 280);
}

function selectLogIncidentType(btn) {
  document.querySelectorAll('#logIncidentTypeGrid .emergency-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectLogIncidentStatus(btn) {
  document.querySelectorAll('.incident-status-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _logIncidentStatus = btn.getAttribute('data-status');
}

function submitLogIncident() {
  const typeBtn = document.querySelector('#logIncidentTypeGrid .emergency-type-btn.active');
  const type = typeBtn ? typeBtn.getAttribute('data-type') : 'Other';
  const msg = (document.getElementById('logIncidentDesc')?.value || '').trim();
  const note = (document.getElementById('logIncidentNote')?.value || '').trim();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const entry = {
    id: Date.now(),
    type,
    msg,
    reportedAt: dateStr + ' ' + timeStr,
    status: _logIncidentStatus,
    note: note || null,
    resolvedAt: _logIncidentStatus === 'resolved' ? timeStr : null
  };
  addIncidentEntry(entry);
  closeLogIncidentModal();
  renderAdminIncidents();
  renderResidentIncidents();
  toast('Incident logged successfully.', 'success');
}

function loadResolvedLog() {
  try {
    const raw = localStorage.getItem(EMERGENCY_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

function saveResolvedLog(log) {
  try {
    localStorage.setItem(EMERGENCY_LOG_KEY, JSON.stringify(log.slice(0, 20)));
  } catch (_) {}
}

function loadEmergencyFromStorage() {
  try {
    const raw = localStorage.getItem(EMERGENCY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Backward compat: old format was a single object
    if (Array.isArray(parsed)) return parsed;
    return [{ id: Date.now(), ...parsed }];
  } catch (_) { return []; }
}

function saveEmergencyToStorage(arr) {
  try {
    if (arr && arr.length > 0) localStorage.setItem(EMERGENCY_KEY, JSON.stringify(arr));
    else localStorage.removeItem(EMERGENCY_KEY);
  } catch (_) {}
}

let activeEmergencies = loadEmergencyFromStorage();

const emergencyInstructions = {
  'Security Threat': ['Stay inside and lock your doors', 'Do not approach suspicious individuals', 'Contact authorities if needed: 112', 'Wait for an all-clear from the admin'],
  'Fire':            ['Evacuate the building immediately', 'Use stairs — do not use lifts', 'Move to the assembly point at the main gate', 'Call fire services: 112'],
  'Accident':        ['Keep clear of the affected area', 'Call emergency services if needed: 912', 'First aid kit is at the security booth', 'Wait for admin instructions'],
  'Other':           ['Stay alert and follow admin instructions', 'Contact the admin if you need assistance'],
};

function openEmergencyModal() {
  const bg = document.getElementById('emergencyComposeBg');
  if (bg) bg.classList.add('open');
  const ta = document.getElementById('emergencyMsgInput');
  if (ta) ta.value = '';
  // Reset type selection to first option
  document.querySelectorAll('.emergency-type-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === 0);
  });
}

function closeEmergencyModal() {
  const bg = document.getElementById('emergencyComposeBg');
  if (bg) bg.classList.remove('open');
}

function selectEmergencyType(btn) {
  document.querySelectorAll('.emergency-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function sendEmergencyAlert() {
  const typeBtn = document.querySelector('.emergency-type-btn.active');
  const type = typeBtn ? typeBtn.getAttribute('data-type') : 'Other';
  const msg = (document.getElementById('emergencyMsgInput')?.value || '').trim();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const alertId = Date.now();

  activeEmergencies.push({ id: alertId, type, msg, time: timeStr });
  saveEmergencyToStorage(activeEmergencies);

  // Also log in unified incidents list
  addIncidentEntry({ id: alertId, type, msg, reportedAt: dateStr + ' ' + timeStr, status: 'active', note: null, resolvedAt: null });

  closeEmergencyModal();
  updateEmergencyBanners();
  updateAdminEmergencyState();
  updateAttentionCards();
  renderAdminIncidents();
  renderResidentIncidents();
  toast('Emergency alert sent to all residents and security.', 'danger');
}

let _resolvingAlertId = null;

function resolveEmergencyAlert(id) {
  _resolvingAlertId = id;
  const alert = activeEmergencies.find(a => a.id === id);
  const bg = document.getElementById('emergencyResolveBg');
  const subtitle = document.getElementById('emergencyResolveSubtitle');
  const noteEl = document.getElementById('emergencyResolveNote');
  if (subtitle) subtitle.textContent = alert ? alert.type : '';
  if (noteEl) noteEl.value = '';
  if (bg) {
    bg.classList.remove('hidden');
    requestAnimationFrame(() => bg.classList.add('open'));
  }
}

function closeResolveSheet() {
  const bg = document.getElementById('emergencyResolveBg');
  if (!bg) return;
  bg.classList.remove('open');
  setTimeout(() => bg.classList.add('hidden'), 280);
  _resolvingAlertId = null;
}

function confirmResolveAlert() {
  const id = _resolvingAlertId;
  const note = (document.getElementById('emergencyResolveNote')?.value || '').trim();
  const alert = activeEmergencies.find(a => a.id === id);

  if (alert) {
    const now = new Date();
    const resolvedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const log = loadResolvedLog();
    log.unshift({ id: alert.id, type: alert.type, msg: alert.msg, sentTime: alert.time, resolvedTime, note });
    saveResolvedLog(log);
    // Update in unified incidents list
    updateIncidentEntry(alert.id, { status: 'resolved', note: note || null, resolvedAt: resolvedTime });
  }

  activeEmergencies = id !== undefined ? activeEmergencies.filter(a => a.id !== id) : [];
  saveEmergencyToStorage(activeEmergencies);
  closeResolveSheet();
  updateEmergencyBanners();
  updateAdminEmergencyState();
  updateAttentionCards();
  renderIncidentLog();
  renderAdminIncidents();
  renderResidentIncidents();
  toast('Emergency alert resolved.', 'success');
}

function updateEmergencyBanners() {
  const active = activeEmergencies.length > 0;

  // Resident home — one card per active alert
  const homeList = document.getElementById('residentEmergencyList');
  if (homeList) {
    if (active) {
      const svgAlert = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      const svgArrow = '<svg class="resident-emergency-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>';
      homeList.innerHTML = activeEmergencies.map(a => `
        <button type="button" class="resident-emergency-card" onclick="openEmergencyDetail(${a.id})">
          <span class="resident-emergency-card-pulse"></span>
          <span class="resident-emergency-card-ic">${svgAlert}</span>
          <span class="resident-emergency-card-text">
            <span class="resident-emergency-card-label">EMERGENCY ALERT</span>
            <span class="resident-emergency-card-type">${a.type}</span>
          </span>
          ${svgArrow}
        </button>
      `).join('');
    } else {
      homeList.innerHTML = '';
    }
  }

  // Slim strip below topbar (for non-home screens)
  updateResidentEmergencyStrip();
}

function updateResidentEmergencyStrip() {
  const active = activeEmergencies.length > 0;
  const strip = document.getElementById('residentEmergencyStrip');
  if (!strip) return;
  const onHome = !!document.querySelector('#resident-home.active');
  strip.classList.toggle('hidden', !active || onHome);
  if (active) {
    const first = activeEmergencies[0];
    const count = activeEmergencies.length;
    const label = document.getElementById('residentEmergencyStripType');
    if (label) label.textContent = 'Emergency Alert · ' + first.type + (count > 1 ? ' +' + (count - 1) + ' more' : '');
  }
}

function renderIncidentLog() {
  const wrap = document.getElementById('incidentLogWrap');
  const list = document.getElementById('incidentLogList');
  if (!wrap || !list) return;
  const log = loadResolvedLog();
  if (log.length === 0) {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  list.innerHTML = log.map(r => `
    <div class="incident-log-item">
      <span class="incident-log-ic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <div class="incident-log-body">
        <span class="incident-log-type">${r.type}</span>
        ${r.note ? `<p class="incident-log-note">${r.note}</p>` : '<p class="incident-log-note muted">No resolution note provided.</p>'}
        <span class="incident-log-meta">Resolved at ${r.resolvedTime}${r.sentTime ? ' · Reported at ' + r.sentTime : ''}</span>
      </div>
    </div>
  `).join('');
}

function updateAdminEmergencyState() {
  const idle = document.getElementById('adminEmergencyIdle');
  const listEl = document.getElementById('adminEmergencyList');
  const addBtn = document.getElementById('adminEmergencyAddBtn');
  if (!idle) return;

  if (activeEmergencies.length > 0) {
    idle.classList.add('hidden');
    if (listEl) {
      listEl.classList.remove('hidden');
      listEl.innerHTML = activeEmergencies.map(a => `
        <div class="admin-emergency-active-card">
          <div class="admin-emergency-active-header">
            <span class="admin-emergency-pulse"></span>
            <span class="admin-emergency-active-label">LIVE ALERT</span>
            <span class="admin-emergency-active-type">${a.type}</span>
          </div>
          <p class="admin-emergency-active-msg">${a.msg || ''}</p>
          <p class="admin-emergency-active-meta">Sent at ${a.time} · All residents and security notified</p>
          <button type="button" class="admin-emergency-resolve-btn" onclick="resolveEmergencyAlert(${a.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Mark as Resolved
          </button>
        </div>
      `).join('');
    }
    if (addBtn) addBtn.classList.remove('hidden');
  } else {
    idle.classList.remove('hidden');
    if (listEl) listEl.classList.add('hidden');
    if (addBtn) addBtn.classList.add('hidden');
  }
}

function openEmergencyDetail(id) {
  const alert = id !== undefined
    ? activeEmergencies.find(a => a.id === id)
    : activeEmergencies[0];
  if (!alert) return;
  const bg = document.getElementById('emergencyDetailBg');
  if (bg) bg.classList.remove('hidden');

  const typeEl = document.getElementById('emergencyDetailType');
  const msgEl = document.getElementById('emergencyDetailMsg');
  const metaEl = document.getElementById('emergencyDetailMeta');
  const instrEl = document.getElementById('emergencyDetailInstr');

  if (typeEl) typeEl.textContent = alert.type;
  if (msgEl) msgEl.textContent = alert.msg || 'Please follow the instructions below and stay safe.';
  if (metaEl) metaEl.textContent = 'Alert sent at ' + alert.time;

  const instructions = emergencyInstructions[alert.type] || emergencyInstructions['Other'];
  if (instrEl) instrEl.innerHTML = instructions.map(i => '<li>' + i + '</li>').join('');
}

function closeEmergencyDetail() {
  const bg = document.getElementById('emergencyDetailBg');
  if (bg) bg.classList.add('hidden');
}

/* Wellage App — plain JS */

// ─── Theme (shared via localStorage with admin portal) ─────────────────────
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

function submitResidentSignup() {
  const fullName = document.getElementById('residentSignupName').value.trim();
  const phone = document.getElementById('residentSignupPhone').value.trim();
  const unit = document.getElementById('residentSignupUnit').value.trim();
  const community = document.getElementById('residentSignupCommunity').value.trim();
  const password = document.getElementById('residentSignupPassword').value;
  if (!fullName) {
    toast('Please enter your full name.', 'error');
    return;
  }
  if (!phone) {
    toast('Please enter your phone number.', 'error');
    return;
  }
  if (!unit) {
    toast('Please enter your unit or house.', 'error');
    return;
  }
  if (!community) {
    toast('Please select a community.', 'error');
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
  closeCommunityDropdown();
}

function toggleCommunityDropdown() {
  const wrap = document.querySelector('.field-community .custom-select-wrap');
  const dropdown = document.getElementById('residentSignupCommunityDropdown');
  const trigger = document.getElementById('residentSignupCommunityTrigger');
  if (!wrap || !dropdown) return;
  const isOpen = wrap.classList.toggle('open');
  dropdown.setAttribute('aria-hidden', !isOpen);
  if (trigger) trigger.setAttribute('aria-expanded', isOpen);
  if (isOpen) {
    document.addEventListener('click', closeCommunityDropdownOnClickOutside);
  } else {
    document.removeEventListener('click', closeCommunityDropdownOnClickOutside);
  }
}

function closeCommunityDropdown() {
  const wrap = document.querySelector('.field-community .custom-select-wrap');
  const dropdown = document.getElementById('residentSignupCommunityDropdown');
  const trigger = document.getElementById('residentSignupCommunityTrigger');
  if (wrap) wrap.classList.remove('open');
  if (dropdown) dropdown.setAttribute('aria-hidden', 'true');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  document.removeEventListener('click', closeCommunityDropdownOnClickOutside);
}

function closeCommunityDropdownOnClickOutside(e) {
  const wrap = document.querySelector('.field-community .custom-select-wrap');
  if (wrap && !wrap.contains(e.target)) closeCommunityDropdown();
}

function initCommunityDropdown() {
  const select = document.getElementById('residentSignupCommunity');
  const label = document.getElementById('residentSignupCommunityLabel');
  const dropdown = document.getElementById('residentSignupCommunityDropdown');
  if (!select || !label || !dropdown) return;
  const trigger = document.getElementById('residentSignupCommunityTrigger');
  function syncLabel() {
    const opt = select.options[select.selectedIndex];
    label.textContent = opt ? opt.textContent : 'Select community';
    if (trigger) {
      if (select.value) trigger.classList.remove('is-placeholder');
      else trigger.classList.add('is-placeholder');
    }
    dropdown.querySelectorAll('li[role="option"]').forEach(o => {
      o.removeAttribute('aria-selected');
      if ((o.getAttribute('data-value') || '') === (select.value || '')) o.setAttribute('aria-selected', 'true');
    });
  }
  select.addEventListener('change', syncLabel);
  syncLabel();
  dropdown.querySelectorAll('li[role="option"]').forEach(li => {
    li.addEventListener('click', () => {
      const value = li.getAttribute('data-value');
      select.value = value || '';
      dropdown.querySelectorAll('li[role="option"]').forEach(o => o.removeAttribute('aria-selected'));
      li.setAttribute('aria-selected', 'true');
      syncLabel();
      closeCommunityDropdown();
    });
  });
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

function doAdminSignUp() {
  const btn = document.getElementById('adminSuBtn');
  const first = document.getElementById('adminSuFirst').value.trim();
  const last = document.getElementById('adminSuLast').value.trim();
  const email = document.getElementById('adminSuEmail').value.trim();
  const code = document.getElementById('adminSuCode').value.trim();
  const pw = document.getElementById('adminSuPw').value;
  if (!first || !last || !email || !code || !pw) {
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
    ['adminSuFirst', 'adminSuLast', 'adminSuEmail', 'adminSuPhone', 'adminSuCode', 'adminSuPw'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    closeModal('modal-admin-signup');
    document.getElementById('modal-admin-signin').classList.remove('hidden');
    toast('Account created! You can now sign in.', 'success');
  }, 1200);
}

const adminPageTitles = {
  overview: { title: 'Overview', sub: 'Monday, 2 March 2026' },
  payments: { title: 'Payments', sub: 'March 2026 · Urugo Estate' },
  visitors: { title: 'Visitors', sub: 'Digital access logbook' },
  notices: { title: 'Notices', sub: 'Community announcements' },
  residents: { title: 'Residents', sub: 'Manage district residents' },
};

function adminNav(tab) {
  document.querySelectorAll('.admin-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-bottom-nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('admin-screen-' + tab);
  const navBtn = document.querySelector('.admin-bottom-nav-item[data-tab="' + tab + '"]');
  if (screen) screen.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
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
  else if (tab === 'overview') {
    const countEl = document.getElementById('adminAppPendingCount');
    if (countEl) {
      const pending = getPendingResidents();
      countEl.textContent = pending.length === 1 ? '1 request' : pending.length + ' requests';
    }
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

function adminOpenVisitorSheet(name, initials, unit, host, checkin, checkout, plate, onsite) {
  const titleEl = document.getElementById('adminVisitorSheetTitle');
  const avatarEl = document.getElementById('adminVisitorSheetAvatar');
  const nameEl = document.getElementById('adminVisitorSheetName');
  const hostEl = document.getElementById('adminVisitorSheetHost');
  const unitEl = document.getElementById('adminVisitorSheetUnit');
  const inEl = document.getElementById('adminVisitorSheetIn');
  const outEl = document.getElementById('adminVisitorSheetOut');
  const plateEl = document.getElementById('adminVisitorSheetPlate');
  const unitTagEl = document.getElementById('adminVisitorSheetUnitTag');
  const statusTagEl = document.getElementById('adminVisitorSheetStatusTag');
  const outBtnEl = document.getElementById('adminVisitorSheetOutBtn');
  if (titleEl) titleEl.textContent = name;
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = name;
  if (hostEl) hostEl.textContent = host;
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
  const titles = { home: 'Home', payments: 'My Payments', qr: 'My Visitors', notices: 'Notice Board', profile: 'My account' };
  const subEl = document.getElementById('residentGreetingSub');
  if (subEl && tab === 'home')
    subEl.textContent = (residentPageSubs.home || '') + ' · House ' + (RESIDENT_UNIT || 'A-12');
  toggleResidentSidebar(false);
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
  if (tab === 'notices') {
    const noticePhSub = document.getElementById('noticePhSub');
    if (noticePhSub) {
      const estateLabel = RESIDENT_COMMUNITY ? (RESIDENT_COMMUNITY + ' estate') : 'Your estate';
      noticePhSub.textContent = estateLabel + ' · March 2026';
    }
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
  if (sheet) sheet.classList.add('open');
}

function closeSignoutSheet() {
  const sheet = document.getElementById('signoutSheetBg');
  if (sheet) sheet.classList.remove('open');
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
  if (!nextDueEl) return;
  const outstanding = getOutstandingPayments();
  if (outstanding.length > 0) {
    nextDueEl.textContent = outstanding[0].period;
    nextDueEl.classList.remove('overdue');
  } else {
    nextDueEl.textContent = getNextDueDateWhenNoDebt();
    nextDueEl.classList.remove('overdue');
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
  if (payNowLabel) payNowLabel.textContent = 'Pay all outstanding — RWF ' + totalOut.toLocaleString();

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
      listHtml += canPay ? '<button type="button" class="pay-prb" onclick="openPaymentSheet()">Pay now</button>' : '<span class="pay-stbadge ' + p.status + '">' + escapeHtml(stLabel) + '</span>';
      listHtml += '</div></div>';
    });
    listHtml += '</div>';
  });
  if (!listHtml) listHtml = '<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:24px">No payments for this service yet.</p>';
  if (list) list.innerHTML = listHtml;
}

function openPaymentSheet() {
  const payable = getPayablePayments();
  const total = payable.reduce((sum, p) => sum + (p.amountNum || 0), 0);
  if (payable.length === 0) return;
  const subEl = document.getElementById('paymentSheetSub');
  const breakdownEl = document.getElementById('paymentSheetBreakdown');
  const totalEl = document.getElementById('paymentSheetTotal');
  if (subEl) subEl.textContent = 'House ' + (RESIDENT_UNIT || 'A-12') + ' · March 2026';
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
  const payable = getPayablePayments();
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
  document.getElementById('residentPayNowWrap').style.display = 'none';
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
  const manualModal = document.getElementById('modal-security-manual');
  if (manualModal && !manualModal.classList.contains('hidden')) {
    manualModal.classList.add('hidden');
  }
  renderLogbook();
  handleResidentVisitorNotification(host, name);
  toast(name + ' checked in — ' + host, 'success');
}

function renderLogbook() {
  const list = document.getElementById('securityLogbook');
  const countEl = document.getElementById('logbookCount');
  if (!list) return;
  if (countEl) countEl.textContent = logbook.length + ' visitor' + (logbook.length !== 1 ? 's' : '');
  list.innerHTML = logbook.length === 0
    ? '<p class="text-muted" style="text-align:center;padding:24px;">No visitors today yet.</p>'
    : logbook.map(
        (e, idx) => {
          const timeText = e.checkOut
            ? 'In ' + e.checkIn + ' · Out ' + e.checkOut
            : 'In ' + e.checkIn;
          const statusLabel = e.status === 'onsite' ? 'On-site' : 'Left';
          const checkoutBtn = e.status === 'onsite'
            ? '<button type="button" class="btn-mini" onclick="checkoutVisitor(' + idx + ')">Mark exit</button>'
            : '';
          return (
            '<div class="logbook-item">' +
            '<span class="name">' + escapeHtml(e.name) + '</span>' +
            '<span class="time">' + timeText + '</span>' +
            '<span class="plate">' + escapeHtml(e.plate) + '</span>' +
            '<span class="status ' + e.status + '">' + statusLabel + '</span>' +
            '<span class="host">' + escapeHtml(e.host) + '</span>' +
            checkoutBtn +
            '</div>'
          );
        }
      ).join('');

  // update simple stats
  const today = logbook.length;
  const inside = logbook.filter(e => e.status === 'onsite').length;
  const exited = logbook.filter(e => e.status === 'left').length;
  const tEl = document.getElementById('securityVisitorsToday');
  const iEl = document.getElementById('securityVisitorsInside');
  const eEl = document.getElementById('securityVisitorsExited');
  if (tEl) tEl.textContent = today;
  if (iEl) iEl.textContent = inside;
  if (eEl) eEl.textContent = exited;
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
  if (sheet) sheet.classList.add('open');
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
  if (sheet) sheet.classList.remove('open');
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
function switchNoticeTab(btn) {
  document.querySelectorAll('#noticeTabs .notice-tab').forEach((t) => t.classList.remove('active'));
  btn.classList.add('active');
  const filter = (btn.dataset && btn.dataset.filter) || 'all';
  document.querySelectorAll('#residentNoticeList .notice-card').forEach((card) => {
    const type = card.dataset.type || '';
    const isMaintenance = card.dataset.maintenance === 'true';
    const show =
      filter === 'all' ||
      type === filter ||
      (filter === 'maintenance' && isMaintenance);
    card.style.display = show ? '' : 'none';
  });
  document.querySelectorAll('#residentNoticeList .notice-list-divider').forEach((div) => {
    div.style.display = '';
  });
}

let noticePollVoted = null;
let noticePollTotal = 24;
let noticePollVotes = { yes: 24 * 0.62, no: 24 * 0.38 };

function noticeVote(opt) {
  if (noticePollVoted === opt) return;
  if (!noticePollVoted) {
    noticePollTotal += 1;
    noticePollVotes[opt] += 1;
  } else {
    noticePollVotes[noticePollVoted] -= 1;
    noticePollVotes[opt] += 1;
  }
  noticePollVoted = opt;
  const yp = Math.round((noticePollVotes.yes / noticePollTotal) * 100);
  const np = 100 - yp;
  const pctYes = document.getElementById('noticePollPctYes');
  const pctNo = document.getElementById('noticePollPctNo');
  const barYes = document.getElementById('noticePollBarYes');
  const barNo = document.getElementById('noticePollBarNo');
  if (pctYes) pctYes.textContent = yp + '%';
  if (pctNo) pctNo.textContent = np + '%';
  if (barYes) barYes.style.width = yp + '%';
  if (barNo) barNo.style.width = np + '%';
  ['yes', 'no'].forEach((o) => {
    const el = document.getElementById('noticePollOpt' + (o === 'yes' ? 'Yes' : 'No'));
    if (el) el.classList.toggle('notice-poll-voted', o === noticePollVoted);
  });
  const countEl = document.getElementById('noticePollCount');
  if (countEl) countEl.textContent = noticePollTotal + " votes · your vote is counted ✓";
}

const NOTICE_DETAIL_DATA = {
  water: {
    tags: '<span class="notice-ntag urgent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Urgent</span> <span class="notice-ntag maintenance"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>Maintenance</span>',
    title: 'Water supply off — Friday 7 March',
    date: 'Posted 2 March 2026 · Estate management',
    content: '<p>The main water supply to the estate will be off on <strong>Friday 7 March 2026</strong> from <strong>8:00 AM to 2:00 PM</strong> due to scheduled maintenance on the main pipeline.</p><p>All residents are advised to store sufficient water before Friday morning. The estate tank will be partially topped up on Thursday evening.</p><p>For urgent issues during the maintenance window, contact the estate manager at <strong>+250 788 000 001</strong>.</p>',
  },
  payment: {
    tags: '<span class="notice-ntag general"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Payment</span>',
    title: 'March fees due 10 March',
    date: 'Posted 1 March 2026 · Estate management',
    content: '<p>Monthly service fees for <strong>March 2026</strong> are due by <strong>10 March 2026</strong>. Payments received after the deadline will incur a <strong>10% late penalty</strong> on the outstanding balance.</p><p>You can pay directly through the app via MTN MoMo, Airtel Money, card, or bank transfer. Tap the Payments tab to settle your balance.</p>',
  },
};

function openNoticeDetail(id) {
  const n = NOTICE_DETAIL_DATA[id];
  if (!n) return;
  const tagsEl = document.getElementById('noticeDetailTags');
  const titleEl = document.getElementById('noticeDetailTitle');
  const dateEl = document.getElementById('noticeDetailDate');
  const contentEl = document.getElementById('noticeDetailContent');
  if (tagsEl) tagsEl.innerHTML = n.tags;
  if (titleEl) titleEl.textContent = n.title;
  if (dateEl) dateEl.textContent = n.date;
  if (contentEl) contentEl.innerHTML = n.content;
  const sheet = document.getElementById('noticeDetailSheetBg');
  if (sheet) sheet.classList.add('open');
}

function closeNoticeDetail() {
  const sheet = document.getElementById('noticeDetailSheetBg');
  if (sheet) sheet.classList.remove('open');
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

// Init: ensure welcome is shown and resident QR drawn when entering resident view
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  showView('welcome');
  drawQRPlaceholder(RESIDENT_UNIT);
  updateQrExpiryLabel();
  initCommunityDropdown();
});

// Close resident notifications when clicking outside (backdrop handles most cases; this is a fallback)
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('residentNotifPanel');
  const wrap = document.querySelector('.resident-notif-wrap');
  if (!dropdown || !dropdown.classList.contains('open')) return;
  if (dropdown.contains(e.target) || (wrap && wrap.contains(e.target))) return;
  closeResidentNotifications();
});

function openSecurityManualEntry() {
  const modal = document.getElementById('modal-security-manual');
  if (modal) modal.classList.remove('hidden');
}

function securityScanPlaceholder() {
  toast('QR scanning will be added in the full version. For now, use Manual entry.', 'info');
}

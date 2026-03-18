/* ─── THEME (shared between admin & app via localStorage) ───────────────── */
const WELLAGE_THEME_KEY = 'wellage-theme';

function applyTheme(theme) {
  const html = document.documentElement;
  const dark = theme === 'dark';
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  const sunMoonHtml = dark
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  document.querySelectorAll('.theme-icon').forEach(function (el) { el.innerHTML = sunMoonHtml; });
  const icon = document.getElementById('themeIcon');
  if (icon) icon.innerHTML = sunMoonHtml;
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
  dashboard: { title: 'Overview',   sub: 'Monday, 2 March 2026' },
  payments:  { title: 'Payments',   sub: 'Track and manage resident payments' },
  visitors:  { title: 'Visitors',   sub: 'Digital access logbook' },
  notices:   { title: 'Notices',    sub: 'Community announcements and polls' },
  residents: { title: 'Residents',  sub: 'Manage district residents' },
  incidents: { title: 'Incidents',  sub: 'Incident history & status' },
};

function navTo(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');
  // Auto-find sidebar nav item if btn not passed
  if (!btn) {
    const autoBtn = document.querySelector('.sb-nav-item[onclick*="navTo(\'' + page + '\'"]');
    if (autoBtn) autoBtn.classList.add('active');
  }
  const info = pageTitles[page] || { title: page, sub: '' };
  document.getElementById('pageTitle').textContent = info.title;
  document.getElementById('pageSubtitle').textContent = info.sub;
  if (page === 'residents') { renderPendingResidents(); applyResidentFilters(); }
  if (page === 'payments') applyPaymentsFilters();
  if (page === 'notices') renderNotices();
  if (page === 'visitors') applyVisitorFilters();
  if (page === 'incidents') renderWebIncidents();
}

/* ─── PAYMENTS (data-driven) ─────────────────────────── */
let paymentsData = [
  { id: 1, name: 'Kamana Eric', initials: 'KE', unit: 'B-04', service: 'Security + Cleaning', amount: 25000, date: 'Mar 1, 2026', status: 'paid', method: 'Cash', period: 'March 2026' },
  { id: 2, name: 'Uwase Claire', initials: 'UC', unit: 'A-08', service: 'Security + Cleaning', amount: 25000, date: '—', status: 'pending', method: 'Cash', period: 'March 2026' },
  { id: 3, name: 'Ndayishimiye J.', initials: 'NJ', unit: 'C-11', service: 'Security + Cleaning', amount: 25000, date: 'Feb 28, 2026', status: 'paid', method: 'Mobile Money', period: 'March 2026' },
  { id: 4, name: 'Mugisha Patrick', initials: 'MP', unit: 'A-03', service: 'Security + Cleaning', amount: 25000, date: '—', status: 'overdue', method: 'Cash', period: 'March 2026' },
  { id: 5, name: 'Cyiza Vestine', initials: 'CV', unit: 'D-07', service: 'Security + Cleaning', amount: 25000, date: 'Mar 2, 2026', status: 'paid', method: 'Bank Transfer', period: 'March 2026' },
  { id: 6, name: 'Habimana Joel', initials: 'HJ', unit: 'B-09', service: 'Security + Cleaning', amount: 25000, date: '—', status: 'pending', method: 'Cash', period: 'March 2026' },
  { id: 7, name: 'Ingabire Sandra', initials: 'IS', unit: 'C-05', service: 'Security + Cleaning', amount: 25000, date: 'Mar 1, 2026', status: 'paid', method: 'Cash', period: 'March 2026' },
  { id: 8, name: 'Nkurunziza T.', initials: 'NT', unit: 'A-14', service: 'Security + Cleaning', amount: 25000, date: '—', status: 'overdue', method: 'Cash', period: 'March 2026' },
];
let paymentsSortKey = null;
let paymentsSortDir = 1;
let paymentsCtxTarget = null;
let paymentsDrawerTarget = null;

function getPaymentInitials(name) {
  return name.split(' ').slice(0, 2).map(function (n) { return n[0]; }).join('').toUpperCase();
}

function applyPaymentsFilters() {
  const searchInp = document.getElementById('search-inp');
  const statusFilter = document.getElementById('status-filter');
  const monthFilter = document.getElementById('month-filter');
  const tableTitle = document.getElementById('table-title');
  const tableMeta = document.getElementById('table-meta');
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('payments-empty-state');
  if (!searchInp || !statusFilter || !monthFilter || !tbody) return;

  const q = (searchInp.value || '').toLowerCase();
  const sf = statusFilter.value;
  const mf = monthFilter.value;
  if (tableTitle) tableTitle.textContent = 'Payment Records — ' + mf;

  let rows = paymentsData.filter(function (p) {
    const matchQ = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.unit && p.unit.toLowerCase().includes(q));
    const matchS = !sf || p.status === sf;
    const matchM = p.period === mf;
    return matchQ && matchS && matchM;
  });

  if (paymentsSortKey) {
    rows = rows.slice().sort(function (a, b) {
      let av = a[paymentsSortKey];
      let bv = b[paymentsSortKey];
      if (paymentsSortKey === 'amount') { av = +av; bv = +bv; }
      if (av > bv) return paymentsSortDir;
      if (av < bv) return -paymentsSortDir;
      return 0;
    });
  }

  if (tableMeta) tableMeta.textContent = rows.length + ' result' + (rows.length !== 1 ? 's' : '');

  if (rows.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = rows.map(function (p) {
      const statusLabel = (p.status && p.status.charAt(0).toUpperCase() + p.status.slice(1)) || p.status;
      return '<tr onclick="openPaymentDrawer(' + p.id + ')">' +
        '<td><div class="td-resident"><div class="td-av">' + (p.initials || getPaymentInitials(p.name)) + '</div><span class="td-name">' + escapeHtml(p.name) + '</span></div></td>' +
        '<td><span class="td-unit">' + escapeHtml(p.unit) + '</span></td>' +
        '<td style="color:#3D5349">' + escapeHtml(p.service) + '</td>' +
        '<td class="td-amount">' + (p.amount ? p.amount.toLocaleString() : '') + ' RWF</td>' +
        '<td class="td-date">' + (p.date || '—') + '</td>' +
        '<td><span class="status-chip ' + (p.status || '') + '">' + statusLabel + '</span></td>' +
        '<td><button type="button" class="action-btn" onclick="event.stopPropagation(); openPaymentCtx(event, ' + p.id + ')">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button></td>' +
        '</tr>';
    }).join('');
  }
  updatePaymentsStats();
}

function updatePaymentsStats() {
  const monthFilter = document.getElementById('month-filter');
  const sCollected = document.getElementById('s-collected');
  const sCollectedSub = document.getElementById('s-collected-sub');
  const sPending = document.getElementById('s-pending');
  const sOverdue = document.getElementById('s-overdue');
  const sRate = document.getElementById('s-rate');
  const navBadge = document.getElementById('nav-badge-payments');
  if (!monthFilter) return;

  const mf = monthFilter.value;
  const month = paymentsData.filter(function (p) { return p.period === mf; });
  const paid = month.filter(function (p) { return p.status === 'paid'; });
  const pending = month.filter(function (p) { return p.status === 'pending'; });
  const overdue = month.filter(function (p) { return p.status === 'overdue'; });
  const collected = paid.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
  const rate = month.length ? Math.round(paid.length / month.length * 1000) / 10 : 0;

  if (sCollected) sCollected.textContent = collected.toLocaleString() + ' RWF';
  if (sCollectedSub) sCollectedSub.textContent = paid.length + ' resident' + (paid.length !== 1 ? 's' : '');
  const pendingAmt = pending.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
  const overdueAmt = overdue.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
  if (sPending) sPending.textContent = pending.length;
  const sPendingAmt = document.getElementById('p-pending-amt');
  if (sPendingAmt) sPendingAmt.textContent = pendingAmt.toLocaleString() + ' RWF';
  if (sOverdue) sOverdue.textContent = overdue.length;
  const sOverdueAmt = document.getElementById('p-overdue-amt');
  if (sOverdueAmt) sOverdueAmt.textContent = overdueAmt.toLocaleString() + ' RWF';
  if (sRate) sRate.textContent = rate + '%';

  const pendingTotal = paymentsData.filter(function (p) { return p.status === 'pending' || p.status === 'overdue'; }).length;
  if (navBadge) {
    navBadge.textContent = pendingTotal;
    navBadge.style.display = pendingTotal > 0 ? '' : 'none';
  }
}

function sortPaymentsTable(key) {
  if (paymentsSortKey === key) { paymentsSortDir *= -1; } else { paymentsSortKey = key; paymentsSortDir = 1; }
  var ths = document.querySelectorAll('#page-payments .table-wrap thead th');
  ths.forEach(function (th) { th.classList.remove('sort-asc', 'sort-desc'); });
  var keys = ['name', 'unit', null, 'amount', 'date', 'status'];
  var idx = keys.indexOf(key);
  if (idx >= 0 && ths[idx]) ths[idx].classList.add(paymentsSortDir === 1 ? 'sort-asc' : 'sort-desc');
  applyPaymentsFilters();
}

function openPaymentDrawer(id) {
  var p = paymentsData.find(function (x) { return x.id === id; });
  if (!p) return;
  paymentsDrawerTarget = p;
  document.getElementById('d-name').textContent = p.name || '—';
  document.getElementById('d-month').textContent = p.period || '—';
  document.getElementById('d-unit').textContent = p.unit || '—';
  document.getElementById('d-service').textContent = p.service || '—';
  document.getElementById('d-amount').textContent = (p.amount ? p.amount.toLocaleString() : '') + ' RWF';
  document.getElementById('d-period').textContent = p.period || '—';
  document.getElementById('d-date').textContent = p.date || '—';
  var statusLabel = (p.status && p.status.charAt(0).toUpperCase() + p.status.slice(1)) || p.status;
  document.getElementById('d-status').innerHTML = '<span class="status-chip ' + (p.status || '') + '">' + (statusLabel || '—') + '</span>';
  document.getElementById('d-method').textContent = p.method || '—';
  var actions = document.getElementById('d-actions');
  if (actions) actions.style.display = p.status === 'paid' ? 'none' : 'flex';
  document.getElementById('payment-drawer-bg').classList.add('open');
}
function closePaymentDrawer() {
  document.getElementById('payment-drawer-bg').classList.remove('open');
  paymentsDrawerTarget = null;
}
function approveFromPaymentDrawer() {
  if (!paymentsDrawerTarget) return;
  updatePaymentStatus(paymentsDrawerTarget.id, 'paid');
  closePaymentDrawer();
  showPaymentToast('Payment approved');
}
function rejectFromPaymentDrawer() {
  if (!paymentsDrawerTarget) return;
  updatePaymentStatus(paymentsDrawerTarget.id, 'overdue');
  closePaymentDrawer();
  showPaymentToast('Payment rejected');
}

function openPaymentCtx(e, id) {
  e.stopPropagation();
  paymentsCtxTarget = id;
  var p = paymentsData.find(function (x) { return x.id === id; });
  var approveItem = document.getElementById('ctx-approve-item');
  if (approveItem) approveItem.style.display = (p && p.status === 'paid') ? 'none' : '';
  var menu = document.getElementById('payment-ctx-menu');
  if (!menu) return;
  menu.classList.remove('open');
  var rect = e.currentTarget.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = (rect.right - 170) + 'px';
  requestAnimationFrame(function () { menu.classList.add('open'); });
}
function closePaymentCtx() {
  var menu = document.getElementById('payment-ctx-menu');
  if (menu) menu.classList.remove('open');
}
document.addEventListener('click', closePaymentCtx);

function paymentCtxView() {
  if (paymentsCtxTarget) openPaymentDrawer(paymentsCtxTarget);
  closePaymentCtx();
}
function paymentCtxApprove() {
  if (paymentsCtxTarget) {
    updatePaymentStatus(paymentsCtxTarget, 'paid');
    showPaymentToast('Payment approved');
  }
  closePaymentCtx();
}
function paymentCtxSendReminder() {
  if (paymentsCtxTarget) {
    var p = paymentsData.find(function (x) { return x.id === paymentsCtxTarget; });
    showPaymentToast('Reminder sent to ' + (p && p.name ? p.name : 'resident'));
  }
  closePaymentCtx();
}
function paymentCtxDelete() {
  if (paymentsCtxTarget) {
    var p = paymentsData.find(function (x) { return x.id === paymentsCtxTarget; });
    if (confirm('Delete payment record for ' + (p && p.name ? p.name : 'this resident') + '?')) {
      paymentsData = paymentsData.filter(function (x) { return x.id !== paymentsCtxTarget; });
      applyPaymentsFilters();
      showPaymentToast('Record deleted');
    }
  }
  closePaymentCtx();
}

function updatePaymentStatus(id, status) {
  var p = paymentsData.find(function (x) { return x.id === id; });
  if (!p) return;
  p.status = status;
  if (status === 'paid') {
    var today = new Date();
    p.date = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  applyPaymentsFilters();
}

function openPaymentModal() {
  document.getElementById('payment-modal-bg').classList.add('open');
}
function closePaymentModal(ev) {
  if (ev && ev.target && ev.target.closest && ev.target.closest('.payment-modal')) return;
  var bg = document.getElementById('payment-modal-bg');
  if (bg) bg.classList.remove('open');
}
function submitPaymentRecord() {
  var name = (document.getElementById('m-name') && document.getElementById('m-name').value) ? document.getElementById('m-name').value.trim() : '';
  var unit = (document.getElementById('m-unit') && document.getElementById('m-unit').value) ? document.getElementById('m-unit').value.trim() : '';
  var amountEl = document.getElementById('m-amount');
  var amount = amountEl ? parseInt(amountEl.value, 10) : 0;
  if (isNaN(amount)) amount = 0;
  var method = (document.getElementById('m-method') && document.getElementById('m-method').value) || 'Cash';
  var service = (document.getElementById('m-service') && document.getElementById('m-service').value) || 'Security + Cleaning';
  var period = (document.getElementById('m-period') && document.getElementById('m-period').value) || 'March 2026';
  var status = (document.getElementById('m-status') && document.getElementById('m-status').value) || 'paid';

  if (!name || !unit || !amount) {
    showPaymentToast('Please fill in name, unit and amount');
    return;
  }

  var maxId = paymentsData.reduce(function (m, p) { return p.id > m ? p.id : m; }, 0);
  var newId = maxId + 1;
  var today = new Date();
  var dateStr = status === 'paid' ? today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  var initials = getPaymentInitials(name);

  paymentsData.unshift({ id: newId, name: name, initials: initials, unit: unit, service: service, amount: amount, date: dateStr, status: status, method: method, period: period });

  var monthFilter = document.getElementById('month-filter');
  if (monthFilter) monthFilter.value = period;
  applyPaymentsFilters();
  closePaymentModal();
  showPaymentToast('Payment recorded for ' + name);

  if (document.getElementById('m-name')) document.getElementById('m-name').value = '';
  if (document.getElementById('m-unit')) document.getElementById('m-unit').value = '';
  if (document.getElementById('m-amount')) document.getElementById('m-amount').value = '';
}

function showPaymentToast(msg) {
  var msgEl = document.getElementById('payment-toast-msg');
  var toastEl = document.getElementById('payment-toast');
  if (msgEl) msgEl.textContent = msg || 'Done';
  if (toastEl) {
    toastEl.classList.add('show');
    clearTimeout(toastEl._paymentToastTimer);
    toastEl._paymentToastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2800);
  }
}

/* ─── VISITORS (logbook) ─────────────────────── */
var VISITORS_DATA = [
  { id: 1, hostName: 'Kamana Eric',    hostInitials: 'KE', hostPhone: '+250 788 123 001', plate: 'RAC 441B', host: 'C-02', checkIn: '09:17 AM', checkOut: null,       status: 'onsite' },
  { id: 2, hostName: 'Uwase Claire',   hostInitials: 'UC', hostPhone: '+250 788 123 002', plate: 'RAD 209C', host: 'A-07', checkIn: '08:45 AM', checkOut: '10:30 AM', status: 'left'   },
  { id: 3, hostName: 'Nkusi Jean',     hostInitials: 'NJ', hostPhone: '+250 788 123 003', plate: null,       host: 'B-06', checkIn: '07:30 AM', checkOut: '09:00 AM', status: 'left'   },
  { id: 4, hostName: 'Mutoni Alice',   hostInitials: 'MA', hostPhone: '+250 788 123 004', plate: 'RAB 774D', host: 'D-11', checkIn: '10:05 AM', checkOut: null,       status: 'onsite' },
  { id: 5, hostName: 'Habimana P.',    hostInitials: 'HP', hostPhone: '+250 788 123 005', plate: null,       host: 'A-03', checkIn: '06:50 AM', checkOut: '08:30 AM', status: 'left'   },
  { id: 6, hostName: 'Ingabire M.',    hostInitials: 'IM', hostPhone: '+250 788 123 006', plate: 'RAC 008A', host: 'C-09', checkIn: '11:20 AM', checkOut: null,       status: 'onsite' },
  { id: 7, hostName: 'Bizimana T.',    hostInitials: 'BT', hostPhone: '+250 788 123 007', plate: null,       host: 'B-04', checkIn: '07:00 AM', checkOut: '09:45 AM', status: 'left'   }
];

function openVisitorModal() {
  var bg = document.getElementById('visitor-modal-bg');
  if (bg) bg.classList.add('open');
}

function closeVisitorModal() {
  var bg = document.getElementById('visitor-modal-bg');
  if (bg) bg.classList.remove('open');
}

function submitVisitorCheckin() {
  var nameEl = document.getElementById('v-name');
  var hostEl = document.getElementById('v-host');
  var plateEl = document.getElementById('v-plate');
  var phoneEl = document.getElementById('v-phone');
  var name = nameEl ? nameEl.value.trim() : '';
  var host = hostEl ? hostEl.value.trim() : '';
  var plate = plateEl ? plateEl.value.trim() : '';
  var phone = phoneEl ? phoneEl.value.trim() : '';
  if (!name || !host) {
    toast('Visitor name and host unit are required.', 'error');
    return;
  }
  var now = new Date();
  var time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  var maxId = VISITORS_DATA.reduce(function (m, v) { return v.id > m ? v.id : m; }, 0);
  var newId = maxId + 1;
  var initials = getInitials(name);
  VISITORS_DATA.unshift({
    id: newId,
    name: name,
    initials: initials,
    phone: phone || null,
    plate: plate || null,
    host: host,
    checkIn: time,
    checkOut: null,
    status: 'onsite'
  });
  applyVisitorFilters();
  closeVisitorModal();
  toast(name + ' checked in — ' + host + '.', 'success');
  if (nameEl) nameEl.value = '';
  if (hostEl) hostEl.value = '';
  if (plateEl) plateEl.value = '';
  if (phoneEl) phoneEl.value = '';
}

function applyVisitorFilters() {
  var searchEl = document.getElementById('vis-search');
  var statusEl = document.getElementById('vis-status-filter');
  if (!searchEl || !statusEl) return;
  var q = (searchEl.value || '').toLowerCase();
  var sf = statusEl.value;
  var rows = VISITORS_DATA.filter(function (v) {
    var matchQ = !q ||
      (v.hostName && v.hostName.toLowerCase().includes(q)) ||
      (v.host && v.host.toLowerCase().includes(q)) ||
      ((v.hostPhone || '').toLowerCase().includes(q)) ||
      ((v.plate || '').toLowerCase().includes(q));
    var matchS = !sf || v.status === sf;
    return matchQ && matchS;
  });
  renderVisitorTable(rows);
  updateVisitorStats();
}

function renderVisitorTable(rows) {
  var tbody = document.getElementById('vis-table-body');
  var empty = document.getElementById('vis-empty-state');
  var meta = document.getElementById('vis-table-meta');
  if (!tbody) return;
  if (meta) meta.textContent = (rows.length || 0) + ' entr' + (rows.length === 1 ? 'y' : 'ies');
  if (!rows.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = rows.map(function (v) {
    var phoneText = v.hostPhone || '—';
    var plateHtml = v.plate
      ? '<span class="td-plate">' + v.plate + '</span>'
      : '<span class="td-plate none">—</span>';
    var checkOutClass = v.checkOut ? 'td-time' : 'td-time none';
    var checkOutText = v.checkOut || '—';
    var statusLabel = v.status === 'onsite' ? 'On-site' : 'Left';
    return '' +
      '<tr>' +
      '<td><div class="td-visitor"><div class="td-av">' + (v.hostInitials || '') + '</div><span class="td-name">' + (v.hostName || '—') + '</span></div></td>' +
      '<td>' + phoneText + '</td>' +
      '<td>' + plateHtml + '</td>' +
      '<td><span class="td-host">' + v.host + '</span></td>' +
      '<td class="td-time">' + v.checkIn + '</td>' +
      '<td class="' + checkOutClass + '">' + checkOutText + '</td>' +
      '<td><span class="status-chip ' + v.status + '">' + statusLabel + '</span></td>' +
      '<td></td>' +
      '</tr>';
  }).join('');
}

function updateVisitorStats() {
  var onsite = VISITORS_DATA.filter(function (v) { return v.status === 'onsite'; }).length;
  var left = VISITORS_DATA.filter(function (v) { return v.status === 'left'; }).length;
  var total = VISITORS_DATA.length;

  var sOnsite = document.getElementById('vis-s-onsite');
  var sToday = document.getElementById('vis-s-today');
  var sLeft = document.getElementById('vis-s-left');
  var liveCount = document.getElementById('vis-live-count');
  var sumCheckins = document.getElementById('vis-sum-checkins');
  var sumCheckouts = document.getElementById('vis-sum-checkouts');

  if (sOnsite) sOnsite.textContent = onsite;
  if (sToday) sToday.textContent = total;
  if (sLeft) sLeft.textContent = left;
  if (liveCount) liveCount.textContent = onsite;
  if (sumCheckins) sumCheckins.textContent = total;
  if (sumCheckouts) sumCheckouts.textContent = left;
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

/* ─── NOTICES (data-driven) ────────────────────── */
var noticesData = [
  {id:1, type:'urgent', title:'Water Maintenance — Friday 7 Mar', body:'Water supply will be interrupted from 8:00 AM to 2:00 PM on Friday due to scheduled pipe maintenance. Please store water in advance.', audience:'All residents', date:'Mar 2, 2026', pinned:true, poll:null},
  {id:2, type:'general', title:'March Payment Deadline — 10 March', body:'Reminder that monthly service fees are due by 10 March 2026. Late payments will incur a 10% penalty. Use Mobile Money or upload your receipt.', audience:'All residents', date:'Mar 1, 2026', pinned:false, poll:null},
  {id:3, type:'poll', title:'New Gate Opening Hours — Vote Now', body:'Should the main gate extend its operating hours to midnight on weekends? Cast your vote before 5 March.', audience:'All residents', date:'Feb 28, 2026', pinned:false, poll:{question:'Extend gate hours to midnight on weekends?', options:[{label:'Yes, extend hours',votes:23},{label:'No, keep current hours',votes:11}]}},
  {id:4, type:'info', title:'Community Meeting — 15 March', body:'Quarterly community meeting scheduled for Saturday 15 March at 10:00 AM in the community hall. Agenda: security review and landscaping proposal.', audience:'All residents', date:'Feb 26, 2026', pinned:false, poll:null},
];

var noticeActiveFilter = '';
var noticeSelectedType = 'general';

var noticeTypeIcons = {
  urgent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  general: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  poll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
};

function renderNotices() {
  var searchEl = document.getElementById('notice-search');
  var q = searchEl ? searchEl.value.toLowerCase() : '';
  var rows = noticesData.filter(function(n) {
    var matchF = !noticeActiveFilter || n.type === noticeActiveFilter;
    var matchQ = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    return matchF && matchQ;
  });
  rows.sort(function(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });

  var list = document.getElementById('notices-list');
  var empty = document.getElementById('notices-empty');
  if (!list) return;

  if (rows.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    updateNoticeCounts();
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = rows.map(function(n) {
    var totalVotes = n.poll ? n.poll.options.reduce(function(s, o) { return s + o.votes; }, 0) : 0;
    var pollHTML = '';
    if (n.poll) {
      pollHTML = '<div class="poll-bar-wrap">' +
        n.poll.options.map(function(o) {
          var pct = totalVotes ? Math.round(o.votes / totalVotes * 100) : 0;
          return '<div class="poll-option"><div class="poll-option-label"><span>' + o.label + '</span><span>' + pct + '%</span></div><div class="poll-track"><div class="poll-fill" style="width:' + pct + '%"></div></div></div>';
        }).join('') +
        '<div style="font-size:11px;color:#B8CCC7;margin-top:6px">' + totalVotes + ' votes</div></div>';
    }

    var pinnedBadge = n.pinned ? '<span class="pinned-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="10" height="10"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>Pinned</span>' : '';
    var pinBtn = n.pinned ? '' : '<button class="icon-btn" title="Pin" onclick="toggleNoticePin(' + n.id + ',event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg></button>';

    return '<div class="notice-card" id="nc-' + n.id + '">' +
      '<div class="notice-bar ' + n.type + '"></div>' +
      '<div class="notice-inner">' +
        '<div class="notice-ic ' + n.type + '">' + (noticeTypeIcons[n.type] || '') + '</div>' +
        '<div class="notice-body">' +
          '<div class="notice-top"><span class="notice-tag ' + n.type + '">' + n.type.toUpperCase() + '</span>' + pinnedBadge + '</div>' +
          '<div class="notice-title">' + n.title + '</div>' +
          '<div class="notice-text">' + n.body + '</div>' +
          pollHTML +
          '<div class="notice-foot">' +
            '<span class="notice-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + n.date + '</span>' +
            '<span class="audience-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' + n.audience + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="notice-right"><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">' +
        pinBtn +
        '<button class="icon-btn danger" title="Delete" onclick="deleteNoticeCard(' + n.id + ',event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>' +
      '</div></div>' +
    '</div>';
  }).join('');

  updateNoticeCounts();
}

function updateNoticeCounts() {
  var counts = { urgent: 0, general: 0, poll: 0, info: 0 };
  noticesData.forEach(function(n) { counts[n.type]++; });
  var el;
  el = document.getElementById('pill-all'); if (el) el.textContent = noticesData.length;
  el = document.getElementById('pill-urgent'); if (el) el.textContent = counts.urgent;
  el = document.getElementById('pill-general'); if (el) el.textContent = counts.general;
  el = document.getElementById('pill-poll'); if (el) el.textContent = counts.poll;
  el = document.getElementById('pill-info'); if (el) el.textContent = counts.info;
  el = document.getElementById('sm-total'); if (el) el.textContent = noticesData.length;
  el = document.getElementById('sm-urgent'); if (el) el.textContent = counts.urgent;
  el = document.getElementById('sm-polls'); if (el) el.textContent = counts.poll;
  el = document.getElementById('nav-badge-notices'); if (el) el.textContent = noticesData.length;
}

function setNoticeFilter(btn) {
  document.querySelectorAll('#page-notices .n-filter-pill').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  noticeActiveFilter = btn.getAttribute('data-filter');
  renderNotices();
}

function toggleNoticePin(id, e) {
  e.stopPropagation();
  var n = noticesData.find(function(x) { return x.id === id; });
  if (!n) return;
  n.pinned = !n.pinned;
  renderNotices();
  toast(n.pinned ? 'Notice pinned' : 'Notice unpinned', 'success');
}

function deleteNoticeCard(id, e) {
  e.stopPropagation();
  var n = noticesData.find(function(x) { return x.id === id; });
  if (!n) return;
  var el = document.getElementById('nc-' + id);
  if (el) { el.style.transition = 'opacity 0.2s, transform 0.2s'; el.style.opacity = '0'; el.style.transform = 'translateY(-4px)'; }
  setTimeout(function() {
    noticesData = noticesData.filter(function(x) { return x.id !== id; });
    renderNotices();
    toast('Notice deleted', 'success');
  }, 200);
}

function openNoticeModal() {
  var bg = document.getElementById('notice-modal-bg');
  if (bg) bg.classList.add('open');
}
function closeNoticeModal() {
  var bg = document.getElementById('notice-modal-bg');
  if (bg) bg.classList.remove('open');
}

function selectNoticeType(el) {
  document.querySelectorAll('.type-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  noticeSelectedType = el.getAttribute('data-type');
}

function submitNewNotice() {
  var titleEl = document.getElementById('notice-m-title');
  var bodyEl = document.getElementById('notice-m-body');
  var audienceEl = document.getElementById('notice-m-audience');
  var pinEl = document.getElementById('notice-m-pin');
  var title = titleEl ? titleEl.value.trim() : '';
  var body = bodyEl ? bodyEl.value.trim() : '';
  var audience = audienceEl ? audienceEl.value : 'All residents';
  var pin = pinEl ? pinEl.value === 'yes' : false;
  if (!title || !body) { toast('Title and message are required', 'error'); return; }
  var today = new Date();
  var dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  var maxId = noticesData.reduce(function(m, n) { return n.id > m ? n.id : m; }, 0);
  noticesData.unshift({ id: maxId + 1, type: noticeSelectedType, title: title, body: body, audience: audience, date: dateStr, pinned: pin, poll: null });
  renderNotices();
  closeNoticeModal();
  toast('Notice published', 'success');
  if (titleEl) titleEl.value = '';
  if (bodyEl) bodyEl.value = '';
}

function submitResident() {
  closeModal('modal-addResident');
  toast('Resident added successfully.', 'success');
}

/* ─── RESIDENTS PAGE (data-driven) ───────────────────── */
var residentsData = [
  {id:1, first:'Kamana',      last:'Eric',       unit:'B-04', phone:'+250 788 123 456', joined:'Jan 2024', payment:'paid'},
  {id:2, first:'Uwase',       last:'Claire',     unit:'A-08', phone:'+250 782 234 567', joined:'Mar 2024', payment:'pending'},
  {id:3, first:'Ndayishimiye',last:'J.',          unit:'C-11', phone:'+250 795 345 678', joined:'Jun 2024', payment:'paid'},
  {id:4, first:'Mugisha',     last:'Patrick',    unit:'A-03', phone:'+250 788 456 789', joined:'Sep 2023', payment:'overdue'},
  {id:5, first:'Cyiza',       last:'Vestine',    unit:'D-07', phone:'+250 780 567 890', joined:'Feb 2024', payment:'paid'},
  {id:6, first:'Habimana',    last:'Joel',       unit:'B-09', phone:'+250 783 678 901', joined:'Nov 2023', payment:'pending'},
  {id:7, first:'Ingabire',    last:'Sandra',     unit:'C-05', phone:'+250 784 789 012', joined:'Apr 2024', payment:'paid'},
  {id:8, first:'Nkurunziza',  last:'T.',         unit:'A-14', phone:'+250 783 890 123', joined:'Jul 2024', payment:'overdue'},
  {id:9, first:'Uwimana',     last:'Aline',      unit:'D-02', phone:'+250 788 901 234', joined:'Aug 2024', payment:'paid'},
  {id:10,first:'Iradukunda',  last:'Pascal',     unit:'B-12', phone:'+250 782 012 345', joined:'Oct 2023', payment:'paid'},
  {id:11,first:'Mukamana',    last:'Diane',      unit:'C-02', phone:'+250 780 123 456', joined:'Dec 2023', payment:'pending'},
  {id:12,first:'Nzeyimana',   last:'Samuel',     unit:'A-07', phone:'+250 785 234 567', joined:'Feb 2023', payment:'paid'},
];

var residentPaymentHistory = {
  paid:    [{period:'March 2026',amount:'25,000 RWF',status:'paid'},{period:'February 2026',amount:'25,000 RWF',status:'paid'},{period:'January 2026',amount:'25,000 RWF',status:'paid'}],
  pending: [{period:'March 2026',amount:'25,000 RWF',status:'pending'},{period:'February 2026',amount:'25,000 RWF',status:'paid'},{period:'January 2026',amount:'25,000 RWF',status:'paid'}],
  overdue: [{period:'March 2026',amount:'25,000 RWF',status:'overdue'},{period:'February 2026',amount:'25,000 RWF',status:'overdue'},{period:'January 2026',amount:'25,000 RWF',status:'paid'}],
};

var resSortKey = null, resSortDir = 1, resCtxTarget = null, resDrawerTarget = null;

function resInitials(r) { return (r.first[0] + (r.last[0] || '')).toUpperCase(); }
function resFullName(r) { return r.first + ' ' + r.last; }
function resBlockOf(r)  { return r.unit.split('-')[0]; }

function applyResidentFilters() {
  var q  = (document.getElementById('res-search') || {value:''}).value.toLowerCase();
  var pf = (document.getElementById('res-payment-filter') || {value:''}).value;
  var bf = (document.getElementById('res-block-filter') || {value:''}).value;

  var rows = residentsData.filter(function(r) {
    var matchQ = !q || resFullName(r).toLowerCase().includes(q) || r.unit.toLowerCase().includes(q) || r.phone.includes(q);
    var matchP = !pf || r.payment === pf;
    var matchB = !bf || resBlockOf(r) === bf;
    return matchQ && matchP && matchB;
  });

  if (resSortKey) {
    rows = rows.slice().sort(function(a, b) {
      var av = resSortKey==='name'?resFullName(a):resSortKey==='unit'?a.unit:resSortKey==='joined'?a.joined:resSortKey==='payment'?a.payment:'';
      var bv = resSortKey==='name'?resFullName(b):resSortKey==='unit'?b.unit:resSortKey==='joined'?b.joined:resSortKey==='payment'?b.payment:'';
      return av > bv ? resSortDir : av < bv ? -resSortDir : 0;
    });
  }

  var tbody = document.getElementById('res-table-body');
  var empty = document.getElementById('res-empty');
  var meta  = document.getElementById('r-table-meta');
  var title = document.getElementById('r-table-title');
  if (!tbody) return;

  if (bf && title) title.textContent = 'Block ' + bf + ' Residents';
  else if (title) title.textContent = 'All Residents';
  if (meta) meta.textContent = rows.length + ' resident' + (rows.length !== 1 ? 's' : '');

  if (!rows.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    renderResidentSidePanel();
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = rows.map(function(r) {
    var avClass = 'td-av' + (r.payment==='overdue' ? ' r-overdue' : r.payment==='pending' ? ' r-pending' : ' r-paid');
    var chip = '<span class="r-status-chip ' + r.payment + '">' + r.payment.charAt(0).toUpperCase() + r.payment.slice(1) + '</span>';
    return '<tr onclick="openResidentDrawer(' + r.id + ')">' +
      '<td><div class="td-resident"><div class="' + avClass + '">' + resInitials(r) + '</div><span class="td-name">' + resFullName(r) + '</span></div></td>' +
      '<td><span class="td-unit">' + r.unit + '</span></td>' +
      '<td class="td-phone">' + r.phone + '</td>' +
      '<td class="td-joined">' + r.joined + '</td>' +
      '<td>' + chip + '</td>' +
      '<td><button class="action-btn" onclick="event.stopPropagation();openResidentCtx(event,' + r.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button></td>' +
    '</tr>';
  }).join('');

  updateResidentStats();
  renderResidentSidePanel();
}

function sortResidentTable(key) {
  if (resSortKey === key) resSortDir *= -1; else { resSortKey = key; resSortDir = 1; }
  var keyMap = {name:0, unit:1, joined:3, payment:4};
  document.querySelectorAll('#res-table-body').length && document.querySelectorAll('#page-residents thead th').forEach(function(th) {
    th.classList.remove('sort-asc','sort-desc');
  });
  var idx = keyMap[key];
  var ths = document.querySelectorAll('#page-residents thead th');
  if (ths[idx]) ths[idx].classList.add(resSortDir === 1 ? 'sort-asc' : 'sort-desc');
  applyResidentFilters();
}

function updateResidentStats() {
  var FEE     = 25000;
  var total   = residentsData.length;
  var paid    = residentsData.filter(function(r){ return r.payment==='paid'; }).length;
  var pending = residentsData.filter(function(r){ return r.payment==='pending'; }).length;
  var overdue = residentsData.filter(function(r){ return r.payment==='overdue'; }).length;
  var el;
  el = document.getElementById('s-total');       if (el) el.textContent = total;
  el = document.getElementById('s-paid');        if (el) el.textContent = paid;
  el = document.getElementById('s-paid-rate');   if (el) el.textContent = (total ? Math.round(paid/total*100) : 0) + '% collection';
  el = document.getElementById('rs-pending');     if (el) el.textContent = pending;
  el = document.getElementById('rs-pending-amt'); if (el) el.textContent = (pending * FEE).toLocaleString() + ' RWF';
  el = document.getElementById('rs-overdue');     if (el) el.textContent = overdue;
  el = document.getElementById('rs-overdue-amt'); if (el) el.textContent = (overdue * FEE).toLocaleString() + ' RWF';
}

function renderResidentSidePanel() {
  var blocks = {A:[],B:[],C:[],D:[]};
  residentsData.forEach(function(r) { var b = resBlockOf(r); if (blocks[b]) blocks[b].push(r); });
  var blockListEl = document.getElementById('r-block-list');
  if (blockListEl) {
    blockListEl.innerHTML = Object.keys(blocks).map(function(b) {
      var rs = blocks[b];
      var paid = rs.filter(function(r){ return r.payment==='paid'; }).length;
      return '<div class="r-block-row" onclick="filterResidentByBlock(\'' + b + '\')">' +
        '<div class="r-block-ic">' + b + '</div>' +
        '<div class="r-block-info"><div class="r-block-name">Block ' + b + '</div><div class="r-block-sub">' + rs.length + ' unit' + (rs.length!==1?'s':'') + ' · ' + paid + ' paid</div></div>' +
        '<div class="r-block-count">' + rs.length + '</div>' +
      '</div>';
    }).join('');
  }
  var total   = residentsData.length || 1;
  var paid    = residentsData.filter(function(r){ return r.payment==='paid'; }).length;
  var pending = residentsData.filter(function(r){ return r.payment==='pending'; }).length;
  var overdue = residentsData.filter(function(r){ return r.payment==='overdue'; }).length;
  var healthEl = document.getElementById('r-health-wrap');
  if (healthEl) {
    healthEl.innerHTML =
      '<div class="r-health-row"><div class="r-health-label"><span>Paid</span><span>' + paid + ' (' + Math.round(paid/total*100) + '%)</span></div><div class="r-health-track"><div class="r-health-fill green" style="width:' + (paid/total*100) + '%"></div></div></div>' +
      '<div class="r-health-row"><div class="r-health-label"><span>Pending</span><span>' + pending + ' (' + Math.round(pending/total*100) + '%)</span></div><div class="r-health-track"><div class="r-health-fill amber" style="width:' + (pending/total*100) + '%"></div></div></div>' +
      '<div class="r-health-row"><div class="r-health-label"><span>Overdue</span><span>' + overdue + ' (' + Math.round(overdue/total*100) + '%)</span></div><div class="r-health-track"><div class="r-health-fill red" style="width:' + (overdue/total*100) + '%"></div></div></div>';
  }
  var blockTotalEl = document.getElementById('r-block-total');
  if (blockTotalEl) blockTotalEl.textContent = residentsData.length + ' units';
}

function filterResidentByBlock(b) {
  var el = document.getElementById('res-block-filter');
  if (el) el.value = b;
  applyResidentFilters();
}

/* Resident drawer */
function openResidentDrawer(id) {
  var r = residentsData.find(function(x){ return x.id===id; });
  if (!r) return;
  resDrawerTarget = r;
  var avEl = document.getElementById('rd-av');
  if (avEl) { avEl.textContent = resInitials(r); avEl.className = 'drawer-av' + (r.payment==='overdue'?' r-overdue':r.payment==='pending'?' r-pending':''); }
  var nameEl = document.getElementById('rd-name'); if (nameEl) nameEl.textContent = resFullName(r);
  var subEl  = document.getElementById('rd-sub');  if (subEl)  subEl.textContent  = 'Unit ' + r.unit + ' · Joined ' + r.joined;
  var unitEl = document.getElementById('rd-unit'); if (unitEl) unitEl.textContent = r.unit;
  var phEl   = document.getElementById('rd-phone'); if (phEl)  phEl.textContent   = r.phone;
  var joinEl = document.getElementById('rd-joined'); if (joinEl) joinEl.textContent = r.joined;
  var blEl   = document.getElementById('rd-block'); if (blEl)  blEl.textContent   = 'Block ' + resBlockOf(r);
  var payEl  = document.getElementById('rd-payment');
  if (payEl) payEl.innerHTML = '<span class="r-status-chip ' + r.payment + '">' + r.payment.charAt(0).toUpperCase() + r.payment.slice(1) + '</span>';
  var hist = residentPaymentHistory[r.payment] || residentPaymentHistory.paid;
  var histEl = document.getElementById('rd-history');
  if (histEl) histEl.innerHTML = hist.map(function(h) {
    return '<div class="payment-history-item"><span class="ph-period">' + h.period + '</span><span class="ph-amount">' + h.amount + '</span><span class="r-status-chip ' + h.status + '" style="font-size:10px">' + h.status.charAt(0).toUpperCase() + h.status.slice(1) + '</span></div>';
  }).join('');
  var bg = document.getElementById('resident-drawer-bg');
  if (bg) bg.classList.add('open');
}

function closeResidentDrawer() {
  var bg = document.getElementById('resident-drawer-bg');
  if (bg) bg.classList.remove('open');
  resDrawerTarget = null;
}

function resDrawerReminder() {
  if (resDrawerTarget) toast('Reminder sent to ' + resFullName(resDrawerTarget), 'success');
}

/* Resident context menu */
function openResidentCtx(e, id) {
  e.stopPropagation();
  resCtxTarget = id;
  var menu = document.getElementById('resident-ctx-menu');
  if (!menu) return;
  menu.classList.remove('open');
  var rect = e.currentTarget.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = (rect.right - 175) + 'px';
  requestAnimationFrame(function(){ menu.classList.add('open'); });
}

function closeResidentCtx() {
  var menu = document.getElementById('resident-ctx-menu');
  if (menu) menu.classList.remove('open');
}

document.addEventListener('click', closeResidentCtx);

function resCtxView() { if (resCtxTarget) openResidentDrawer(resCtxTarget); closeResidentCtx(); }

function resCtxSendReminder() {
  if (resCtxTarget) {
    var r = residentsData.find(function(x){ return x.id===resCtxTarget; });
    if (r) toast('Reminder sent to ' + resFullName(r), 'success');
  }
  closeResidentCtx();
}

function resCtxRemove() {
  if (!resCtxTarget) return;
  var r = residentsData.find(function(x){ return x.id===resCtxTarget; });
  if (!r) return;
  if (confirm('Remove ' + resFullName(r) + ' from the estate?')) {
    residentsData = residentsData.filter(function(x){ return x.id!==resCtxTarget; });
    applyResidentFilters();
    toast(resFullName(r) + ' removed', 'success');
  }
  closeResidentCtx();
}

/* Add resident modal */
function openAddResidentModal() {
  var bg = document.getElementById('resident-modal-bg');
  if (bg) bg.classList.add('open');
}

function closeAddResidentModal() {
  var bg = document.getElementById('resident-modal-bg');
  if (bg) bg.classList.remove('open');
}

function submitNewResident() {
  var first   = (document.getElementById('rm-first') || {value:''}).value.trim();
  var last    = (document.getElementById('rm-last')  || {value:''}).value.trim();
  var unit    = (document.getElementById('rm-unit')  || {value:''}).value.trim();
  var phone   = (document.getElementById('rm-phone') || {value:''}).value.trim();
  var payment = (document.getElementById('rm-payment')|| {value:'paid'}).value;
  if (!first || !last || !unit) { toast('Name and unit are required', 'error'); return; }
  var maxId = residentsData.reduce(function(m,r){ return r.id>m?r.id:m; }, 0);
  residentsData.unshift({id:maxId+1, first:first, last:last, unit:unit, phone:phone||'—', joined:'Mar 2026', payment:payment});
  applyResidentFilters();
  closeAddResidentModal();
  toast(first + ' ' + last + ' added', 'success');
  ['rm-first','rm-last','rm-unit','rm-phone'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
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
  // Pre-render data-driven sections so they look correct immediately
  try {
    applyPaymentsFilters();
  } catch (_) {}
  try {
    applyVisitorFilters();
  } catch (_) {}
  try {
    renderNotices();
  } catch (_) {}
  try {
    renderPendingResidents();
  } catch (_) {}
  // Restore emergency state on load
  updateWebEmergencyState();
  // Render incidents tab (pre-load so badge shows on startup)
  try { renderWebIncidents(); } catch (_) {}
});

/* ─── EMERGENCY ALERT (website admin portal) ─────────────────────────── */
const WEB_EMERGENCY_KEY = 'wellage_active_emergency';

function loadWebEmergency() {
  try {
    const raw = localStorage.getItem(WEB_EMERGENCY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Backward compat: old format was a single object
    if (Array.isArray(parsed)) return parsed;
    return [{ id: Date.now(), type: parsed.type, message: parsed.message || parsed.msg || '', time: parsed.time }];
  } catch (_) { return []; }
}

function saveWebEmergency(arr) {
  try {
    if (arr && arr.length > 0) localStorage.setItem(WEB_EMERGENCY_KEY, JSON.stringify(arr));
    else localStorage.removeItem(WEB_EMERGENCY_KEY);
  } catch (_) {}
}

function openWebEmergencyModal() {
  const bg = document.getElementById('webEmergencyModalBg');
  if (!bg) return;
  // Reset form
  document.getElementById('webEmergencyMsg').value = '';
  document.querySelectorAll('.web-emergency-type-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  bg.classList.remove('hidden');
}

function closeWebEmergencyModal() {
  const bg = document.getElementById('webEmergencyModalBg');
  if (bg) bg.classList.add('hidden');
}

function selectWebEmergencyType(btn) {
  document.querySelectorAll('.web-emergency-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function sendWebEmergencyAlert() {
  const typeBtn = document.querySelector('.web-emergency-type-btn.active');
  const type = typeBtn ? (typeBtn.dataset.type || typeBtn.getAttribute('data-type')) : 'Other';
  const msg = (document.getElementById('webEmergencyMsg').value || '').trim();
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const alerts = loadWebEmergency();
  alerts.push({ id: Date.now(), type, message: msg, time });
  saveWebEmergency(alerts);
  closeWebEmergencyModal();
  updateWebEmergencyState();
  toast('Emergency alert sent to all residents and guards.', 'error');
}

function resolveWebEmergencyAlert(id) {
  let alerts = loadWebEmergency();
  if (id !== undefined) {
    alerts = alerts.filter(a => a.id !== id);
  } else {
    alerts = [];
  }
  saveWebEmergency(alerts);
  updateWebEmergencyState();
  toast('Emergency alert resolved.', 'success');
}

function updateWebEmergencyState() {
  const alerts = loadWebEmergency();
  const idle = document.getElementById('webEmergencyIdle');
  const listEl = document.getElementById('webEmergencyList');
  const addBtn = document.getElementById('webEmergencyAddBtn');
  if (!idle) return;
  if (alerts.length > 0) {
    idle.classList.add('hidden');
    if (listEl) {
      listEl.classList.remove('hidden');
      listEl.innerHTML = alerts.map(a => `
        <div class="web-emergency-active">
          <div class="web-emergency-active-left">
            <span class="web-emergency-pulse"></span>
            <span class="web-emergency-active-label">LIVE ALERT</span>
            <span class="web-emergency-active-type">${a.type}</span>
            <span class="web-emergency-active-msg">${a.message || ''}</span>
            <span class="web-emergency-active-meta">Sent at ${a.time} · Visible to all residents &amp; guards</span>
          </div>
          <button type="button" class="web-emergency-resolve-btn" onclick="resolveWebEmergencyAlert(${a.id})">Mark as Resolved</button>
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

// Sync across tabs (e.g. app sends alert, website reflects it)
window.addEventListener('storage', function(e) {
  if (e.key === WEB_EMERGENCY_KEY) updateWebEmergencyState();
  if (e.key === WEB_INCIDENTS_KEY) renderWebIncidents();
});

/* ─── INCIDENTS (website) ──────────────────────────────────────────────── */
const WEB_INCIDENTS_KEY = 'wellage_incidents';

function loadWebIncidents() {
  try {
    var raw = localStorage.getItem(WEB_INCIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

function saveWebIncidents(list) {
  try {
    localStorage.setItem(WEB_INCIDENTS_KEY, JSON.stringify(list));
  } catch (_) {}
}

function renderWebIncidents(filter) {
  var all = loadWebIncidents();

  // Merge active emergency alerts that may not have been stored yet
  var activeAlerts = loadWebEmergency();
  var storedIds = new Set(all.map(function(i) { return i.id; }));
  activeAlerts.forEach(function(a) {
    if (!storedIds.has(a.id)) {
      all.unshift({ id: a.id, type: a.type, msg: a.message || '', reportedAt: a.time, status: 'active', note: null, resolvedAt: null });
    }
  });

  // Update stats
  var total = all.length;
  var activeCount = all.filter(function(i) { return i.status === 'active'; }).length;
  var resolvedCount = all.filter(function(i) { return i.status === 'resolved'; }).length;
  var el = document.getElementById('webIncStatTotal'); if (el) el.textContent = total;
  el = document.getElementById('webIncStatActive'); if (el) el.textContent = activeCount;
  el = document.getElementById('webIncStatResolved'); if (el) el.textContent = resolvedCount;

  // Nav dot
  var dot = document.getElementById('nav-badge-incidents');
  if (dot) {
    if (activeCount > 0) { dot.textContent = activeCount; dot.classList.remove('hidden'); }
    else dot.classList.add('hidden');
  }

  // Apply filters
  var q = (document.getElementById('web-incident-search')?.value || '').toLowerCase();
  var sf = document.getElementById('web-incident-status-filter')?.value || '';
  var tf = document.getElementById('web-incident-type-filter')?.value || '';
  var rows = all.filter(function(i) {
    var matchQ = !q || (i.type || '').toLowerCase().includes(q) || (i.msg || '').toLowerCase().includes(q) || (i.note || '').toLowerCase().includes(q);
    var matchS = !sf || i.status === sf;
    var matchT = !tf || i.type === tf;
    return matchQ && matchS && matchT;
  });

  var listEl = document.getElementById('webIncidentList');
  var emptyEl = document.getElementById('webIncidentsEmpty');
  if (!listEl) return;

  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  var typeColors = { 'Fire': '#ef4444', 'Security Threat': '#f97316', 'Accident': '#eab308', 'Other': '#64748b' };
  listEl.innerHTML = rows.map(function(i) {
    var color = typeColors[i.type] || '#64748b';
    var isActive = i.status === 'active';
    var statusBadge = isActive
      ? '<span class="web-inc-badge web-inc-badge-active">Active</span>'
      : '<span class="web-inc-badge web-inc-badge-resolved">Resolved</span>';
    var note = !isActive && i.note
      ? '<p class="web-inc-note">' + i.note + '</p>'
      : (!isActive ? '<p class="web-inc-note web-inc-note-muted">No resolution note.</p>' : '');
    var meta = isActive
      ? '<span class="web-inc-meta">Reported ' + (i.reportedAt || '—') + '</span>'
      : '<span class="web-inc-meta">Reported ' + (i.reportedAt || '—') + (i.resolvedAt ? ' · Resolved ' + i.resolvedAt : '') + '</span>';
    var pulse = isActive ? '<span class="web-inc-pulse"></span>' : '';
    return '<div class="web-inc-card ' + (isActive ? 'web-inc-card-active' : '') + '">' +
      pulse +
      '<div class="web-inc-dot" style="background:' + color + '"></div>' +
      '<div class="web-inc-body">' +
        '<div class="web-inc-top"><span class="web-inc-type">' + i.type + '</span>' + statusBadge + '</div>' +
        (i.msg ? '<p class="web-inc-msg">' + i.msg + '</p>' : '') +
        note + meta +
      '</div>' +
    '</div>';
  }).join('');
}

function filterWebIncidents() {
  renderWebIncidents();
}

// Log incident modal (website, non-emergency)
var _webLogIncidentStatus = 'resolved';

function openWebLogIncidentModal() {
  var bg = document.getElementById('webLogIncidentModalBg');
  if (!bg) return;
  document.querySelectorAll('#webLogIncidentTypeGrid .web-emergency-type-btn').forEach(function(b, i) {
    b.classList.toggle('active', i === 0);
  });
  var desc = document.getElementById('webLogIncidentDesc');
  var note = document.getElementById('webLogIncidentNote');
  if (desc) desc.value = '';
  if (note) note.value = '';
  _webLogIncidentStatus = 'resolved';
  document.querySelectorAll('.web-incident-status-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-status') === 'resolved');
  });
  bg.classList.remove('hidden');
}

function closeWebLogIncidentModal() {
  var bg = document.getElementById('webLogIncidentModalBg');
  if (bg) bg.classList.add('hidden');
}

function selectWebLogIncidentType(btn) {
  document.querySelectorAll('#webLogIncidentTypeGrid .web-emergency-type-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function selectWebLogIncidentStatus(btn) {
  document.querySelectorAll('.web-incident-status-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _webLogIncidentStatus = btn.getAttribute('data-status');
}

function submitWebLogIncident() {
  var typeBtn = document.querySelector('#webLogIncidentTypeGrid .web-emergency-type-btn.active');
  var type = typeBtn ? typeBtn.getAttribute('data-type') : 'Other';
  var msg = (document.getElementById('webLogIncidentDesc')?.value || '').trim();
  var note = (document.getElementById('webLogIncidentNote')?.value || '').trim();
  var now = new Date();
  var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  var list = loadWebIncidents();
  list.unshift({
    id: Date.now(),
    type: type,
    msg: msg,
    reportedAt: dateStr + ' ' + timeStr,
    status: _webLogIncidentStatus,
    note: note || null,
    resolvedAt: _webLogIncidentStatus === 'resolved' ? timeStr : null
  });
  saveWebIncidents(list);
  closeWebLogIncidentModal();
  renderWebIncidents();
  toast('Incident logged.', 'success');
}
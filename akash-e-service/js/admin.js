/* ==========================================================================
   AKASH E SERVICE — Admin Panel Logic
   All reads/writes go through Store.* (see data.js) so a real backend
   can be swapped in later without touching this file's structure.
   ========================================================================== */

const SESSION_KEY = 'akash_admin_session';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand-mark').forEach(el => el.innerHTML = icon('logo', 20));
  checkSession();
  initLogin();
  initLogout();
  initSidebar();
  initResetButton();
});

/* ---------------- Auth ---------------- */
function checkSession(){
  const remembered = localStorage.getItem(SESSION_KEY);
  const sessioned = sessionStorage.getItem(SESSION_KEY);
  if(remembered || sessioned){
    showDashboard();
  }
}
function initLogin(){
  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('l-user').value.trim();
    const pass = document.getElementById('l-pass').value;
    const remember = document.getElementById('l-remember').checked;
    const admin = Store.getAdmin();
    const err = document.getElementById('login-error');

    if(user === admin.username && pass === admin.password){
      err.classList.remove('show');
      if(remember) localStorage.setItem(SESSION_KEY, '1');
      else sessionStorage.setItem(SESSION_KEY, '1');
      showDashboard();
    } else {
      err.classList.add('show');
    }
  });
}
function initLogout(){
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  });
}
function showDashboard(){
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'grid';
  renderAll();
}

/* ---------------- Sidebar / panel switching ---------------- */
function initSidebar(){
  const buttons = document.querySelectorAll('#admin-nav button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
      document.getElementById('panel-title').textContent = btn.textContent;
    });
  });
}

function initResetButton(){
  document.getElementById('reset-data-btn').addEventListener('click', () => {
    if(confirm('আপনি কি নিশ্চিত? সব ডেটা ডিফল্ট অবস্থায় ফিরে যাবে।')){
      Store.resetAll();
      renderAll();
      alert('সব ডেটা রিসেট করা হয়েছে।');
    }
  });
}

function renderAll(){
  renderOverview();
  renderBookingsPanel();
  renderOffersPanel();
  renderUpdatesPanel();
  renderServicesPanel();
  renderHomePanel();
  renderContactPanel();
  renderReviewsPanel();
  renderFaqPanel();
}

/* ---------------- Overview ---------------- */
function renderOverview(){
  const bookings = Store.getBookings();
  const pending = bookings.filter(b => b.status === 'pending').length;
  const services = Store.getServices();
  const reviews = Store.getReviews();

  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card"><b>${bookings.length}</b><span>মোট বুকিং</span></div>
    <div class="stat-card"><b>${pending}</b><span>পেন্ডিং বুকিং</span></div>
    <div class="stat-card"><b>${services.length}</b><span>সক্রিয় সার্ভিস</span></div>
    <div class="stat-card"><b>${reviews.length}</b><span>মোট রিভিউ</span></div>
  `;
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes()/60;
  const open = day === 0 ? (hour>=9 && hour<14) : (hour>=9 && hour<20);
  const el = document.getElementById('overview-status');
  el.className = 'status-pill' + (open ? '' : ' closed');
  el.innerHTML = `<span class="dot"></span>${open ? 'ওয়েবসাইটে এখন "খোলা" দেখাচ্ছে' : 'ওয়েবসাইটে এখন "বন্ধ" দেখাচ্ছে'}`;
}

/* ---------------- Bookings ---------------- */
function renderBookingsPanel(){
  const body = document.getElementById('bookings-body');
  const searchInput = document.getElementById('booking-search');
  const filterChips = document.querySelectorAll('#booking-filter .chip');
  let activeStatus = 'all';

  function draw(){
    let list = Store.getBookings();
    if(activeStatus !== 'all') list = list.filter(b => b.status === activeStatus);
    const q = searchInput.value.trim().toLowerCase();
    if(q) list = list.filter(b => b.name.toLowerCase().includes(q) || b.phone.includes(q));

    body.innerHTML = list.length ? list.map(b => `
      <tr>
        <td>${b.name}<br><span style="color:var(--muted);font-size:.78rem;">${b.village||''}</span></td>
        <td>${b.phone}</td>
        <td>${b.service}</td>
        <td>${new Date(b.createdAt).toLocaleDateString('bn-IN')}</td>
        <td><span class="status-tag ${b.status}">${statusLabel(b.status)}</span></td>
        <td>
          <div class="row-actions">
            ${b.status!=='completed' ? `<button onclick="setBookingStatus('${b.id}','completed')">সম্পন্ন</button>`:''}
            ${b.status!=='cancelled' ? `<button class="danger" onclick="setBookingStatus('${b.id}','cancelled')">বাতিল</button>`:''}
          </div>
        </td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--muted);">কোনো বুকিং পাওয়া যায়নি।</td></tr>`;
  }

  filterChips.forEach(chip => chip.addEventListener('click', () => {
    filterChips.forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    activeStatus = chip.dataset.status;
    draw();
  }));
  searchInput.oninput = draw;
  draw();
  window._drawBookings = draw;
}
function statusLabel(s){ return {pending:'পেন্ডিং',completed:'সম্পন্ন',cancelled:'বাতিল'}[s] || s; }
function setBookingStatus(id, status){
  const list = Store.getBookings();
  const b = list.find(x => x.id === id);
  if(b){ b.status = status; Store.saveBookings(list); }
  window._drawBookings && window._drawBookings();
  renderOverview();
}

/* ---------------- Offers ---------------- */
function renderOffersPanel(){
  const body = document.getElementById('offers-body');
  function draw(){
    const offers = Store.getOffers();
    body.innerHTML = offers.length ? offers.map(o => `
      <tr>
        <td><b>${o.title}</b><br><span style="color:var(--muted);font-size:.8rem;">${o.desc}</span></td>
        <td>${o.from||'-'} → ${o.to||'-'}</td>
        <td><span class="status-tag ${o.active?'completed':'cancelled'}">${o.active?'সক্রিয়':'নিষ্ক্রিয়'}</span></td>
        <td><div class="row-actions"><button class="danger" onclick="deleteOffer('${o.id}')">ডিলিট</button></div></td>
      </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">কোনো অফার নেই।</td></tr>`;
  }
  document.getElementById('o-add-btn').onclick = () => {
    const title = document.getElementById('o-title').value.trim();
    const desc = document.getElementById('o-desc').value.trim();
    if(!title){ alert('অফারের শিরোনাম দিন।'); return; }
    const offers = Store.getOffers();
    offers.unshift({
      id:'o-'+Date.now(), title, desc,
      from:document.getElementById('o-from').value,
      to:document.getElementById('o-to').value,
      active:document.getElementById('o-active').value === 'true'
    });
    Store.saveOffers(offers);
    document.getElementById('o-title').value='';
    document.getElementById('o-desc').value='';
    draw();
  };
  window.deleteOffer = (id) => {
    Store.saveOffers(Store.getOffers().filter(o=>o.id!==id));
    draw();
  };
  draw();
}

/* ---------------- Government updates ---------------- */
function renderUpdatesPanel(){
  const body = document.getElementById('updates-body');
  function draw(){
    const updates = [...Store.getUpdates()].sort((a,b)=> new Date(b.date)-new Date(a.date));
    body.innerHTML = updates.length ? updates.map(u => `
      <tr>
        <td>${u.pinned?'📌 ':''}${u.title}</td>
        <td>${u.date}</td>
        <td>${u.pinned?'হ্যাঁ':'না'}</td>
        <td><div class="row-actions">
          <button onclick="togglePin('${u.id}')">পিন/আনপিন</button>
          <button class="danger" onclick="deleteUpdate('${u.id}')">ডিলিট</button>
        </div></td>
      </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">কোনো আপডেট নেই।</td></tr>`;
  }
  document.getElementById('u-add-btn').onclick = () => {
    const title = document.getElementById('u-title').value.trim();
    const date = document.getElementById('u-date').value || new Date().toISOString().slice(0,10);
    if(!title){ alert('আপডেটের শিরোনাম দিন।'); return; }
    const updates = Store.getUpdates();
    updates.unshift({id:'u-'+Date.now(), title, date, pinned:document.getElementById('u-pinned').checked});
    Store.saveUpdates(updates);
    document.getElementById('u-title').value='';
    document.getElementById('u-pinned').checked=false;
    draw();
  };
  window.togglePin = (id) => {
    const list = Store.getUpdates();
    const u = list.find(x=>x.id===id);
    if(u) u.pinned = !u.pinned;
    Store.saveUpdates(list);
    draw();
  };
  window.deleteUpdate = (id) => {
    Store.saveUpdates(Store.getUpdates().filter(u=>u.id!==id));
    draw();
  };
  draw();
}

/* ---------------- Services & charges ---------------- */
function renderServicesPanel(){
  const body = document.getElementById('services-body');
  const filter = document.getElementById('svc-cat-filter');
  filter.innerHTML = '<option value="all">সব ক্যাটাগরি</option>' +
    Store.getCategories().map(c=>`<option value="${c.id}">${c.name}</option>`).join('');

  function draw(){
    let list = Store.getServices();
    if(filter.value !== 'all') list = list.filter(s=>s.cat===filter.value);
    body.innerHTML = list.map(s => `
      <tr>
        <td>${s.name}</td>
        <td><input type="text" value="${s.time}" style="width:120px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;" onchange="updateServiceField('${s.id}','time',this.value)"></td>
        <td><input type="number" value="${s.price}" style="width:80px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;" onchange="updateServiceField('${s.id}','price',this.value)"></td>
        <td></td>
      </tr>`).join('');
  }
  filter.onchange = draw;
  window.updateServiceField = (id, field, value) => {
    const list = Store.getServices();
    const s = list.find(x=>x.id===id);
    if(s){ s[field] = field==='price' ? Number(value) : value; Store.saveServices(list); }
  };
  draw();
}

/* ---------------- Homepage content ---------------- */
function renderHomePanel(){
  const h = Store.getHome();
  document.getElementById('h-title').value = h.heroTitle;
  document.getElementById('h-subtitle').value = h.heroSubtitle;
  document.getElementById('h-lead').value = h.heroLead;
  document.getElementById('h-announcement').value = h.announcement;
  document.getElementById('h-save-btn').onclick = () => {
    Store.saveHome({
      heroTitle:document.getElementById('h-title').value,
      heroSubtitle:document.getElementById('h-subtitle').value,
      heroLead:document.getElementById('h-lead').value,
      announcement:document.getElementById('h-announcement').value,
    });
    alert('হোমপেজ কন্টেন্ট সংরক্ষণ করা হয়েছে। পরিবর্তন দেখতে ওয়েবসাইট রিফ্রেশ করুন।');
  };
}

/* ---------------- Contact management ---------------- */
function renderContactPanel(){
  const c = Store.getContact();
  document.getElementById('c-phone').value = c.phone;
  document.getElementById('c-whatsapp').value = c.whatsapp;
  document.getElementById('c-email').value = c.email;
  document.getElementById('c-address').value = c.address;
  document.getElementById('c-map').value = c.mapEmbed;
  document.getElementById('c-hours-week').value = c.hours.weekday;
  document.getElementById('c-hours-sun').value = c.hours.sunday;
  document.getElementById('c-save-btn').onclick = () => {
    Store.saveContact({
      phone:document.getElementById('c-phone').value,
      whatsapp:document.getElementById('c-whatsapp').value,
      email:document.getElementById('c-email').value,
      address:document.getElementById('c-address').value,
      mapEmbed:document.getElementById('c-map').value,
      hours:{weekday:document.getElementById('c-hours-week').value, sunday:document.getElementById('c-hours-sun').value}
    });
    alert('যোগাযোগের তথ্য সংরক্ষণ করা হয়েছে।');
  };
}

/* ---------------- Reviews ---------------- */
function renderReviewsPanel(){
  const body = document.getElementById('reviews-body');
  function draw(){
    const reviews = Store.getReviews();
    body.innerHTML = reviews.length ? reviews.map(r => `
      <tr>
        <td>${r.name}<br><span style="color:var(--muted);font-size:.78rem;">${r.place}</span></td>
        <td>${'★'.repeat(r.rating)}</td>
        <td style="max-width:320px;">${r.text}</td>
        <td><div class="row-actions"><button class="danger" onclick="deleteReview('${r.id}')">ডিলিট</button></div></td>
      </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">কোনো রিভিউ নেই।</td></tr>`;
  }
  document.getElementById('r-add-btn').onclick = () => {
    const name = document.getElementById('r-name').value.trim();
    const text = document.getElementById('r-text').value.trim();
    if(!name || !text){ alert('নাম ও মতামত দিন।'); return; }
    const reviews = Store.getReviews();
    reviews.unshift({
      id:'r-'+Date.now(), name, place:document.getElementById('r-place').value.trim(),
      rating:Number(document.getElementById('r-rating').value)||5, text
    });
    Store.saveReviews(reviews);
    document.getElementById('r-name').value='';
    document.getElementById('r-place').value='';
    document.getElementById('r-text').value='';
    draw();
  };
  window.deleteReview = (id) => {
    Store.saveReviews(Store.getReviews().filter(r=>r.id!==id));
    draw();
  };
  draw();
}

/* ---------------- FAQ ---------------- */
function renderFaqPanel(){
  const body = document.getElementById('faq-body');
  function draw(){
    const faqs = Store.getFaq();
    body.innerHTML = faqs.length ? faqs.map(f => `
      <tr>
        <td>${f.q}</td>
        <td style="max-width:320px;">${f.a}</td>
        <td><div class="row-actions"><button class="danger" onclick="deleteFaq('${f.id}')">ডিলিট</button></div></td>
      </tr>`).join('') : `<tr><td colspan="3" style="text-align:center;color:var(--muted);">কোনো FAQ নেই।</td></tr>`;
  }
  document.getElementById('f-add-btn').onclick = () => {
    const q = document.getElementById('f-q').value.trim();
    const a = document.getElementById('f-a').value.trim();
    if(!q || !a){ alert('প্রশ্ন ও উত্তর দিন।'); return; }
    const faqs = Store.getFaq();
    faqs.push({id:'f-'+Date.now(), q, a});
    Store.saveFaq(faqs);
    document.getElementById('f-q').value='';
    document.getElementById('f-a').value='';
    draw();
  };
  window.deleteFaq = (id) => {
    Store.saveFaq(Store.getFaq().filter(f=>f.id!==id));
    draw();
  };
  draw();
}

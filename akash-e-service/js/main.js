/* ==========================================================================
   AKASH E SERVICE — Site behaviour (shared across all public pages)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFloatingButtons();
  initShopStatus();
  initSearch();
  renderAnnouncementBar();
  renderHeroContent();
  renderPopularServices();
  renderUpdates();
  renderOffers();
  renderTestimonials();
  renderFaq();
  renderServicesPage();
  renderChargesPage();
  renderContactPage();
  initBookingForm();
  setActiveNav();
  document.querySelectorAll('.brand-mark').forEach(el => el.innerHTML = icon('logo', 20));
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* ---------------- Nav ---------------- */
function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.innerHTML = links.classList.contains('open') ? icon('close',22) : icon('menu',22);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.innerHTML = icon('menu',22);
  }));
}
function setActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
}

/* ---------------- Floating WhatsApp / Call ---------------- */
function initFloatingButtons(){
  const c = Store.getContact();
  const wa = document.getElementById('fab-wa');
  const call = document.getElementById('fab-call');
  if (wa) wa.href = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('নমস্কার, আমি AKASH E SERVICE থেকে একটি পরিষেবা সম্পর্কে জানতে চাই।')}`;
  if (call) call.href = `tel:+91${c.phone}`;
}
function waLinkForService(name){
  const c = Store.getContact();
  const msg = `নমস্কার, আমি "${name}" পরিষেবাটি সম্পর্কে জানতে চাই। বুকিং করতে চাই।`;
  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`;
}

/* ---------------- Shop open/closed status ---------------- */
function initShopStatus(){
  const el = document.getElementById('shop-status');
  if(!el) return;
  const now = new Date();
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const hour = now.getHours() + now.getMinutes()/60;
  let open;
  if (day === 0) open = hour >= 9 && hour < 14;
  else open = hour >= 9 && hour < 20;

  el.className = 'status-pill' + (open ? '' : ' closed');
  el.innerHTML = `<span class="dot"></span>${open ? 'এখন খোলা আছে' : 'এখন বন্ধ আছে'}`;
}

/* ---------------- Announcement / offer banner on home ---------------- */
function renderAnnouncementBar(){
  const el = document.getElementById('announcement-text');
  if(!el) return;
  el.textContent = Store.getHome().announcement;
}

/* ---------------- Home: hero content (editable from Admin) ---------------- */
function renderHeroContent(){
  const title = document.getElementById('hero-title');
  const lead = document.getElementById('hero-lead');
  if(!title && !lead) return;
  const h = Store.getHome();
  if(title) title.innerHTML = h.heroTitle;
  if(lead) lead.textContent = h.heroLead;
}

/* ---------------- Live search ---------------- */
function initSearch(){
  const input = document.getElementById('site-search');
  if(!input) return;
  const results = document.getElementById('search-results');
  const services = Store.getServices();

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if(!q){ results.classList.remove('show'); results.innerHTML=''; return; }
    const matches = services.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)).slice(0,8);
    results.classList.add('show');
    results.innerHTML = matches.length
      ? matches.map(s => `<a href="services.html?svc=${s.id}"><span>${s.name}</span><span>₹${s.price} থেকে</span></a>`).join('')
      : `<div class="no-result">কোনো সার্ভিস পাওয়া যায়নি। সরাসরি হোয়াটসঅ্যাপে জিজ্ঞাসা করুন।</div>`;
  });
  document.addEventListener('click', (e) => {
    if(!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('show');
  });
  const form = document.getElementById('search-form');
  if(form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = `services.html?q=${encodeURIComponent(input.value.trim())}`;
  });
}

/* ---------------- Service card builder (shared by home + services page) ---------------- */
function serviceCard(s){
  const docsId = 'docs-' + s.id;
  return `
  <div class="svc-card" data-cat="${s.cat}" data-name="${s.name.toLowerCase()}">
    <div class="svc-top">
      <div class="svc-icon">${icon(s.icon,24)}</div>
      <span class="svc-badge">${categoryName(s.cat)}</span>
    </div>
    <h4>${s.name}</h4>
    <p class="desc">${s.desc}</p>
    ${s.docs && s.docs.length ? `
    <button class="docs-toggle" onclick="toggleDocs('${docsId}')">${icon('chevronDown',14)} প্রয়োজনীয় ডকুমেন্ট</button>
    <ul class="docs-list" id="${docsId}">${s.docs.map(d=>`<li>${d}</li>`).join('')}</ul>` : ''}
    <div class="svc-meta">
      <span>${icon('clock',15)} আনুমানিক সময়: <b>${s.time}</b></span>
    </div>
    <div class="flex-between">
      <span class="svc-price">₹${s.price}<span style="font-size:.7rem;color:var(--muted);font-weight:400;"> থেকে</span></span>
    </div>
    <div class="svc-actions">
      <a class="btn btn-wa btn-sm" target="_blank" href="${waLinkForService(s.name)}">${icon('whatsapp',16)} জিজ্ঞাসা</a>
      <a class="btn btn-primary btn-sm" href="booking.html?svc=${s.id}">বুক করুন</a>
    </div>
  </div>`;
}
function toggleDocs(id){
  document.getElementById(id).classList.toggle('open');
}
function categoryName(catId){
  const c = Store.getCategories().find(c => c.id === catId);
  return c ? c.name : catId;
}

/* ---------------- Home: popular services ---------------- */
function renderPopularServices(){
  const el = document.getElementById('popular-services');
  if(!el) return;
  const popularIds = ['svc-pannew','svc-aadmobile','svc-lakshmi','svc-rationnew','svc-passport','svc-scholar','svc-elec','svc-print'];
  const services = Store.getServices();
  const list = popularIds.map(id => services.find(s=>s.id===id)).filter(Boolean);
  el.innerHTML = list.map(serviceCard).join('');
}

/* ---------------- Home: government updates ---------------- */
function renderUpdates(){
  const el = document.getElementById('update-list');
  if(!el) return;
  const updates = [...Store.getUpdates()].sort((a,b) => (b.pinned - a.pinned) || new Date(b.date) - new Date(a.date));
  el.innerHTML = updates.map(u => `
    <div class="update-item ${u.pinned ? 'pinned':''}">
      <span class="update-dot"></span>
      <div>
        <h5>${u.pinned ? '📌 ' : ''}${u.title}</h5>
        <span class="date">${formatDate(u.date)}</span>
      </div>
    </div>`).join('');
}
function formatDate(iso){
  const d = new Date(iso);
  const months = ['জানু','ফেব্রু','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্ট','অক্টো','নভে','ডিসে'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

/* ---------------- Home: offers ---------------- */
function renderOffers(){
  const el = document.getElementById('offer-list');
  if(!el) return;
  const offers = Store.getOffers().filter(o => o.active);
  if(!offers.length){ el.closest('.section').style.display='none'; return; }
  el.innerHTML = offers.map(o => `
    <div class="offer-card">
      <span class="stamp">সীমিত সময়</span>
      <h4>${o.title}</h4>
      <p>${o.desc}</p>
      <a class="btn btn-outline btn-sm" href="booking.html">বুক করুন</a>
    </div>`).join('');
}

/* ---------------- Home: testimonials ---------------- */
function renderTestimonials(){
  const el = document.getElementById('testimonial-list');
  if(!el) return;
  el.innerHTML = Store.getReviews().map(r => `
    <div class="testi-card">
      <div class="testi-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p>“${r.text}”</p>
      <div class="testi-who">
        <div class="testi-avatar">${r.name.charAt(0)}</div>
        <div><b>${r.name}</b><span>${r.place}</span></div>
      </div>
    </div>`).join('');
}

/* ---------------- FAQ accordion ---------------- */
function renderFaq(){
  const el = document.getElementById('faq-list');
  if(!el) return;
  el.innerHTML = Store.getFaq().map((f,i) => `
    <div class="faq-item" id="faq-${f.id}">
      <button class="faq-q" onclick="toggleFaq('${f.id}')">${f.q}<span class="plus">${icon('close',16)}</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('');
}
function toggleFaq(id){
  document.getElementById('faq-'+id).classList.toggle('open');
}

/* ---------------- Services page ---------------- */
function renderServicesPage(){
  const grid = document.getElementById('services-grid');
  if(!grid) return;
  const chipsWrap = document.getElementById('category-chips');
  const categories = Store.getCategories();
  const params = new URLSearchParams(location.search);
  let activeCat = params.get('cat') || 'all';
  const q = (params.get('q') || '').toLowerCase();

  if(chipsWrap){
    chipsWrap.innerHTML = ['<button class="chip" data-cat="all">সব সার্ভিস</button>']
      .concat(categories.map(c => `<button class="chip" data-cat="${c.id}">${c.name}</button>`)).join('');
    chipsWrap.querySelectorAll('.chip').forEach(chip => {
      if(chip.dataset.cat === activeCat) chip.classList.add('active');
      chip.addEventListener('click', () => {
        chipsWrap.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        draw(chip.dataset.cat, document.getElementById('services-search')?.value.toLowerCase() || '');
      });
    });
  }

  function draw(cat, query){
    let list = Store.getServices();
    if(cat && cat !== 'all') list = list.filter(s => s.cat === cat);
    if(query) list = list.filter(s => s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query));
    grid.innerHTML = list.length ? list.map(serviceCard).join('') : `<p class="no-result">কোনো সার্ভিস পাওয়া যায়নি।</p>`;
  }
  draw(activeCat, q);

  const pageSearch = document.getElementById('services-search');
  if(pageSearch){
    pageSearch.value = q;
    pageSearch.addEventListener('input', () => {
      const activeChip = chipsWrap?.querySelector('.chip.active');
      draw(activeChip ? activeChip.dataset.cat : 'all', pageSearch.value.toLowerCase());
    });
  }

  const svcId = params.get('svc');
  if(svcId){
    setTimeout(() => {
      const target = document.querySelector(`[data-cat] .svc-card, .svc-card`);
      const card = [...grid.querySelectorAll('.svc-card')].find((c,i)=> Store.getServices()[i]?.id===svcId);
    }, 0);
  }
}

/* ---------------- Charges page ---------------- */
function renderChargesPage(){
  const el = document.getElementById('charges-table-body');
  if(!el) return;
  const categories = Store.getCategories();
  const services = Store.getServices();
  let rows = '';
  categories.forEach(cat => {
    const items = services.filter(s => s.cat === cat.id);
    if(!items.length) return;
    rows += `<tr class="charges-cat"><td colspan="3">${cat.name}</td></tr>`;
    items.forEach(s => {
      rows += `<tr><td>${s.name}</td><td>${s.time}</td><td class="price">₹${s.price} থেকে</td></tr>`;
    });
  });
  el.innerHTML = rows;
}

/* ---------------- Contact page ---------------- */
function renderContactPage(){
  const el = document.getElementById('contact-details');
  if(!el) return;
  const c = Store.getContact();
  el.innerHTML = `
    <div class="contact-item"><span class="ic">${icon('phone',18)}</span><div><b>ফোন</b><span>+91 ${c.phone}</span></div></div>
    <div class="contact-item"><span class="ic">${icon('whatsapp',18)}</span><div><b>হোয়াটসঅ্যাপ</b><span>+${c.whatsapp}</span></div></div>
    <div class="contact-item"><span class="ic">${icon('mail',18)}</span><div><b>ইমেইল</b><span>${c.email}</span></div></div>
    <div class="contact-item"><span class="ic">${icon('map-pin',18)}</span><div><b>ঠিকানা</b><span>${c.address}</span></div></div>
    <div class="contact-item"><span class="ic">${icon('clock',18)}</span><div><b>খোলার সময়</b><span>${c.hours.weekday}<br>${c.hours.sunday}</span></div></div>
  `;
  const map = document.getElementById('map-embed');
  if(map) map.src = c.mapEmbed;
  const dir = document.getElementById('directions-btn');
  if(dir) dir.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`;
}

/* ---------------- Booking form ---------------- */
function initBookingForm(){
  const form = document.getElementById('booking-form');
  if(!form) return;
  const successBox = document.getElementById('booking-success');
  const submitBtn = form.querySelector('button[type="submit"]');
  const serviceSelect = document.getElementById('b-service');
  const services = Store.getServices();
  serviceSelect.innerHTML = '<option value="">সার্ভিস নির্বাচন করুন</option>' +
    services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  const params = new URLSearchParams(location.search);
  const pre = params.get('svc');
  if(pre) serviceSelect.value = pre;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('b-name').value.trim();
    const phone = document.getElementById('b-phone').value.trim();
    const village = document.getElementById('b-village').value.trim();
    const svcId = serviceSelect.value;
    const message = document.getElementById('b-message').value.trim();
    const svcName = services.find(s => s.id === svcId)?.name || 'উল্লেখ নেই';

    if(!name || !phone || !svcId){
      alert('নাম, ফোন নম্বর এবং সার্ভিস অবশ্যই দিতে হবে।');
      return;
    }

    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'পাঠানো হচ্ছে...';
    }

    try{
      const booking = {
        id: 'bk-' + Date.now(),
        name, phone, village, service: svcName, message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      Store.addBooking(booking);

      const recipient = Store.getContact().email || 'akashhazra2578@gmail.com';
      const emailSent = await sendBookingEmail(recipient, booking);

      if(successBox){
        successBox.classList.add('show');
        successBox.textContent = emailSent
          ? 'আপনার বুকিং সফলভাবে জমা হয়েছে এবং ইমেইলেও পাঠানো হয়েছে। আমরা দ্রুত যোগাযোগ করব।'
          : 'বুকিং সংরক্ষণ করা হয়েছে, কিন্তু অটো ইমেইল পাঠানো যায়নি। ইমেইল অ্যাপ খুলে হাতে পাঠিয়ে দিন।';
      }

      if(!emailSent){
        const subject = encodeURIComponent(`নতুন বুকিং: ${svcName}`);
        const body = encodeURIComponent(
          `নাম: ${name}\nফোন: ${phone}\nগ্রাম/এলাকা: ${village}\nসার্ভিস: ${svcName}\nমন্তব্য: ${message}`
        );
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      }

      form.reset();
    }catch(_err){
      alert('দুঃখিত, এখন বুকিং জমা দেওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }finally{
      if (submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = 'বুকিং নিশ্চিত করুন';
      }
    }
  });
}

async function sendBookingEmail(recipientEmail, booking){
  let timeoutId = null;
  try{
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    timeoutId = setTimeout(() => {
      if(controller) controller.abort();
    }, 8000);

    const fd = new FormData();
    fd.append('name', booking.name);
    fd.append('phone', booking.phone);
    fd.append('village', booking.village || '-');
    fd.append('service', booking.service);
    fd.append('message', booking.message || '-');
    fd.append('booking_id', booking.id);
    fd.append('booking_time', new Date(booking.createdAt).toLocaleString('bn-IN'));
    fd.append('_subject', `নতুন বুকিং: ${booking.service}`);
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
      {
        method:'POST',
        body:fd,
        headers:{ 'Accept':'application/json' },
        signal: controller ? controller.signal : undefined
      }
    );
    clearTimeout(timeoutId);
    if(!res.ok) return false;
    const data = await res.json();
    return !!(data && (data.success === true || data.success === 'true'));
  }catch(_err){
    return false;
  }finally{
    if(timeoutId) clearTimeout(timeoutId);
  }
}

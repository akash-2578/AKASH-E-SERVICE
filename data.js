/* ============================================
   AKASH E SERVICE — Shared Data & Utilities
   ============================================ */

// Storage helpers
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Default data
const DEFAULT_COURSES = [
  { id: 1, name: 'Basic Computer', duration: '3 Months', fees: 2000, icon: '💻', syllabus: 'MS Word, Excel, PowerPoint, Internet, Email, Tally Basics, Typing', daysPerWeek: 3 },
  { id: 2, name: 'Advanced Excel', duration: '2 Months', fees: 3500, icon: '📊', syllabus: 'Formulas, VLOOKUP, Pivot Tables, Charts, Macros, Data Analysis, MIS Reports', daysPerWeek: 3 },
  { id: 3, name: 'Web Design', duration: '4 Months', fees: 6000, icon: '🌐', syllabus: 'HTML5, CSS3, JavaScript, Bootstrap, Responsive Design, WordPress, Hosting', daysPerWeek: 3 },
  { id: 4, name: 'Typing Master', duration: '1 Month', fees: 1500, icon: '⌨️', syllabus: 'Hindi & English Typing, Speed Building, Accuracy, Government Typing Tests', daysPerWeek: 6 },
  { id: 5, name: 'Tally Prime', duration: '2 Months', fees: 4000, icon: '📈', syllabus: 'GST, Accounting, Inventory, Payroll, Vouchers, Reports, Bank Reconciliation', daysPerWeek: 3 },
  { id: 6, name: 'DTP & Designing', duration: '2 Months', fees: 3000, icon: '🎨', syllabus: 'Photoshop, CorelDraw, Canva, Banner Design, Photo Editing, Flex Printing', daysPerWeek: 3 },
];

const SERVICES = [
  { icon: 'fa-copy',          name: 'Xerox / Photocopy',       price: '₹1/page',  desc: 'B&W and Color photocopying, all sizes' },
  { icon: 'fa-id-card',       name: 'PAN Card',                price: '₹200',     desc: 'New apply, correction, reprint' },
  { icon: 'fa-fingerprint',   name: 'Aadhaar Services',        price: '₹100',     desc: 'Update, correction, reprint, eKYC' },
  { icon: 'fa-vote-yea',      name: 'Voter ID',                price: '₹100',     desc: 'New apply, correction, reprint' },
  { icon: 'fa-file-alt',      name: 'Govt. Exam Forms',        price: '₹50+',     desc: 'All government exam form fill-up' },
  { icon: 'fa-globe',         name: 'Online Applications',     price: '₹50+',     desc: 'All types of online registration & apply' },
  { icon: 'fa-layer-group',   name: 'Lamination',              price: '₹20/page', desc: 'A4, Letter, ID card & custom sizes' },
  { icon: 'fa-print',         name: 'Printing',                price: '₹5/page',  desc: 'Color & B&W, A4 & A3 printing' },
  { icon: 'fa-file-pdf',      name: 'Document Scanning',       price: '₹5/page',  desc: 'Scan to PDF/JPG, cloud upload' },
  { icon: 'fa-passport',      name: 'Passport Apply',          price: '₹300',     desc: 'New passport and renewal assistance' },
  { icon: 'fa-file-invoice',  name: 'Income Certificate',      price: '₹150',     desc: 'Application preparation & submission' },
  { icon: 'fa-users',         name: 'Caste Certificate',       price: '₹150',     desc: 'Application preparation & submission' },
  { icon: 'fa-home',          name: 'Domicile Certificate',    price: '₹150',     desc: 'Application preparation & submission' },
  { icon: 'fa-university',    name: 'Scholarship Forms',       price: '₹100',     desc: 'State & central scholarship apply' },
  { icon: 'fa-mobile-alt',    name: 'Mobile Banking Setup',    price: '₹100',     desc: 'Internet banking & UPI setup help' },
  { icon: 'fa-envelope',      name: 'Email & Account Setup',   price: '₹50',      desc: 'Gmail, email creation & setup' },
];

// Show alert helper
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  el.innerHTML = `<div class="alert alert-${type}"><i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span></div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 5500);
}

// Open / close modal
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// WhatsApp
function openWA(phone, msg) {
  const p = phone ? phone.replace(/\D/g, '') : '919999999999';
  const full = p.startsWith('91') ? p : '91' + p;
  const text = msg || 'Hello! I need assistance from AKASH E SERVICE.';
  window.open(`https://wa.me/${full}?text=${encodeURIComponent(text)}`, '_blank');
}

// Format date nicely
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Generate cert ID
function newCertId() {
  const n = get('aes_cert_n', 999) + 1;
  set('aes_cert_n', n);
  return 'AES-' + n;
}

// Today's date string
const todayStr = () => new Date().toISOString().split('T')[0];

// Populate select from courses
function populateCourseSelect(selId, emptyLabel) {
  const el = document.getElementById(selId);
  if (!el) return;
  const courses = get('aes_courses', DEFAULT_COURSES);
  el.innerHTML = `<option value="">${emptyLabel || '-- Select Course --'}</option>` +
    courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

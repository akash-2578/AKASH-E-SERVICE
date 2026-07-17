/* ==========================================================================
   AKASH E SERVICE — Data Layer
   Default content + localStorage-backed CRUD helpers.
   Structured so a real backend can replace the Store methods later
   without touching any page code (all pages call Store get/save methods).
   ========================================================================== */

const LS_KEYS = {
  services:'akash_services',
  updates:'akash_updates',
  offers:'akash_offers',
  reviews:'akash_reviews',
  faq:'akash_faq',
  bookings:'akash_bookings',
  contact:'akash_contact',
  home:'akash_home',
  admin:'akash_admin',
};

/* ---------------- Default content ---------------- */

const DEFAULT_SERVICES = [
  // Online Services
  {id:'svc-form', cat:'online', name:'অনলাইন ফর্ম ফিলআপ', icon:'file', desc:'যেকোনো সরকারি বা বেসরকারি ফর্ম দ্রুত ও নির্ভুল ভাবে পূরণ।', docs:['আধার কার্ড','প্রয়োজনীয় সার্টিফিকেট','পাসপোর্ট সাইজ ছবি'], time:'১৫–৩০ মিনিট', price:30},
  {id:'svc-scholar', cat:'online', name:'স্কলারশিপ আবেদন', icon:'award', desc:'ছাত্র-ছাত্রীদের জন্য সব ধরনের স্কলারশিপ ফর্ম পূরণ ও জমা।', docs:['আধার কার্ড','মার্কশিট','ব্যাংক পাসবুক','ইনকাম সার্টিফিকেট'], time:'২০–৪০ মিনিট', price:50},
  {id:'svc-scc', cat:'online', name:'স্টুডেন্ট ক্রেডিট কার্ড', icon:'credit-card', desc:'পশ্চিমবঙ্গ স্টুডেন্ট ক্রেডিট কার্ড আবেদন সহায়তা।', docs:['আধার','ভর্তির প্রমাণ','ব্যাংক পাসবুক'], time:'৩০–৪৫ মিনিট', price:100},
  {id:'svc-passport', cat:'online', name:'পাসপোর্ট আবেদন', icon:'passport', desc:'নতুন পাসপোর্ট ও রিনিউয়াল আবেদন, অ্যাপয়েন্টমেন্ট বুকিং সহ।', docs:['আধার কার্ড','ভোটার কার্ড','ঠিকানার প্রমাণ','ছবি'], time:'৪৫–৬০ মিনিট', price:150},
  {id:'svc-resume', cat:'online', name:'রেজিউমে / সিভি তৈরি', icon:'user', desc:'প্রফেশনাল রেজিউমে ডিজাইন ও প্রিন্ট।', docs:['শিক্ষাগত তথ্য','কাজের অভিজ্ঞতা','ছবি'], time:'২০ মিনিট', price:70},
  {id:'svc-birth', cat:'online', name:'জন্ম সার্টিফিকেট', icon:'file-text', desc:'নতুন আবেদন, কারেকশন ও ডুপ্লিকেট কপি।', docs:['হাসপাতালের প্রমাণ','পিতামাতার আধার'], time:'২০ মিনিট', price:60},
  {id:'svc-train', cat:'online', name:'ট্রেনের টিকিট বুকিং', icon:'train', desc:'IRCTC-র মাধ্যমে তৎকাল ও সাধারণ টিকিট বুকিং।', docs:['যাত্রীর আধার/আইডি'], time:'১০ মিনিট', price:20},
  {id:'svc-elec', cat:'online', name:'ইলেকট্রিক বিল পেমেন্ট', icon:'zap', desc:'WBSEDCL বিদ্যুৎ বিল অনলাইন পেমেন্ট।', docs:['বিলের কপি / কনজিউমার নং'], time:'৫ মিনিট', price:10},

  // Government Schemes
  {id:'svc-bardhakya', cat:'scheme', name:'বার্ধক্য ভাতা', icon:'heart', desc:'বার্ধক্য ভাতা নতুন আবেদন ও স্ট্যাটাস চেক।', docs:['আধার','বয়সের প্রমাণ','ইনকাম সার্টিফিকেট'], time:'২৫ মিনিট', price:40},
  {id:'svc-annapurna', cat:'scheme', name:'অন্নপূর্ণা ভাণ্ডার', icon:'heart', desc:'অন্নপূর্ণা ভাণ্ডার প্রকল্পে আবেদন সহায়তা।', docs:['আধার','রেশন কার্ড'], time:'২০ মিনিট', price:40},
  {id:'svc-lakshmi', cat:'scheme', name:'লক্ষ্মীর ভাণ্ডার', icon:'heart', desc:'লক্ষ্মীর ভাণ্ডার প্রকল্পে নতুন আবেদন ও কারেকশন।', docs:['আধার','ব্যাংক পাসবুক','SC/ST সার্টিফিকেট (যদি থাকে)'], time:'২৫ মিনিট', price:40},
  {id:'svc-yuvashree', cat:'scheme', name:'যুবশ্রী প্রকল্প', icon:'briefcase', desc:'বেকার যুবকদের জন্য যুবশ্রী প্রকল্পে নিবন্ধন।', docs:['আধার','শিক্ষাগত সার্টিফিকেট'], time:'২৫ মিনিট', price:40},
  {id:'svc-krishak', cat:'scheme', name:'কৃষক বন্ধু', icon:'leaf', desc:'কৃষক বন্ধু প্রকল্পে নিবন্ধন ও কিস্তির স্ট্যাটাস চেক।', docs:['আধার','জমির পাট্টা/রেকর্ড'], time:'২৫ মিনিট', price:40},
  {id:'svc-kanyashree', cat:'scheme', name:'কন্যাশ্রী প্রকল্প', icon:'award', desc:'K1 ও K2 ফর্ম পূরণ ও জমা।', docs:['আধার','স্কুলের প্রমাণপত্র','ব্যাংক পাসবুক'], time:'২৫ মিনিট', price:40},
  {id:'svc-oikashree', cat:'scheme', name:'ঐক্যশ্রী প্রকল্প', icon:'award', desc:'সংখ্যালঘু ছাত্রছাত্রীদের স্কলারশিপ আবেদন।', docs:['আধার','মার্কশিট','সংখ্যালঘু সার্টিফিকেট'], time:'২৫ মিনিট', price:40},
  {id:'svc-swasthyasathi', cat:'scheme', name:'স্বাস্থ্য সাথী কার্ড', icon:'plus-square', desc:'স্বাস্থ্য সাথী কার্ড আবেদন ও ডাউনলোড।', docs:['আধার','পরিবারের তথ্য'], time:'২০ মিনিট', price:30},
  {id:'svc-abha', cat:'scheme', name:'Ayushman Bharat (ABHA)', icon:'plus-square', desc:'ABHA Card তৈরি ও ডাউনলোড।', docs:['আধার','মোবাইল নম্বর'], time:'১৫ মিনিট', price:30},
  {id:'svc-otherscheme', cat:'scheme', name:'অন্যান্য সরকারি প্রকল্প', icon:'layers', desc:'অন্য যেকোনো রাজ্য/কেন্দ্র সরকারি প্রকল্পে আবেদন সহায়তা।', docs:['আধার','প্রকল্প ভিত্তিক নথি'], time:'নির্ভর করবে', price:40},

  // PAN
  {id:'svc-pannew', cat:'pan', name:'নতুন PAN কার্ড', icon:'id', desc:'নতুন PAN কার্ডের জন্য আবেদন।', docs:['আধার কার্ড','ছবি','স্বাক্ষর'], time:'১৫ মিনিট', price:120},
  {id:'svc-pancorrect', cat:'pan', name:'PAN কারেকশন', icon:'id', desc:'নাম, DOB বা ঠিকানা সংশোধন।', docs:['আধার','পুরোনো PAN'], time:'১৫ মিনিট', price:120},
  {id:'svc-panlost', cat:'pan', name:'হারিয়ে যাওয়া PAN', icon:'id', desc:'হারিয়ে যাওয়া PAN-এর ডুপ্লিকেট কপি আবেদন।', docs:['আধার','FIR/ঘোষণাপত্র (যদি থাকে)'], time:'১৫ মিনিট', price:120},
  {id:'svc-panaadhaar', cat:'pan', name:'PAN–আধার লিংক', icon:'link', desc:'PAN ও আধার লিংক করা ও স্ট্যাটাস চেক।', docs:['PAN','আধার'], time:'১০ মিনিট', price:50},
  {id:'svc-panmobile', cat:'pan', name:'PAN মোবাইল আপডেট', icon:'smartphone', desc:'PAN-এর সাথে যুক্ত মোবাইল নম্বর পরিবর্তন।', docs:['PAN','আধার'], time:'১০ মিনিট', price:80},
  {id:'svc-epan', cat:'pan', name:'e-PAN ডাউনলোড', icon:'download', desc:'ইনস্ট্যান্ট e-PAN তৈরি ও ডাউনলোড।', docs:['আধার লিংকড মোবাইল'], time:'৫ মিনিট', price:30},

  // Aadhaar
  {id:'svc-aadmobile', cat:'aadhaar', name:'মোবাইল নম্বর আপডেট', icon:'smartphone', desc:'আধারে নতুন মোবাইল নম্বর যুক্তকরণ।', docs:['আধার কার্ড'], time:'১৫ মিনিট + কেন্দ্র ভিজিট', price:60},
  {id:'svc-aadaddress', cat:'aadhaar', name:'ঠিকানা আপডেট', icon:'map-pin', desc:'আধারে ঠিকানা পরিবর্তন।', docs:['আধার','ঠিকানার প্রমাণ'], time:'২০ মিনিট', price:60},
  {id:'svc-aadname', cat:'aadhaar', name:'নাম সংশোধন', icon:'edit', desc:'আধারে নামের ভুল সংশোধন।', docs:['আধার','সাপোর্টিং ডকুমেন্ট'], time:'২০ মিনিট', price:70},
  {id:'svc-aaddob', cat:'aadhaar', name:'জন্ম তারিখ সংশোধন', icon:'calendar', desc:'আধারে DOB সংশোধন।', docs:['আধার','জন্ম সার্টিফিকেট'], time:'২০ মিনিট', price:70},
  {id:'svc-aaddoc', cat:'aadhaar', name:'ডকুমেন্ট আপডেট', icon:'file-text', desc:'আধারে সাপোর্টিং ডকুমেন্ট আপলোড।', docs:['আধার','নতুন ডকুমেন্ট'], time:'১৫ মিনিট', price:50},
  {id:'svc-aadappt', cat:'aadhaar', name:'অ্যাপয়েন্টমেন্ট বুকিং', icon:'calendar', desc:'আধার সেবা কেন্দ্রে অ্যাপয়েন্টমেন্ট বুকিং।', docs:['আধার নম্বর'], time:'১০ মিনিট', price:30},
  {id:'svc-aadpvc', cat:'aadhaar', name:'PVC আধার কার্ড', icon:'credit-card', desc:'টেকসই PVC আধার কার্ড অর্ডার।', docs:['আধার নম্বর'], time:'১০ মিনিট', price:60},

  // Ration
  {id:'svc-rationnew', cat:'ration', name:'নতুন রেশন কার্ড', icon:'shopping-bag', desc:'নতুন রেশন কার্ডের জন্য আবেদন।', docs:['আধার','ব্যাংক পাসবুক','ঠিকানার প্রমাণ'], time:'৩০ মিনিট', price:80},
  {id:'svc-rationmobile', cat:'ration', name:'মোবাইল নম্বর আপডেট', icon:'smartphone', desc:'রেশন কার্ডে মোবাইল নম্বর আপডেট।', docs:['রেশন কার্ড','আধার'], time:'১০ মিনিট', price:30},
  {id:'svc-rationaadhaar', cat:'ration', name:'আধার লিংক', icon:'link', desc:'রেশন কার্ডের সাথে আধার লিংক করা।', docs:['রেশন কার্ড','আধার'], time:'১০ মিনিট', price:30},
  {id:'svc-rationsplit', cat:'ration', name:'পরিবার বিভাজন', icon:'users', desc:'পরিবার আলাদা করে নতুন রেশন কার্ড।', docs:['মূল রেশন কার্ড','আধার'], time:'৩০ মিনিট', price:80},
  {id:'svc-rationmember', cat:'ration', name:'সদস্য সংযোজন/বিলোপ', icon:'users', desc:'রেশন কার্ডে সদস্য যুক্ত বা বাদ দেওয়া।', docs:['রেশন কার্ড','আধার'], time:'২০ মিনিট', price:50},
  {id:'svc-rationstatus', cat:'ration', name:'স্ট্যাটাস চেক', icon:'search', desc:'রেশন কার্ডের আবেদনের অবস্থা যাচাই।', docs:['আবেদন নম্বর'], time:'৫ মিনিট', price:20},
  {id:'svc-rationdownload', cat:'ration', name:'রেশন কার্ড ডাউনলোড', icon:'download', desc:'ই-রেশন কার্ড ডাউনলোড ও প্রিন্ট।', docs:['রেশন কার্ড নম্বর'], time:'৫ মিনিট', price:20},

  // Government Job
  {id:'svc-ssc', cat:'job', name:'SSC আবেদন', icon:'briefcase', desc:'SSC পরীক্ষার ফর্ম পূরণ ও ফি জমা।', docs:['শিক্ষাগত সার্টিফিকেট','আধার','ছবি'], time:'৩০ মিনিট', price:50},
  {id:'svc-railway', cat:'job', name:'রেলওয়ে আবেদন', icon:'train', desc:'রেলওয়ে নিয়োগের সব ফর্ম আবেদন।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-psc', cat:'job', name:'PSC আবেদন', icon:'briefcase', desc:'WBPSC পরীক্ষার আবেদন সহায়তা।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-wbpolice', cat:'job', name:'WB পুলিশ আবেদন', icon:'shield', desc:'পশ্চিমবঙ্গ পুলিশ নিয়োগ ফর্ম পূরণ।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-kolkatapolice', cat:'job', name:'কলকাতা পুলিশ আবেদন', icon:'shield', desc:'কলকাতা পুলিশ নিয়োগ ফর্ম পূরণ।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-banking', cat:'job', name:'ব্যাংকিং আবেদন', icon:'landmark', desc:'IBPS/SBI ইত্যাদি ব্যাংক পরীক্ষার আবেদন।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-upsc', cat:'job', name:'UPSC আবেদন', icon:'briefcase', desc:'UPSC পরীক্ষার ফর্ম পূরণ সহায়তা।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:60},
  {id:'svc-army', cat:'job', name:'আর্মি আবেদন', icon:'shield', desc:'ভারতীয় সেনায় নিয়োগের ফর্ম পূরণ।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-navy', cat:'job', name:'নেভি আবেদন', icon:'shield', desc:'ভারতীয় নৌবাহিনীর নিয়োগ ফর্ম পূরণ।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-airforce', cat:'job', name:'এয়ার ফোর্স আবেদন', icon:'shield', desc:'ভারতীয় বিমান বাহিনীর নিয়োগ ফর্ম পূরণ।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'৩০ মিনিট', price:50},
  {id:'svc-alljob', cat:'job', name:'অন্যান্য সরকারি চাকরি', icon:'briefcase', desc:'যেকোনো সরকারি চাকরির আবেদন সহায়তা।', docs:['শিক্ষাগত সার্টিফিকেট','আধার'], time:'নির্ভর করবে', price:50},

  // Banking
  {id:'svc-dbt', cat:'bank', name:'DBT লিংকিং', icon:'landmark', desc:'ব্যাংক অ্যাকাউন্টে DBT সক্রিয় করা।', docs:['আধার','ব্যাংক পাসবুক'], time:'১৫ মিনিট', price:40},
  {id:'svc-seeding', cat:'bank', name:'ব্যাংক সিডিং', icon:'landmark', desc:'আধার ব্যাংক সিডিং সম্পন্ন করা।', docs:['আধার','ব্যাংক পাসবুক'], time:'১৫ মিনিট', price:40},
  {id:'svc-npci', cat:'bank', name:'NPCI ম্যাপিং', icon:'landmark', desc:'NPCI-তে আধার ম্যাপিং স্ট্যাটাস চেক ও আপডেট।', docs:['আধার','ব্যাংক পাসবুক'], time:'১৫ মিনিট', price:40},

  // Document services
  {id:'svc-print', cat:'doc', name:'প্রিন্ট', icon:'printer', desc:'কালার ও ব্ল্যাক-হোয়াইট প্রিন্ট।', docs:[], time:'তৎক্ষণাৎ', price:5},
  {id:'svc-photocopy', cat:'doc', name:'ফটোকপি', icon:'copy', desc:'সব সাইজের ফটোকপি সুবিধা।', docs:[], time:'তৎক্ষণাৎ', price:2},
  {id:'svc-scan', cat:'doc', name:'স্ক্যান', icon:'scan', desc:'ডকুমেন্ট স্ক্যান করে PDF/JPG ফাইল।', docs:[], time:'তৎক্ষণাৎ', price:10},
  {id:'svc-lamination', cat:'doc', name:'লামিনেশন', icon:'layers', desc:'গুরুত্বপূর্ণ কার্ড ও কাগজপত্র লামিনেশন।', docs:[], time:'৫ মিনিট', price:15},
  {id:'svc-passportphoto', cat:'doc', name:'পাসপোর্ট ফটো', icon:'camera', desc:'ইনস্ট্যান্ট পাসপোর্ট সাইজ ছবি প্রিন্ট।', docs:[], time:'৫ মিনিট', price:30},
];

const CATEGORIES = [
  {id:'online', name:'অনলাইন সার্ভিস', icon:'file'},
  {id:'scheme', name:'সরকারি প্রকল্প', icon:'heart'},
  {id:'pan', name:'PAN কার্ড', icon:'id'},
  {id:'aadhaar', name:'আধার কার্ড', icon:'fingerprint'},
  {id:'ration', name:'রেশন কার্ড', icon:'shopping-bag'},
  {id:'job', name:'সরকারি চাকরি', icon:'briefcase'},
  {id:'bank', name:'ব্যাংকিং', icon:'landmark'},
  {id:'doc', name:'ডকুমেন্ট সার্ভিস', icon:'printer'},
];

const DEFAULT_UPDATES = [
  {id:'u1', title:'লক্ষ্মীর ভাণ্ডারের নতুন কিস্তি প্রকাশিত হয়েছে', date:'2026-07-01', pinned:true},
  {id:'u2', title:'স্টুডেন্ট ক্রেডিট কার্ডের আবেদনের সময়সীমা বৃদ্ধি', date:'2026-06-28', pinned:false},
  {id:'u3', title:'নতুন রেশন কার্ডের আবেদন এখন সম্পূর্ণ অনলাইনে', date:'2026-06-20', pinned:false},
  {id:'u4', title:'আধার আপডেটের জন্য বিশেষ ক্যাম্প শীঘ্রই আসছে', date:'2026-06-15', pinned:false},
];

const DEFAULT_OFFERS = [
  {id:'o1', title:'PAN কার্ড আবেদনে ২০% ছাড়', desc:'জুলাই মাস জুড়ে নতুন PAN কার্ড আবেদনে বিশেষ ছাড়।', active:true, from:'2026-07-01', to:'2026-07-31'},
  {id:'o2', title:'২টি ফটোকপি সেবায় ১টি ফ্রি', desc:'২০ কপির বেশি ফটোকপি করালে অতিরিক্ত ৫ কপি ফ্রি।', active:true, from:'2026-07-01', to:'2026-07-15'},
];

const DEFAULT_REVIEWS = [
  {id:'r1', name:'সুমিত্রা মণ্ডল', place:'গোচারণ', rating:5, text:'লক্ষ্মীর ভাণ্ডার ফর্ম নিয়ে অনেক সমস্যায় ছিলাম। আকাশ দাদা খুব সুন্দর ভাবে সব করে দিলেন। খুবই ভালো ব্যবহার।'},
  {id:'r2', name:'বিশ্বজিৎ হালদার', place:'শান্তিপুর', rating:5, text:'পাসপোর্টের অ্যাপয়েন্টমেন্ট নিয়ে দৌড়াদৌড়ি করতে হয়নি, এখান থেকেই সব হয়ে গেছে। সময় বাঁচলো অনেক।'},
  {id:'r3', name:'রিনা বিশ্বাস', place:'বাগআঁচড়া', rating:4, text:'স্টুডেন্ট ক্রেডিট কার্ডের জন্য এসেছিলাম, সব কাগজপত্র বুঝিয়ে দিয়ে কাজ করে দিয়েছেন। ধন্যবাদ।'},
];

const DEFAULT_FAQ = [
  {id:'f1', q:'আপনাদের অফিসে কী কী কাগজপত্র নিয়ে আসতে হবে?', a:'প্রতিটি সার্ভিসের জন্য প্রয়োজনীয় নথির তালিকা সার্ভিস কার্ডে দেওয়া আছে। সাধারণত আধার কার্ড ও সংশ্লিষ্ট সার্টিফিকেট নিয়ে আসলেই কাজ শুরু করা যায়।'},
  {id:'f2', q:'কাজ শেষ হতে কত সময় লাগে?', a:'সার্ভিস অনুযায়ী সময় আলাদা, কার্ডের মধ্যে আনুমানিক সময় উল্লেখ থাকে। কিছু কাজ তৎক্ষণাৎ, কিছু কাজ সরকারি প্রক্রিয়ার উপর নির্ভর করে সময় নেয়।'},
  {id:'f3', q:'অনলাইনে বুকিং করলে কি অফিসে যেতে হবে?', a:'অধিকাংশ ডকুমেন্ট-ভিত্তিক কাজের জন্য একবার অফিসে আসতে হয়, তবে বুকিং করে আসলে অপেক্ষার সময় অনেক কমে যায়।'},
  {id:'f4', q:'পেমেন্ট কীভাবে করব?', a:'নগদ ছাড়াও UPI ও অনলাইন পেমেন্ট গ্রহণ করা হয়।'},
  {id:'f5', q:'কাজ হয়ে গেলে কীভাবে জানতে পারব?', a:'হোয়াটসঅ্যাপ বা ফোন কলের মাধ্যমে আপনাকে জানানো হবে।'},
];

const DEFAULT_CONTACT = {
  phone:'9564403460',
  whatsapp:'919564403460',
  email:'akashhazra2578@gmail.com',
  address:'গোচারণ, শান্তিপুর, দক্ষিণ ২৪ পরগনা, পশ্চিমবঙ্গ',
  mapEmbed:'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d652.668493351806!2d88.47327802730958!3d22.27607527999054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a026b06ed0523a9%3A0x763739d1cfa78f2e!2sAKASH%20E-SERVICE!5e0!3m2!1sen!2sin!4v1784296061753!5m2!1sen!2sin',
  hours:{weekday:'সকাল ৯টা – রাত ৮টা (সোম–শনি)', sunday:'সকাল ৯টা – দুপুর ২টা (রবিবার)'}
};

const DEFAULT_HOME = {
  heroTitle:'আপনার কাজ, <em>আমাদের দায়িত্ব।</em>',
  heroSubtitle:'আপনার বিশ্বস্ত ডিজিটাল পরিষেবা কেন্দ্র',
  heroLead:'PAN, আধার, রেশন কার্ড থেকে সরকারি প্রকল্প ও চাকরির আবেদন — গোচারণ, শান্তিপুরে বসেই সব সরকারি ও অনলাইন পরিষেবা, নির্ভুল ও সময়ে।',
  announcement:'জুলাই মাসে নতুন PAN কার্ড আবেদনে বিশেষ ছাড় চলছে।',
};

const DEFAULT_ADMIN = {username:'akash', password:'akash123'};

/* ---------------- Storage bridge ---------------- */

function seedIfEmpty(key, value){
  if(localStorage.getItem(key) === null){
    localStorage.setItem(key, JSON.stringify(value));
  }
}
function readLS(key){
  try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; }
}
function writeLS(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function initStore(){
  seedIfEmpty(LS_KEYS.services, DEFAULT_SERVICES);
  seedIfEmpty(LS_KEYS.updates, DEFAULT_UPDATES);
  seedIfEmpty(LS_KEYS.offers, DEFAULT_OFFERS);
  seedIfEmpty(LS_KEYS.reviews, DEFAULT_REVIEWS);
  seedIfEmpty(LS_KEYS.faq, DEFAULT_FAQ);
  seedIfEmpty(LS_KEYS.bookings, []);
  seedIfEmpty(LS_KEYS.contact, DEFAULT_CONTACT);
  seedIfEmpty(LS_KEYS.home, DEFAULT_HOME);
  seedIfEmpty(LS_KEYS.admin, DEFAULT_ADMIN);
}
initStore();

function mergeContactDefaults(stored){
  const safe = stored && typeof stored === 'object' ? stored : {};
  return {
    ...DEFAULT_CONTACT,
    ...safe,
    email: DEFAULT_CONTACT.email,
    hours: {
      ...DEFAULT_CONTACT.hours,
      ...(safe.hours || {})
    }
  };
}

/* Public data-access layer — pages & admin both go through this,
   so a future backend swap only needs to change the bodies below. */
const Store = {
  getServices:()=> readLS(LS_KEYS.services) || [],
  saveServices:(v)=> writeLS(LS_KEYS.services, v),

  getCategories:()=> CATEGORIES,

  getUpdates:()=> readLS(LS_KEYS.updates) || [],
  saveUpdates:(v)=> writeLS(LS_KEYS.updates, v),

  getOffers:()=> readLS(LS_KEYS.offers) || [],
  saveOffers:(v)=> writeLS(LS_KEYS.offers, v),

  getReviews:()=> readLS(LS_KEYS.reviews) || [],
  saveReviews:(v)=> writeLS(LS_KEYS.reviews, v),

  getFaq:()=> readLS(LS_KEYS.faq) || [],
  saveFaq:(v)=> writeLS(LS_KEYS.faq, v),

  getBookings:()=> readLS(LS_KEYS.bookings) || [],
  saveBookings:(v)=> writeLS(LS_KEYS.bookings, v),
  addBooking:(b)=>{ const list = Store.getBookings(); list.unshift(b); Store.saveBookings(list); },

  getContact:()=> mergeContactDefaults(readLS(LS_KEYS.contact)),
  saveContact:(v)=> writeLS(LS_KEYS.contact, mergeContactDefaults(v)),

  getHome:()=> readLS(LS_KEYS.home) || DEFAULT_HOME,
  saveHome:(v)=> writeLS(LS_KEYS.home, v),

  getAdmin:()=> readLS(LS_KEYS.admin) || DEFAULT_ADMIN,
  saveAdmin:(v)=> writeLS(LS_KEYS.admin, v),

  resetAll:()=>{
    Object.values(LS_KEYS).forEach(k=>localStorage.removeItem(k));
    initStore();
  }
};

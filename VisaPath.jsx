import { useState, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════════
   DATA CONSTANTS
══════════════════════════════════════ */
const VISA_DATA = {
  IN_JP: { badge:"visa-required", label:"Visa Required", icon:"⚠️", title:"Japan — Tourism Visa", sub:"Indian passport holders require a sticker visa from the Japanese Embassy before travel.", type:"Tourist (Single)", stay:"90 days", process:"5–7 business days", fee:"¥3,000 (~$22)", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_TH: { badge:"approved", label:"Visa Free", icon:"✅", title:"Thailand — Visa-Free Entry", sub:"Indian passport holders can enter Thailand visa-free for up to 30 days.", type:"Visa-Free", stay:"30 days", process:"On arrival", fee:"Free", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_AE: { badge:"visa-required", label:"Visa on Arrival", icon:"🛂", title:"UAE — Visa on Arrival", sub:"Indian passport holders can get a visa on arrival at Dubai International Airport.", type:"Visa on Arrival", stay:"30 days", process:"At airport (~1 hr)", fee:"AED 120 (~$33)", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_SG: { badge:"approved", label:"Visa Free", icon:"✅", title:"Singapore — Visa-Free Entry", sub:"Indian passport holders enjoy visa-free access to Singapore for up to 30 days.", type:"Visa-Free", stay:"30 days", process:"On arrival", fee:"Free", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_FR: { badge:"visa-required", label:"Schengen Visa", icon:"🇪🇺", title:"France — Schengen Visa Required", sub:"Indian passport holders need a Schengen visa to enter France and the EU zone.", type:"Schengen Type C", stay:"90 days/180 days", process:"15–20 business days", fee:"€85 (~₹7,600)", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_UK: { badge:"visa-required", label:"Visa Required", icon:"⚠️", title:"United Kingdom — Standard Visitor Visa", sub:"Indian passport holders require a UK Standard Visitor Visa for tourism or business.", type:"Standard Visitor", stay:"6 months", process:"3–6 weeks", fee:"£115 (~₹12,000)", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_CA: { badge:"visa-required", label:"Visa Required", icon:"⚠️", title:"Canada — Temporary Resident Visa", sub:"Indian passport holders require a TRV to enter Canada.", type:"Temporary Resident Visa", stay:"6 months", process:"4–8 weeks", fee:"CAD 100 (~₹6,200)", health:"Safe ✓", passportStatus:"Valid ✓" },
  IN_US: { badge:"visa-required", label:"Visa Required", icon:"⚠️", title:"United States — B1/B2 Visitor Visa", sub:"Indian passport holders require a B1/B2 visa to visit the United States.", type:"B1/B2 Non-immigrant", stay:"Up to 6 months", process:"6–12 weeks", fee:"$185 (~₹15,400)", health:"Safe ✓", passportStatus:"Valid ✓" },
  DEFAULT: { badge:"visa-required", label:"Visa Required", icon:"⚠️", title:"Visa Required", sub:"Please check the official embassy website for the most current requirements.", type:"Varies", stay:"Varies", process:"Varies", fee:"Varies", health:"Check Advisory", passportStatus:"Valid ✓" }
};

const COST_BASE = {
  JP: { flight:42000, stay:5000, food:3000, activity:2500, visa:2500 },
  TH: { flight:15000, stay:2500, food:1500, activity:1200, visa:0 },
  FR: { flight:65000, stay:9000, food:5000, activity:4000, visa:7600 },
  AE: { flight:18000, stay:6000, food:3000, activity:3000, visa:2700 },
  SG: { flight:20000, stay:7000, food:3500, activity:2000, visa:0 }
};
const STYLE_MULT = { budget:0.65, mid:1.0, luxury:2.2 };

const AI_RESPONSES = {
  schengen:"For a Schengen visa you typically need: valid passport (3+ months beyond stay), completed application form, 2 passport photos, travel insurance (€30,000 minimum coverage), confirmed round-trip flight bookings, hotel reservations, bank statements (last 3 months), and proof of employment/income. Processing takes 15-20 working days at the VFS center.",
  japan:"Japan is currently very safe for tourists (Level 1 — Exercise Normal Precautions). There are no major health advisories. Note that Japan experiences typhoon season from June to October and occasional earthquakes. The healthcare system is excellent. For visa: Indian passport holders need to apply at the Japanese Embassy with financial documents and itinerary.",
  thailand:"The best time to visit Thailand is November to March — this is the cool and dry season across most of the country. Avoid May to October (monsoon season). Phuket and Koh Samui have slightly different weather patterns. Currently, Indian passport holders enjoy 30-day visa-free entry.",
  "us visa":"US B1/B2 visa processing currently takes 6-12 weeks for the interview appointment in India. Steps: fill DS-160 online → pay $185 MRV fee → schedule appointment at US Embassy/Consulate → attend interview with documents. Strong ties to home country are key to approval.",
  default:"Great question! VisaPath covers visa requirements for 195 countries. For the most accurate, up-to-date answer I'd recommend: (1) use the Visa Checker tool above with your specific passport + destination, or (2) consult the official embassy website. Is there a specific country pair or travel scenario you'd like me to help with?"
};

const RATES = { JPY:1.601, USD:0.012, EUR:0.011, AED:0.044, GBP:0.0096, SGD:0.016, THB:0.42 };

const FAQ_ITEMS = [
  { q:"How accurate is the visa information on VisaPath?", a:"Our data is sourced directly from government embassy portals and is updated daily. We maintain 98.4% accuracy and clearly flag any information that may be under review. Always verify with the official embassy before submitting an application." },
  { q:"Is VisaPath free to use?", a:"Yes! Basic visa checks, currency conversion, weather data, and the travel checklist are completely free. Premium features like the AI Visa Predictor, unlimited AI chatbot queries, and AI itinerary generation are available on our Pro plan (₹499/month)." },
  { q:"How does the AI Visa Eligibility Predictor work?", a:"Our ML model is trained on 2+ million visa application outcomes. It analyzes factors like passport strength (Henley Index score), travel history, financial profile, and purpose of visit to predict approval probability. It is not a guarantee — it is a planning tool with ~94% correlation to actual outcomes." },
  { q:"Can I download my travel checklist?", a:"Yes. Each checklist section has a Download PDF button that generates a formatted, printable checklist for your trip. You can also share it via WhatsApp or email directly from the dashboard." },
  { q:"Does VisaPath support countries beyond India?", a:"Absolutely. VisaPath covers 195 countries and supports passport holders from all nationalities. Our database maps bilateral visa relationships between every country pair, giving you accurate results regardless of your origin." }
];

const DESTINATIONS = [
  { flag:"🇯🇵", name:"Japan", meta:"East Asia · Visa Required", badge:"visa-req", badgeLabel:"Visa Req.", color:"#e05c4b" },
  { flag:"🇫🇷", name:"France", meta:"Europe · Schengen Visa", badge:"visa-req", badgeLabel:"Schengen", color:"#e05c4b" },
  { flag:"🇹🇭", name:"Thailand", meta:"Southeast Asia · Visa-Free", badge:"visa-free", badgeLabel:"Visa Free", color:"#22C55E" },
  { flag:"🇦🇪", name:"Dubai, UAE", meta:"Middle East · Visa on Arrival", badge:"visa-arr", badgeLabel:"On Arrival", color:"#F4A62A" },
  { flag:"🇸🇬", name:"Singapore", meta:"Southeast Asia · Visa-Free", badge:"visa-free", badgeLabel:"Visa Free", color:"#22C55E" },
  { flag:"🇲🇻", name:"Maldives", meta:"South Asia · 30 days free", badge:"visa-free", badgeLabel:"Visa Free", color:"#22C55E" }
];

const CHECKLIST_CARDS = [
  { icon:"📄", color:"rgba(46,134,222,0.15)", cat:"Documents", items:["Valid passport (6+ months validity)","Visa approval letter","Travel insurance document","Hotel booking confirmation","Return flight ticket"] },
  { icon:"💊", color:"rgba(34,197,94,0.15)", cat:"Health & Safety", items:["Vaccinations up to date","Prescription medications (extra)","First aid kit","Emergency contact list","Travel health insurance"] },
  { icon:"💰", color:"rgba(244,166,42,0.15)", cat:"Finance", items:["Forex card / travel card loaded","Emergency cash in local currency","Notify bank of travel dates","Save embassy helpline numbers","International transaction fees checked"] },
  { icon:"🧳", color:"rgba(139,92,246,0.15)", cat:"Packing Essentials", items:["Universal power adapter","Local SIM / international plan","Offline maps downloaded","Luggage locks & tags","Weather-appropriate clothing"] }
];

/* ══════════════════════════════════════
   STYLES (inline via <style> tag injection + CSS vars)
══════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --navy:#0A1628; --navy-mid:#112040; --navy-light:#1A2F55;
    --sky:#2E86DE; --sky-light:#5BA4F5;
    --gold:#F4A62A; --gold-light:#FBCB6B;
    --white:#F8FAFF; --slate:#4A5568; --slate-light:#8899AA;
    --success:#22C55E; --danger:#EF4444;
    --glass:rgba(255,255,255,0.07); --glass-border:rgba(255,255,255,0.12);
    --card-shadow:0 8px 32px rgba(0,0,0,0.3);
    --radius:14px; --radius-sm:8px;
    --font-display:'Playfair Display',Georgia,serif;
    --font-body:'Inter',system-ui,sans-serif;
    --font-mono:'JetBrains Mono',monospace;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:var(--navy);color:var(--white);font-family:var(--font-body);font-size:15px;line-height:1.6;overflow-x:hidden;}
  a{color:inherit;text-decoration:none;}
  button{font-family:inherit;cursor:pointer;}
  input,select,textarea{font-family:inherit;}
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:var(--navy);}
  ::-webkit-scrollbar-thumb{background:var(--navy-light);border-radius:3px;}

  /* NAV */
  .vp-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:64px;background:rgba(10,22,40,0.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-border);}
  .vp-nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--white);}
  .vp-logo-icon{width:34px;height:34px;background:linear-gradient(135deg,var(--sky),var(--gold));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;}
  .vp-nav-links{display:flex;align-items:center;gap:28px;list-style:none;}
  .vp-nav-links a{font-size:0.85rem;font-weight:500;color:var(--slate-light);transition:color 0.2s;letter-spacing:0.02em;}
  .vp-nav-links a:hover{color:var(--white);}
  .vp-nav-actions{display:flex;gap:10px;}
  .btn-ghost{padding:7px 18px;border:1px solid var(--glass-border);border-radius:var(--radius-sm);background:transparent;color:var(--white);font-size:0.82rem;font-weight:500;transition:all 0.2s;}
  .btn-ghost:hover{border-color:var(--sky);color:var(--sky);}
  .btn-primary{padding:7px 18px;border:none;border-radius:var(--radius-sm);background:linear-gradient(135deg,var(--sky),#1A6BC7);color:#fff;font-size:0.82rem;font-weight:600;transition:all 0.2s;box-shadow:0 2px 12px rgba(46,134,222,0.35);}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(46,134,222,0.5);}

  /* HERO */
  .vp-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 5% 60px;overflow:hidden;text-align:center;background:linear-gradient(135deg,#0A1628 0%,#112040 50%,#1A2F55 100%);}
  .vp-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,22,40,0.3) 0%,rgba(10,22,40,0.2) 40%,rgba(10,22,40,0.5) 100%);z-index:0;}
  .vp-hero>*{position:relative;z-index:1;}
  .vp-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
  .vp-orb-1{width:500px;height:500px;background:rgba(46,134,222,0.2);top:-100px;right:-100px;animation:orbFloat 8s ease-in-out infinite;}
  .vp-orb-2{width:400px;height:400px;background:rgba(244,166,42,0.12);bottom:-50px;left:-80px;animation:orbFloat 10s ease-in-out infinite reverse;}
  @keyframes orbFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-30px);}}
  .vp-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border:1px solid rgba(46,134,222,0.4);border-radius:100px;background:rgba(46,134,222,0.1);font-size:0.75rem;font-weight:600;color:var(--sky-light);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:24px;}
  .vp-dot{width:6px;height:6px;border-radius:50%;background:var(--success);animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
  .vp-hero-title{font-family:var(--font-display);font-size:clamp(2.4rem,6vw,4.2rem);font-weight:700;line-height:1.15;margin-bottom:22px;max-width:820px;color:var(--white);}
  .vp-accent{color:var(--gold);}
  .vp-sky-text{background:linear-gradient(135deg,var(--sky),var(--sky-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .vp-hero-sub{font-size:1.05rem;color:rgba(248,250,255,0.75);max-width:560px;margin:0 auto 40px;line-height:1.7;}
  .vp-hero-search{position:relative;z-index:2;width:100%;max-width:680px;background:rgba(255,255,255,0.07);border:1px solid var(--glass-border);border-radius:100px;display:flex;align-items:center;padding:6px 6px 6px 24px;gap:12px;backdrop-filter:blur(12px);box-shadow:0 8px 40px rgba(0,0,0,0.3);transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:20px;}
  .vp-hero-search:focus-within{border-color:rgba(46,134,222,0.6);box-shadow:0 8px 40px rgba(46,134,222,0.2);}
  .vp-hero-search input{flex:1;background:transparent;border:none;outline:none;color:var(--white);font-size:0.95rem;padding:8px 0;}
  .vp-hero-search input::placeholder{color:var(--slate-light);}
  .vp-search-sep{width:1px;height:28px;background:var(--glass-border);flex-shrink:0;}
  .vp-hero-search select{background:transparent;border:none;outline:none;color:var(--slate-light);font-size:0.85rem;padding:0 12px;cursor:pointer;}
  .vp-hero-search select option{background:var(--navy-mid);}
  .vp-search-btn{padding:11px 28px;background:linear-gradient(135deg,var(--sky),#1A6BC7);border:none;border-radius:100px;color:#fff;font-size:0.88rem;font-weight:600;white-space:nowrap;transition:all 0.2s;box-shadow:0 2px 12px rgba(46,134,222,0.4);}
  .vp-search-btn:hover{transform:scale(1.03);}
  .vp-tags{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:56px;}
  .vp-tag{padding:5px 14px;border:1px solid var(--glass-border);border-radius:100px;font-size:0.78rem;color:var(--slate-light);background:var(--glass);cursor:pointer;transition:all 0.2s;}
  .vp-tag:hover{border-color:var(--sky);color:var(--sky-light);background:rgba(46,134,222,0.1);}
  .vp-stats{display:flex;gap:48px;justify-content:center;padding-top:32px;border-top:1px solid var(--glass-border);width:100%;max-width:600px;}
  .vp-stat-num{font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:var(--white);line-height:1;}
  .vp-stat-num span{color:var(--gold);}
  .vp-stat-label{font-size:0.75rem;color:rgba(248,250,255,0.6);margin-top:4px;letter-spacing:0.04em;text-transform:uppercase;}

  /* SECTION */
  .vp-section{padding:80px 5%;}
  .vp-section-label{font-size:0.72rem;font-weight:600;color:var(--sky);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;}
  .vp-section-title{font-family:var(--font-display);font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:700;line-height:1.2;margin-bottom:14px;}
  .vp-section-sub{color:var(--slate-light);font-size:0.95rem;max-width:540px;line-height:1.7;}
  .vp-section-header{margin-bottom:48px;}
  .vp-section-header.centered{text-align:center;}
  .vp-section-header.centered .vp-section-sub{margin:0 auto;}
  .bg-mid{background:var(--navy-mid);}
  .bg-navy{background:var(--navy);}

  /* CHECKER */
  .vp-checker-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start;max-width:900px;margin:0 auto;}
  .vp-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:36px;backdrop-filter:blur(12px);}
  .vp-form-row{margin-bottom:20px;}
  .vp-form-label{display:block;font-size:0.8rem;font-weight:500;color:var(--slate-light);margin-bottom:8px;letter-spacing:0.03em;}
  .vp-form-input,.vp-form-select{width:100%;padding:11px 16px;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--white);font-size:0.9rem;outline:none;transition:border-color 0.2s,box-shadow 0.2s;appearance:none;}
  .vp-form-input:focus,.vp-form-select:focus{border-color:var(--sky);box-shadow:0 0 0 3px rgba(46,134,222,0.15);}
  .vp-form-input.error{border-color:var(--danger);}
  .vp-form-select option{background:var(--navy-mid);}
  .vp-err{font-size:0.75rem;color:var(--danger);margin-top:5px;}
  .vp-row-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .vp-submit-btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--sky),#1A6BC7);border:none;border-radius:var(--radius-sm);color:#fff;font-size:0.95rem;font-weight:600;transition:all 0.2s;box-shadow:0 4px 20px rgba(46,134,222,0.3);margin-top:8px;}
  .vp-submit-btn:hover{transform:translateY(-1px);}
  .vp-result-panel{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:36px;min-height:380px;display:flex;flex-direction:column;justify-content:center;}
  .vp-result-placeholder{text-align:center;color:var(--slate-light);}
  .vp-big-icon{font-size:3.5rem;margin-bottom:16px;opacity:0.4;}
  .vp-result-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;font-size:0.8rem;font-weight:600;margin-bottom:20px;}
  .badge-approved{background:rgba(34,197,94,0.15);color:var(--success);border:1px solid rgba(34,197,94,0.3);}
  .badge-visa-required{background:rgba(244,166,42,0.15);color:var(--gold);border:1px solid rgba(244,166,42,0.3);}
  .vp-result-title{font-family:var(--font-display);font-size:1.5rem;font-weight:700;margin-bottom:8px;}
  .vp-result-sub{color:var(--slate-light);font-size:0.88rem;margin-bottom:24px;}
  .vp-result-details{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .vp-detail-card{padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:var(--radius-sm);}
  .vp-detail-label{font-size:0.7rem;color:var(--slate-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;}
  .vp-detail-val{font-size:0.9rem;font-weight:600;font-family:var(--font-mono);}

  /* DESTINATIONS */
  .vp-dest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;max-width:1100px;margin:0 auto;}
  .vp-dest-card{position:relative;border-radius:var(--radius);overflow:hidden;cursor:pointer;aspect-ratio:4/3;background:var(--navy-light);display:flex;align-items:flex-end;transition:transform 0.3s;}
  .vp-dest-card:hover{transform:translateY(-4px);}
  .vp-dest-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:0.3;}
  .vp-dest-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,22,40,0.85) 0%,transparent 60%);}
  .vp-dest-info{position:relative;z-index:1;padding:20px;}
  .vp-dest-flag{font-size:1.8rem;margin-bottom:4px;}
  .vp-dest-name{font-family:var(--font-display);font-size:1.1rem;font-weight:700;}
  .vp-dest-meta{font-size:0.75rem;color:var(--slate-light);}
  .vp-dest-badge{position:absolute;top:14px;right:14px;z-index:2;padding:4px 10px;border-radius:100px;font-size:0.7rem;font-weight:600;}
  .vp-dest-badge.visa-free{background:rgba(34,197,94,0.2);color:var(--success);border:1px solid rgba(34,197,94,0.3);}
  .vp-dest-badge.visa-req{background:rgba(239,68,68,0.2);color:#fc8181;border:1px solid rgba(239,68,68,0.3);}
  .vp-dest-badge.visa-arr{background:rgba(244,166,42,0.2);color:var(--gold);border:1px solid rgba(244,166,42,0.3);}

  /* AI FEATURES */
  .vp-ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1100px;margin:0 auto;}
  .vp-ai-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:28px;transition:border-color 0.3s,transform 0.3s;}
  .vp-ai-card:hover{border-color:rgba(46,134,222,0.3);transform:translateY(-3px);}
  .vp-ai-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:16px;}
  .vp-ai-card-title{font-weight:700;font-size:1rem;margin-bottom:10px;}
  .vp-ai-card-desc{font-size:0.83rem;color:var(--slate-light);line-height:1.6;margin-bottom:14px;}
  .vp-ai-card-link{font-size:0.8rem;color:var(--sky);font-weight:600;cursor:pointer;}

  /* WIDGETS */
  .vp-widgets-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1100px;margin:0 auto;}
  .vp-widget-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:28px;}
  .vp-widget-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1rem;margin-bottom:20px;}
  .vp-widget-icon{font-size:1.3rem;}
  .vp-weather-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--glass-border);}
  .vp-weather-row:last-child{border-bottom:none;}
  .vp-weather-city{font-size:0.85rem;color:var(--slate-light);margin-bottom:2px;}
  .vp-weather-temp{font-family:var(--font-display);font-size:1.6rem;font-weight:700;}
  .vp-weather-desc{font-size:0.75rem;color:var(--slate-light);}
  .vp-weather-icon-big{font-size:2.5rem;}
  .vp-currency-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .vp-currency-input-wrap{flex:1;}
  .vp-currency-label-sm{font-size:0.72rem;color:var(--slate-light);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;}
  .vp-currency-val{width:100%;padding:10px 14px;background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--white);font-size:1rem;font-family:var(--font-mono);outline:none;}
  .vp-currency-arrow{font-size:1.3rem;color:var(--sky-light);flex-shrink:0;}
  .vp-currency-rate{font-size:0.8rem;color:var(--slate-light);margin-bottom:16px;}
  .vp-rates-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;}

  /* COST ESTIMATOR */
  .vp-cost-estimator{display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:900px;margin:0 auto;background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:36px;}
  .vp-trip-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px;}
  .vp-trip-type-btn{padding:12px 8px;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--slate-light);font-size:0.82rem;transition:all 0.2s;text-align:center;}
  .vp-trip-type-btn.active{background:rgba(46,134,222,0.15);border-color:rgba(46,134,222,0.4);color:var(--sky-light);}
  .vp-slider-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
  .vp-slider-val{font-family:var(--font-mono);font-size:0.88rem;color:var(--sky-light);}
  input[type=range]{width:100%;accent-color:var(--sky);}
  .vp-cost-donut-wrap{display:flex;justify-content:center;margin:20px 0;}
  .vp-donut-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;}
  .vp-donut-total{font-family:var(--font-mono);font-size:1.1rem;font-weight:700;color:var(--white);}
  .vp-donut-label{font-size:0.65rem;color:var(--slate-light);text-transform:uppercase;letter-spacing:0.06em;}
  .vp-cost-line{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
  .vp-cost-line:last-child{border-bottom:none;}
  .vp-cost-line-label{display:flex;align-items:center;gap:8px;font-size:0.85rem;}
  .vp-cost-dot{width:8px;height:8px;border-radius:50%;}
  .vp-cost-line-val{font-family:var(--font-mono);font-size:0.85rem;font-weight:600;}

  /* CHAT */
  .vp-chat-container{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);overflow:hidden;max-width:760px;margin:0 auto;}
  .vp-chat-header{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--glass-border);background:rgba(255,255,255,0.02);}
  .vp-chat-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
  .vp-chat-agent-name{font-weight:600;font-size:0.9rem;}
  .vp-chat-agent-status{font-size:0.72rem;color:var(--success);}
  .vp-chat-messages{height:360px;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;}
  .vp-msg{max-width:75%;}
  .vp-msg-bot{align-self:flex-start;}
  .vp-msg-user{align-self:flex-end;}
  .vp-msg-bubble{padding:12px 16px;border-radius:16px;font-size:0.875rem;line-height:1.55;}
  .vp-msg-bot .vp-msg-bubble{background:rgba(255,255,255,0.07);border:1px solid var(--glass-border);border-bottom-left-radius:4px;color:var(--white);}
  .vp-msg-user .vp-msg-bubble{background:linear-gradient(135deg,var(--sky),#1A6BC7);border-bottom-right-radius:4px;color:#fff;}
  .vp-msg-time{font-size:0.67rem;color:var(--slate-light);margin-top:4px;padding:0 4px;}
  .vp-msg-bot .vp-msg-time{text-align:left;}
  .vp-msg-user .vp-msg-time{text-align:right;}
  .vp-typing{display:flex;gap:4px;padding:12px 16px;background:rgba(255,255,255,0.07);border:1px solid var(--glass-border);border-radius:16px;border-bottom-left-radius:4px;width:fit-content;align-self:flex-start;}
  .vp-typing-dot{width:6px;height:6px;border-radius:50%;background:var(--slate-light);animation:typingBounce 1.2s infinite;}
  .vp-typing-dot:nth-child(2){animation-delay:0.2s;}
  .vp-typing-dot:nth-child(3){animation-delay:0.4s;}
  @keyframes typingBounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}
  .vp-chat-input-row{padding:16px 20px;background:rgba(255,255,255,0.02);border-top:1px solid var(--glass-border);display:flex;gap:10px;align-items:center;}
  .vp-chat-input{flex:1;padding:11px 16px;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:100px;color:var(--white);font-size:0.88rem;outline:none;transition:border-color 0.2s;}
  .vp-chat-input:focus{border-color:rgba(46,134,222,0.5);}
  .vp-chat-input::placeholder{color:var(--slate-light);}
  .vp-chat-send{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--sky),#1A6BC7);border:none;color:#fff;font-size:1rem;transition:transform 0.2s;display:flex;align-items:center;justify-content:center;}
  .vp-chat-send:hover{transform:scale(1.08);}
  .vp-quick-btns{padding:0 20px 12px;display:flex;gap:8px;flex-wrap:wrap;}
  .vp-quick-btn{padding:5px 13px;border:1px solid var(--glass-border);border-radius:100px;background:transparent;color:var(--slate-light);font-size:0.75rem;cursor:pointer;transition:all 0.2s;}
  .vp-quick-btn:hover{border-color:var(--sky);color:var(--sky-light);}

  /* CHECKLIST */
  .vp-checklist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;max-width:1100px;margin:0 auto;}
  .vp-checklist-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:24px;}
  .vp-checklist-header{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
  .vp-checklist-icon-wrap{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;}
  .vp-checklist-cat{font-weight:600;font-size:0.95rem;}
  .vp-checklist-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.83rem;color:var(--slate-light);cursor:pointer;transition:color 0.2s;}
  .vp-checklist-item:last-child{border-bottom:none;}
  .vp-checklist-item:hover{color:var(--white);}
  .vp-check-box{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--slate);flex-shrink:0;transition:all 0.2s;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;}
  .vp-check-box.checked{background:var(--success);border-color:var(--success);}
  .vp-checklist-item.checked span{text-decoration:line-through;opacity:0.5;}
  .vp-download-btn{width:100%;margin-top:16px;padding:9px;border:1px solid var(--glass-border);border-radius:var(--radius-sm);background:transparent;color:var(--slate-light);font-size:0.78rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;}
  .vp-download-btn:hover{border-color:var(--sky);color:var(--sky);}

  /* NEWS */
  .vp-news-grid{display:grid;grid-template-columns:2fr 1fr;gap:24px;max-width:1100px;margin:0 auto;}
  .vp-news-featured{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;}
  .vp-news-featured:hover{transform:translateY(-3px);box-shadow:var(--card-shadow);}
  .vp-news-img{height:200px;background:linear-gradient(135deg,var(--navy-light),var(--navy));display:flex;align-items:center;justify-content:center;font-size:4rem;position:relative;}
  .vp-news-category-tag{position:absolute;top:14px;left:14px;padding:3px 10px;border-radius:100px;font-size:0.68rem;font-weight:600;background:rgba(46,134,222,0.3);color:var(--sky-light);border:1px solid rgba(46,134,222,0.3);}
  .vp-news-body{padding:20px;}
  .vp-news-date{font-size:0.72rem;color:var(--slate-light);margin-bottom:8px;font-family:var(--font-mono);}
  .vp-news-headline{font-family:var(--font-display);font-size:1.1rem;font-weight:600;line-height:1.3;margin-bottom:10px;}
  .vp-news-excerpt{font-size:0.82rem;color:var(--slate-light);line-height:1.6;}
  .vp-news-list{display:flex;flex-direction:column;gap:12px;}
  .vp-news-item{display:flex;gap:14px;align-items:flex-start;padding:14px;background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius-sm);cursor:pointer;transition:border-color 0.2s;}
  .vp-news-item:hover{border-color:rgba(46,134,222,0.3);}
  .vp-news-item-emoji{font-size:1.4rem;flex-shrink:0;padding-top:2px;}
  .vp-news-item-title{font-size:0.83rem;font-weight:500;line-height:1.4;margin-bottom:4px;}
  .vp-news-item-meta{font-size:0.7rem;color:var(--slate-light);}

  /* DASHBOARD */
  .vp-dashboard-grid{display:grid;grid-template-columns:240px 1fr;gap:24px;max-width:1100px;margin:0 auto;}
  .vp-dash-sidebar{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:20px;}
  .vp-dash-profile{text-align:center;padding-bottom:20px;border-bottom:1px solid var(--glass-border);margin-bottom:16px;}
  .vp-dash-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin:0 auto 10px;}
  .vp-dash-name{font-weight:600;font-size:0.9rem;}
  .vp-dash-email{font-size:0.72rem;color:var(--slate-light);}
  .vp-dash-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);font-size:0.85rem;cursor:pointer;color:var(--slate-light);transition:all 0.2s;margin-bottom:4px;}
  .vp-dash-nav-item:hover{background:var(--glass);color:var(--white);}
  .vp-dash-nav-item.active{background:rgba(46,134,222,0.15);color:var(--sky-light);}
  .vp-dash-content{background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:24px;}
  .vp-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;}
  .vp-metric-card{padding:16px;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:var(--radius-sm);}
  .vp-metric-label{font-size:0.72rem;color:var(--slate-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;}
  .vp-metric-val{font-family:var(--font-mono);font-size:1.5rem;font-weight:700;}
  .sky{color:var(--sky-light);} .gold{color:var(--gold);} .green{color:var(--success);}
  .vp-dash-section-title{font-weight:600;font-size:0.88rem;margin-bottom:14px;color:var(--slate-light);text-transform:uppercase;letter-spacing:0.06em;}
  .vp-recent-item{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;margin-bottom:8px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);font-size:0.83rem;}
  .vp-recent-arrow{color:var(--sky);font-size:0.8rem;}
  .vp-recent-date{font-size:0.72rem;color:var(--slate-light);font-family:var(--font-mono);}
  .vp-recent-status{padding:2px 10px;border-radius:100px;font-size:0.68rem;font-weight:600;}
  .status-free{background:rgba(34,197,94,0.15);color:var(--success);}
  .status-req{background:rgba(244,166,42,0.15);color:var(--gold);}

  /* FAQ */
  .vp-faq-wrap{max-width:720px;margin:0 auto;}
  .vp-faq-item{border-bottom:1px solid var(--glass-border);}
  .vp-faq-question{display:flex;align-items:center;justify-content:space-between;padding:20px 0;cursor:pointer;font-weight:500;font-size:0.95rem;transition:color 0.2s;gap:16px;}
  .vp-faq-question:hover{color:var(--sky-light);}
  .vp-faq-chevron{width:22px;height:22px;border-radius:50%;background:var(--glass);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;transition:transform 0.3s,background 0.3s;}
  .vp-faq-item.open .vp-faq-chevron{transform:rotate(180deg);background:rgba(46,134,222,0.2);border-color:rgba(46,134,222,0.3);}
  .vp-faq-answer{max-height:0;overflow:hidden;transition:max-height 0.3s ease;color:var(--slate-light);font-size:0.875rem;line-height:1.7;}
  .vp-faq-item.open .vp-faq-answer{max-height:200px;}
  .vp-faq-answer-inner{padding-bottom:20px;}

  /* DEPLOY */
  .vp-deploy-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:1000px;margin:0 auto;align-items:center;}
  .vp-deploy-tag{display:inline-flex;align-items:center;gap:7px;padding:4px 12px;border-radius:100px;background:rgba(46,134,222,0.1);border:1px solid rgba(46,134,222,0.3);font-size:0.72rem;color:var(--sky);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;}
  .vp-deploy-steps{margin-top:24px;display:flex;flex-direction:column;gap:14px;}
  .vp-deploy-step{display:flex;gap:14px;align-items:flex-start;}
  .vp-step-num{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:rgba(46,134,222,0.15);border:1px solid rgba(46,134,222,0.3);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:var(--sky);font-family:var(--font-mono);}
  .vp-step-title{font-weight:600;font-size:0.88rem;margin-bottom:2px;}
  .vp-step-desc{font-size:0.78rem;color:var(--slate-light);}
  .vp-code-card{background:var(--navy);border:1px solid var(--glass-border);border-radius:var(--radius);overflow:hidden;}
  .vp-code-header{padding:10px 16px;background:rgba(255,255,255,0.04);border-bottom:1px solid var(--glass-border);display:flex;align-items:center;gap:6px;}
  .vp-code-dot{width:10px;height:10px;border-radius:50%;}
  .vp-code-filename{font-family:var(--font-mono);font-size:0.72rem;color:var(--slate-light);margin-left:6px;}
  .vp-pre{padding:20px;font-family:var(--font-mono);font-size:0.78rem;line-height:1.6;overflow-x:auto;color:#A0AEC0;}
  .code-key{color:#FC8181;} .code-str{color:#68D391;} .code-comment{color:#4A5568;} .code-val{color:#F6E05E;}

  /* FOOTER */
  .vp-footer{background:var(--navy);border-top:1px solid var(--glass-border);padding:60px 5% 28px;}
  .vp-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1100px;margin:0 auto 48px;}
  .vp-footer-desc{font-size:0.83rem;color:var(--slate-light);line-height:1.7;max-width:280px;margin-bottom:20px;margin-top:14px;}
  .vp-social-links{display:flex;gap:10px;}
  .vp-social-btn{width:34px;height:34px;border-radius:8px;background:var(--glass);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:center;font-size:0.9rem;cursor:pointer;transition:all 0.2s;}
  .vp-social-btn:hover{border-color:var(--sky);color:var(--sky);}
  .vp-footer-col h4{font-size:0.85rem;font-weight:700;margin-bottom:16px;color:var(--white);}
  .vp-footer-links{list-style:none;}
  .vp-footer-links li{margin-bottom:10px;}
  .vp-footer-links a{font-size:0.82rem;color:var(--slate-light);transition:color 0.2s;}
  .vp-footer-links a:hover{color:var(--white);}
  .vp-footer-bottom{display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto;padding-top:24px;border-top:1px solid var(--glass-border);font-size:0.78rem;color:var(--slate-light);}
  .vp-footer-badges{display:flex;gap:8px;}
  .vp-footer-badge{padding:4px 12px;border:1px solid var(--glass-border);border-radius:100px;font-size:0.7rem;background:var(--glass);}

  /* MODAL */
  .vp-modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s;}
  .vp-modal-overlay.show{opacity:1;pointer-events:all;}
  .vp-modal{display:grid;grid-template-columns:1fr 1fr;border-radius:var(--radius);overflow:hidden;width:min(820px,95vw);box-shadow:0 24px 64px rgba(0,0,0,0.5);}
  .vp-modal-image{background:linear-gradient(135deg,var(--navy-light),var(--sky));padding:48px 36px;display:flex;align-items:flex-end;}
  .vp-modal-image-title{font-family:var(--font-display);font-size:1.8rem;font-weight:700;line-height:1.2;margin-bottom:12px;}
  .vp-modal-image-sub{font-size:0.85rem;color:rgba(248,250,255,0.75);line-height:1.6;}
  .vp-modal-form{background:var(--navy-mid);padding:36px;position:relative;}
  .vp-modal-close{position:absolute;top:16px;right:16px;width:30px;height:30px;border-radius:50%;background:var(--glass);border:1px solid var(--glass-border);color:var(--white);font-size:0.9rem;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .vp-modal-title{font-family:var(--font-display);font-size:1.5rem;font-weight:700;margin-bottom:6px;}
  .vp-modal-sub{font-size:0.82rem;color:var(--slate-light);margin-bottom:22px;}
  .vp-modal-tabs{display:flex;gap:4px;margin-bottom:22px;background:rgba(255,255,255,0.04);border-radius:var(--radius-sm);padding:4px;}
  .vp-modal-tab{flex:1;padding:8px;border:none;background:transparent;color:var(--slate-light);font-size:0.82rem;font-weight:500;border-radius:6px;cursor:pointer;transition:all 0.2s;}
  .vp-modal-tab.active{background:var(--navy);color:var(--white);}
  .vp-otp-row{display:flex;gap:8px;}
  .vp-otp-send-btn{padding:11px 14px;background:rgba(46,134,222,0.15);border:1px solid rgba(46,134,222,0.3);border-radius:var(--radius-sm);color:var(--sky-light);font-size:0.78rem;font-weight:600;white-space:nowrap;cursor:pointer;transition:all 0.2s;}
  .vp-otp-send-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .vp-otp-hint{font-size:0.75rem;color:var(--success);margin-top:5px;display:none;}
  .vp-otp-hint.show{display:block;}

  /* TOAST */
  .vp-toast{position:fixed;bottom:24px;right:24px;z-index:300;display:flex;align-items:center;gap:10px;padding:14px 20px;background:rgba(17,32,64,0.95);border:1px solid var(--glass-border);border-radius:var(--radius-sm);backdrop-filter:blur(12px);font-size:0.88rem;transform:translateY(80px);opacity:0;transition:all 0.3s;box-shadow:0 8px 32px rgba(0,0,0,0.3);}
  .vp-toast.show{transform:translateY(0);opacity:1;}
`;

/* ══════════════════════════════════════
   UTILITY HOOKS
══════════════════════════════════════ */
function useToast() {
  const [toast, setToast] = useState({ msg:"", show:false });
  const timerRef = useRef(null);
  const showToast = useCallback((msg) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, show:true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show:false })), 3000);
  }, []);
  return [toast, showToast];
}

/* ══════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════ */

function Navbar({ onSignIn }) {
  return (
    <nav className="vp-nav">
      <div className="vp-nav-logo">
        <div className="vp-logo-icon">✈️</div>
        VisaPath
      </div>
      <ul className="vp-nav-links">
        {["#checker","#ai-features","#cost","#chat","#checklist","#faq"].map((href, i) => (
          <li key={href}><a href={href}>{["Visa Check","AI Tools","Cost Estimator","AI Chat","Checklist","FAQ"][i]}</a></li>
        ))}
      </ul>
      <div className="vp-nav-actions">
        <button className="btn-ghost" onClick={onSignIn}>Sign In</button>
        <button className="btn-primary" onClick={onSignIn}>Get Started</button>
      </div>
    </nav>
  );
}

function Hero({ showToast }) {
  const tags = ["🇯🇵 Japan","🇫🇷 France","🇺🇸 United States","🇸🇬 Singapore","🇬🇧 United Kingdom","🇹🇭 Thailand","🇦🇪 Dubai","🇨🇦 Canada"];
  return (
    <section className="vp-hero">
      <div className="vp-orb vp-orb-1" />
      <div className="vp-orb vp-orb-2" />
      <div className="vp-eyebrow"><span className="vp-dot" />AI-Powered · 195 Countries · Real-Time Data</div>
      <h1 className="vp-hero-title">
        Your <span className="vp-sky-text">Smart Visa</span> &{" "}
        <span className="vp-accent">Travel</span> Requirements Checker
      </h1>
      <p className="vp-hero-sub">Instant visa eligibility, AI trip planning, live forex rates, and personalized travel checklists — all in one intelligent platform.</p>
      <div className="vp-hero-search">
        <span style={{fontSize:"1.1rem",opacity:0.5}}>🔍</span>
        <input placeholder='Search "India to Japan visa requirements"...' id="heroSearchInput" />
        <div className="vp-search-sep" />
        <select><option>All Passports</option><option>Indian</option><option>US</option></select>
        <button className="vp-search-btn" onClick={() => document.getElementById("checker")?.scrollIntoView({behavior:"smooth"})}>Check Visa</button>
      </div>
      <div className="vp-tags">
        {tags.map(t => (
          <span key={t} className="vp-tag" onClick={() => document.getElementById("checker")?.scrollIntoView({behavior:"smooth"})}>{t}</span>
        ))}
      </div>
      <div className="vp-stats">
        {[["195","Countries Covered"],["2.4M+","Visa Checks Done"],["98.4%","Data Accuracy"]].map(([n,l]) => (
          <div key={l} style={{textAlign:"center"}}>
            <div className="vp-stat-num" dangerouslySetInnerHTML={{__html:n.replace(/(\d)/,"$1")}} />
            <div className="vp-stat-label">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VisaChecker({ showToast }) {
  const [form, setForm] = useState({ passportCountry:"", destCountry:"", travelDate:"", passportExpiry:"", visitPurpose:"" });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const check = () => {
    const errs = {};
    if (!form.passportCountry) errs.passportCountry = "Please select your passport country.";
    if (!form.destCountry) errs.destCountry = "Please select a destination country.";
    if (!form.travelDate) errs.travelDate = "Please select a travel date.";
    if (!form.passportExpiry) errs.passportExpiry = "Passport expiry date is required.";
    else if (form.travelDate) {
      const t = new Date(form.travelDate), exp = new Date(form.passportExpiry);
      const sixMonths = new Date(t); sixMonths.setMonth(sixMonths.getMonth() + 6);
      if (exp < sixMonths) errs.passportExpiry = "⚠️ Passport must be valid for at least 6 months beyond travel date.";
    }
    if (!form.visitPurpose) errs.visitPurpose = "Please select a purpose of visit.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const key = `${form.passportCountry}_${form.destCountry}`;
    const data = VISA_DATA[key] || VISA_DATA.DEFAULT;
    setResult(data);
    showToast(`${data.icon} ${data.title} — ${data.label}`);
  };

  const inp = (k) => ({ value:form[k], onChange:e=>set(k,e.target.value), className:`vp-form-${k==="visitPurpose"||k==="passportCountry"||k==="destCountry"?"select":"input"}${errors[k]?" error":""}` });

  return (
    <section className="vp-section bg-mid" id="checker">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO5 — Form Validation</div>
          <h2 className="vp-section-title">Instant Visa Checker</h2>
          <p className="vp-section-sub">Enter your passport and destination to instantly check visa requirements, processing times, and fees.</p>
        </div>
        <div className="vp-checker-grid">
          <div className="vp-card">
            <div className="vp-form-row">
              <label className="vp-form-label">Passport Country</label>
              <select {...inp("passportCountry")}>
                <option value="">Select your passport</option>
                <option value="IN">🇮🇳 India</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
              </select>
              {errors.passportCountry && <div className="vp-err">{errors.passportCountry}</div>}
            </div>
            <div className="vp-form-row">
              <label className="vp-form-label">Destination Country</label>
              <select {...inp("destCountry")}>
                <option value="">Select destination</option>
                {[["JP","🇯🇵 Japan"],["TH","🇹🇭 Thailand"],["AE","🇦🇪 UAE (Dubai)"],["SG","🇸🇬 Singapore"],["FR","🇫🇷 France"],["UK","🇬🇧 United Kingdom"],["CA","🇨🇦 Canada"],["US","🇺🇸 United States"]].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              {errors.destCountry && <div className="vp-err">{errors.destCountry}</div>}
            </div>
            <div className="vp-row-split">
              <div className="vp-form-row">
                <label className="vp-form-label">Travel Date</label>
                <input type="date" {...inp("travelDate")} min={today} />
                {errors.travelDate && <div className="vp-err">{errors.travelDate}</div>}
              </div>
              <div className="vp-form-row">
                <label className="vp-form-label">Passport Expiry</label>
                <input type="date" {...inp("passportExpiry")} />
                {errors.passportExpiry && <div className="vp-err">{errors.passportExpiry}</div>}
              </div>
            </div>
            <div className="vp-form-row">
              <label className="vp-form-label">Purpose of Visit</label>
              <select {...inp("visitPurpose")}>
                <option value="">Select purpose</option>
                <option value="tourism">Tourism / Holiday</option>
                <option value="business">Business</option>
                <option value="study">Study</option>
                <option value="transit">Transit</option>
              </select>
              {errors.visitPurpose && <div className="vp-err">{errors.visitPurpose}</div>}
            </div>
            <button className="vp-submit-btn" onClick={check}>Check Visa Requirements →</button>
          </div>

          <div className="vp-result-panel">
            {!result ? (
              <div className="vp-result-placeholder">
                <div className="vp-big-icon">🌍</div>
                <p>Select your passport and destination to see visa requirements instantly.</p>
              </div>
            ) : (
              <div>
                <div className={`vp-result-badge ${result.badge==="approved"?"badge-approved":"badge-visa-required"}`}>
                  {result.icon} {result.label}
                </div>
                <div className="vp-result-title">{result.title}</div>
                <div className="vp-result-sub">{result.sub}</div>
                <div className="vp-result-details">
                  {[["Visa Type",result.type],["Max Stay",result.stay],["Processing",result.process],["Visa Fee",result.fee],["Health Status",result.health],["Passport",result.passportStatus]].map(([l,v])=>(
                    <div key={l} className="vp-detail-card">
                      <div className="vp-detail-label">{l}</div>
                      <div className="vp-detail-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Destinations({ showToast }) {
  return (
    <section className="vp-section" id="destinations">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header centered">
          <div className="vp-section-label">CO1 — Component-Driven Design</div>
          <h2 className="vp-section-title">Popular Destinations</h2>
          <p className="vp-section-sub">Top travel destinations for Indian passport holders — with instant visa status.</p>
        </div>
        <div className="vp-dest-grid">
          {DESTINATIONS.map(d => (
            <div key={d.name} className="vp-dest-card" onClick={() => showToast(`✈️ Loading ${d.name} travel info...`)}>
              <div className="vp-dest-bg">{d.flag}</div>
              <div className="vp-dest-overlay" />
              <div className="vp-dest-info">
                <div className="vp-dest-flag">{d.flag}</div>
                <div className="vp-dest-name">{d.name}</div>
                <div className="vp-dest-meta">{d.meta}</div>
              </div>
              <div className={`vp-dest-badge ${d.badge}`}>{d.badgeLabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIFeatures() {
  const cards = [
    { icon:"🤖", bg:"rgba(46,134,222,0.15)", title:"AI Visa Eligibility Predictor", desc:"Our ML model analyzes your passport strength, travel history, and financial profile to predict visa approval probability with 94% accuracy.", link:"Try Predictor →" },
    { icon:"🗺️", bg:"rgba(244,166,42,0.15)", title:"AI Trip Planner", desc:"Tell us your dates, budget, and interests. Our AI builds a complete day-by-day itinerary covering transport, stays, attractions, and dining.", link:"Plan My Trip →" },
    { icon:"💰", bg:"rgba(34,197,94,0.15)", title:"AI Budget Estimator", desc:"Real-time cost calculations for flights, accommodation, food, and activities — personalized to your travel style and destination city.", link:"Estimate Budget →" },
    { icon:"🌟", bg:"rgba(139,92,246,0.15)", title:"AI Destination Recommender", desc:"Based on your passport, past travels, budget, and season — we surface hidden gems and trending destinations perfectly suited for you.", link:"Get Recommendations →" },
    { icon:"⚠️", bg:"rgba(239,68,68,0.15)", title:"AI Travel Risk Analyzer", desc:"Real-time safety assessment combining government advisories, geopolitical events, health alerts, and crime indices for any destination.", link:"Analyze Risk →" },
    { icon:"📅", bg:"rgba(20,184,166,0.15)", title:"AI Itinerary Generator", desc:"Generate a shareable, editable travel itinerary in seconds. Export to PDF, Google Calendar, or send to friends — all AI-crafted to perfection.", link:"Generate Itinerary →" }
  ];
  return (
    <section className="vp-section bg-mid" id="ai-features">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header centered">
          <div className="vp-section-label">Powered by AI</div>
          <h2 className="vp-section-title">Smart Travel Intelligence</h2>
          <p className="vp-section-sub">Six AI-powered tools that handle every part of your travel planning — from visa prediction to full itinerary generation.</p>
        </div>
        <div className="vp-ai-grid">
          {cards.map(c => (
            <div key={c.title} className="vp-ai-card">
              <div className="vp-ai-icon" style={{background:c.bg}}>{c.icon}</div>
              <div className="vp-ai-card-title">{c.title}</div>
              <div className="vp-ai-card-desc">{c.desc}</div>
              <div className="vp-ai-card-link">{c.link}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Widgets() {
  const [currFrom, setCurrFrom] = useState(10000);
  const [currTo, setCurrTo] = useState("JPY");
  const rate = RATES[currTo] || 1;
  const converted = (currFrom * rate).toFixed(2);
  return (
    <section className="vp-section" id="widgets">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO4 — API Integration</div>
          <h2 className="vp-section-title">Weather & Currency</h2>
          <p className="vp-section-sub">Real-time data from global weather and forex APIs, updated every 15 minutes.</p>
        </div>
        <div className="vp-widgets-grid">
          <div className="vp-widget-card">
            <div className="vp-widget-title"><div className="vp-widget-icon">🌤️</div>Weather at Your Destination</div>
            {[["Tokyo, Japan","24°C","Partly Cloudy · 68% humidity","⛅"],["Paris, France","18°C","Light Rain · 72% humidity","🌧️"],["Dubai, UAE","38°C","Sunny · 30% humidity","☀️"]].map(([city,temp,desc,ico])=>(
              <div key={city} className="vp-weather-row">
                <div><div className="vp-weather-city">{city}</div><div className="vp-weather-temp">{temp}</div><div className="vp-weather-desc">{desc}</div></div>
                <div className="vp-weather-icon-big">{ico}</div>
              </div>
            ))}
          </div>
          <div className="vp-widget-card">
            <div className="vp-widget-title"><div className="vp-widget-icon">💱</div>Currency Converter</div>
            <div className="vp-currency-row">
              <div className="vp-currency-input-wrap">
                <div className="vp-currency-label-sm">From (INR)</div>
                <input type="number" className="vp-currency-val" value={currFrom} onChange={e=>setCurrFrom(parseFloat(e.target.value)||0)} />
              </div>
              <div className="vp-currency-arrow">⇄</div>
              <div className="vp-currency-input-wrap">
                <div className="vp-currency-label-sm">
                  <select value={currTo} onChange={e=>setCurrTo(e.target.value)} style={{background:"transparent",border:"none",color:"var(--slate-light)",fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>
                    {Object.keys(RATES).map(k=><option key={k} value={k}>TO ({k})</option>)}
                  </select>
                </div>
                <input type="number" className="vp-currency-val" value={converted} readOnly />
              </div>
            </div>
            <div className="vp-currency-rate">Current rate: 1 INR = <strong>{rate} {currTo}</strong></div>
            <div className="vp-currency-label-sm" style={{marginBottom:12}}>Quick Rates (base: 1 INR)</div>
            <div className="vp-rates-grid">
              {Object.entries(RATES).slice(0,4).map(([k,v])=>(
                <div key={k} className="vp-detail-card"><div className="vp-detail-label">{k}</div><div className="vp-detail-val">{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CostEstimator() {
  const [dest, setDest] = useState("JP");
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState("mid");
  const [travelers, setTravelers] = useState(2);
  const [slider, setSlider] = useState(3500);

  const base = COST_BASE[dest];
  const mult = STYLE_MULT[style];
  const flight = Math.round(base.flight * mult * travelers);
  const stay   = Math.round(base.stay * mult * days * travelers);
  const food   = Math.round(base.food * mult * days * travelers);
  const act    = Math.round(base.activity * mult * days);
  const visa   = Math.round(base.visa * travelers);
  const total  = flight + stay + food + act + visa;

  const fmt = n => n.toLocaleString("en-IN");
  const circ = 2 * Math.PI * 60;
  const segs = [flight, stay, food, act].map(v => (v / total) * circ);
  const offsets = segs.reduce((acc, s, i) => { acc.push(i===0?0:acc[i-1]+segs[i-1]); return acc; }, []);

  return (
    <section className="vp-section" id="cost" style={{background:"var(--navy)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO3 — State Management</div>
          <h2 className="vp-section-title">Travel Cost Estimator</h2>
          <p className="vp-section-sub">Plan your trip budget dynamically. State updates in real-time as you adjust your preferences.</p>
        </div>
        <div className="vp-cost-estimator">
          <div>
            <div className="vp-form-row">
              <label className="vp-form-label">Destination</label>
              <select className="vp-form-select" value={dest} onChange={e=>setDest(e.target.value)}>
                <option value="JP">🇯🇵 Japan (Tokyo)</option>
                <option value="TH">🇹🇭 Thailand (Bangkok)</option>
                <option value="FR">🇫🇷 France (Paris)</option>
                <option value="AE">🇦🇪 UAE (Dubai)</option>
                <option value="SG">🇸🇬 Singapore</option>
              </select>
            </div>
            <div className="vp-form-row">
              <label className="vp-form-label">Duration</label>
              <select className="vp-form-select" value={days} onChange={e=>setDays(parseInt(e.target.value))}>
                {[5,7,10,14,21].map(d=><option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div className="vp-form-row">
              <div className="vp-form-label">Trip Style</div>
              <div className="vp-trip-type-grid">
                {[["budget","🎒 Budget"],["mid","🏨 Mid-range"],["luxury","✨ Luxury"]].map(([s,l])=>(
                  <button key={s} className={`vp-trip-type-btn${style===s?" active":""}`} onClick={()=>setStyle(s)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="vp-form-row">
              <label className="vp-form-label">Travelers</label>
              <select className="vp-form-select" value={travelers} onChange={e=>setTravelers(parseInt(e.target.value))}>
                {[1,2,3,4].map(n=><option key={n} value={n}>{n} traveler{n>1?"s":""}</option>)}
              </select>
            </div>
            <div style={{marginTop:8}}>
              <div className="vp-slider-header">
                <span className="vp-form-label" style={{margin:0}}>Daily Spending Limit</span>
                <span className="vp-slider-val">₹{slider.toLocaleString("en-IN")}</span>
              </div>
              <input type="range" min={500} max={10000} step={100} value={slider} onChange={e=>setSlider(parseInt(e.target.value))} />
            </div>
          </div>

          <div>
            <div style={{fontWeight:600,marginBottom:20}}>Estimated Budget Breakdown</div>
            <div className="vp-cost-donut-wrap">
              <div style={{position:"relative",display:"inline-block"}}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="20"/>
                  {[["#2E86DE","#F4A62A","#22C55E","#A78BFA"]].flat().map((col,i)=>(
                    <circle key={col} cx="80" cy="80" r="60" fill="none" stroke={col} strokeWidth="20"
                      strokeDasharray={`${segs[i].toFixed(1)} ${circ.toFixed(1)}`}
                      strokeDashoffset={(-offsets[i]).toFixed(1)}
                      transform="rotate(-90 80 80)" />
                  ))}
                </svg>
                <div className="vp-donut-center">
                  <div className="vp-donut-total">₹{fmt(total)}</div>
                  <div className="vp-donut-label">Total Est.</div>
                </div>
              </div>
            </div>
            {[["Flights","#2E86DE",fmt(flight)],["Accommodation","#F4A62A",fmt(stay)],["Food & Dining","#22C55E",fmt(food)],["Activities","#A78BFA",fmt(act)]].map(([l,c,v])=>(
              <div key={l} className="vp-cost-line">
                <span className="vp-cost-line-label"><span className="vp-cost-dot" style={{background:c}} />{ l}</span>
                <span className="vp-cost-line-val">₹{v}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid var(--glass-border)",margin:"14px 0"}} />
            <div className="vp-cost-line" style={{fontWeight:600}}>
              <span>Visa & Misc</span>
              <span className="vp-cost-line-val" style={{color:"var(--gold)"}}>₹{fmt(visa)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chatbot() {
  const [messages, setMessages] = useState([{ role:"bot", text:"Hello! 👋 I'm VisaPath AI. I can help you with visa requirements, travel documents, entry rules, health advisories, and trip planning. What would you like to know today?", time:"Just now" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);

  const now = () => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});

  const send = useCallback(async (msg) => {
    if (!msg.trim()) return;
    const userMsg = { role:"user", text:msg, time:now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    const lower = msg.toLowerCase();
    let resp = AI_RESPONSES.default;
    for (const [key, val] of Object.entries(AI_RESPONSES)) {
      if (key !== "default" && lower.includes(key)) { resp = val; break; }
    }
    setTyping(false);
    setMessages(m => [...m, { role:"bot", text:resp, time:now() }]);
  }, []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typing]);

  const quickBtns = [
    ["📄 Schengen Documents","What documents do I need for a Schengen visa?"],
    ["🇯🇵 Japan Safety","Is Japan safe to visit right now?"],
    ["🇹🇭 Thailand Tips","Best time to visit Thailand?"],
    ["🇺🇸 US Visa Timeline","How long does a US visa take to process?"]
  ];

  return (
    <section className="vp-section bg-mid" id="chat">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header centered">
          <div className="vp-section-label">CO2 — Async/Await · CO4 — API Integration</div>
          <h2 className="vp-section-title">Ask VisaPath AI</h2>
          <p className="vp-section-sub">Your 24/7 travel intelligence companion. Ask anything about visas, documents, destinations, or trip planning.</p>
        </div>
        <div className="vp-chat-container">
          <div className="vp-chat-header">
            <div className="vp-chat-avatar">🤖</div>
            <div>
              <div className="vp-chat-agent-name">VisaPath AI</div>
              <div className="vp-chat-agent-status">● Online — responds instantly</div>
            </div>
          </div>
          <div className="vp-chat-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`vp-msg vp-msg-${m.role}`}>
                <div className="vp-msg-bubble">{m.text}</div>
                <div className="vp-msg-time">{m.time}</div>
              </div>
            ))}
            {typing && (
              <div className="vp-typing">
                {[0,1,2].map(i=><div key={i} className="vp-typing-dot" style={{animationDelay:`${i*0.2}s`}} />)}
              </div>
            )}
          </div>
          <div className="vp-quick-btns">
            {quickBtns.map(([l,q])=>(
              <button key={l} className="vp-quick-btn" onClick={()=>send(q)}>{l}</button>
            ))}
          </div>
          <div className="vp-chat-input-row">
            <input className="vp-chat-input" value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send(input)}
              placeholder="Ask about visas, documents, destinations..." />
            <button className="vp-chat-send" onClick={()=>send(input)}>➤</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Checklist({ showToast }) {
  const [checked, setChecked] = useState({});
  const toggle = (key) => setChecked(c => ({ ...c, [key]:!c[key] }));
  return (
    <section className="vp-section" id="checklist" style={{background:"var(--navy-mid)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO1 — Component-Driven Design</div>
          <h2 className="vp-section-title">Downloadable Travel Checklists</h2>
          <p className="vp-section-sub">Comprehensive pre-travel checklists for documents, health, packing, and finance. Check items off and download as PDF.</p>
        </div>
        <div className="vp-checklist-grid">
          {CHECKLIST_CARDS.map(card => (
            <div key={card.cat} className="vp-checklist-card">
              <div className="vp-checklist-header">
                <div className="vp-checklist-icon-wrap" style={{background:card.color}}>{card.icon}</div>
                <div className="vp-checklist-cat">{card.cat}</div>
              </div>
              {card.items.map(item => {
                const key = `${card.cat}-${item}`;
                const isChecked = !!checked[key];
                return (
                  <div key={item} className={`vp-checklist-item${isChecked?" checked":""}`} onClick={()=>toggle(key)}>
                    <div className={`vp-check-box${isChecked?" checked":""}`}>{isChecked?"✓":""}</div>
                    <span>{item}</span>
                  </div>
                );
              })}
              <button className="vp-download-btn" onClick={()=>showToast("📥 Checklist downloaded as PDF!")}>⬇ Download PDF</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TravelNews({ showToast }) {
  return (
    <section className="vp-section bg-mid" id="news">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO2 — Async/Await</div>
          <h2 className="vp-section-title">Latest Travel Updates</h2>
          <p className="vp-section-sub">Real-time travel advisories, visa policy changes, and destination news — loaded asynchronously.</p>
        </div>
        <div className="vp-news-grid">
          <div className="vp-news-featured" onClick={()=>showToast("📰 Opening full article...")}>
            <div className="vp-news-img">🇪🇺<div className="vp-news-category-tag">Visa Policy</div></div>
            <div className="vp-news-body">
              <div className="vp-news-date">Jun 10, 2026</div>
              <div className="vp-news-headline">Schengen Visa-Free Access Expanded for 8 New Countries in 2026</div>
              <div className="vp-news-excerpt">The European Union has approved visa-free travel for passport holders from eight additional countries, effective July 1, 2026. The move is expected to boost tourism by 22% across the eurozone...</div>
            </div>
          </div>
          <div className="vp-news-list">
            {[["🇯🇵","Japan Extends Digital Nomad Visa to 24 Months","Jun 08, 2026 · Visa Updates"],
              ["🇦🇪","UAE Launches 5-Year Green Visa for Indian Professionals","Jun 07, 2026 · Visa Updates"],
              ["✈️","Thailand Announces 60-Day Visa-Free for Indian Tourists","Jun 05, 2026 · Travel Policy"],
              ["⚠️","Health Advisory: Updated Yellow Fever Requirements for 3 African Countries","Jun 03, 2026 · Health Advisory"]].map(([e,t,m])=>(
              <div key={t} className="vp-news-item" onClick={()=>showToast("📰 Opening article...")}>
                <div className="vp-news-item-emoji">{e}</div>
                <div><div className="vp-news-item-title">{t}</div><div className="vp-news-item-meta">{m}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Dashboard({ showToast }) {
  const [activeTab, setActiveTab] = useState("📊 Overview");
  const tabs = ["📊 Overview","🔍 My Searches","❤️ Saved Trips","📄 Applications","⚙️ Settings"];
  return (
    <section className="vp-section" id="dashboard">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO3 — State Management</div>
          <h2 className="vp-section-title">Your Travel Hub</h2>
          <p className="vp-section-sub">Manage your searches, saved destinations, visa applications, and travel history — all in one stateful dashboard.</p>
        </div>
        <div className="vp-dashboard-grid">
          <div className="vp-dash-sidebar">
            <div className="vp-dash-profile">
              <div className="vp-dash-avatar">👤</div>
              <div className="vp-dash-name">Poojitha R.</div>
              <div className="vp-dash-email">traveler@visapath.io</div>
            </div>
            {tabs.map(t => (
              <div key={t} className={`vp-dash-nav-item${activeTab===t?" active":""}`} onClick={()=>{ setActiveTab(t); showToast(`📋 Switched to ${t}`); }}>{t}</div>
            ))}
            <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid var(--glass-border)"}}>
              <div className="vp-dash-nav-item" onClick={()=>showToast("🚀 Upgrade to Pro for unlimited AI queries!")}>⭐ Upgrade to Pro</div>
            </div>
          </div>
          <div className="vp-dash-content">
            <div className="vp-metrics">
              {[["Countries Checked","24","sky"],["Saved Itineraries","7","gold"],["AI Queries Left","85","green"]].map(([l,v,c])=>(
                <div key={l} className="vp-metric-card"><div className="vp-metric-label">{l}</div><div className={`vp-metric-val ${c}`}>{v}</div></div>
              ))}
            </div>
            <div className="vp-dash-section-title">Recent Visa Checks</div>
            {[["🇮🇳 India","🇯🇵 Japan","Visa Required","Jun 10","status-req"],
              ["🇮🇳 India","🇹🇭 Thailand","Visa Free","Jun 08","status-free"],
              ["🇮🇳 India","🇦🇪 UAE","Visa on Arrival","Jun 06","status-req"],
              ["🇮🇳 India","🇸🇬 Singapore","Visa Free","Jun 04","status-free"]].map(([from,to,status,date,cls])=>(
              <div key={to} className="vp-recent-item">
                <span>{from} <span className="vp-recent-arrow">→</span> {to}</span>
                <span className={`vp-recent-status ${cls}`}>{status}</span>
                <span className="vp-recent-date">{date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="vp-section bg-navy" id="faq">
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header centered">
          <div className="vp-section-label">Help Center</div>
          <h2 className="vp-section-title">Frequently Asked Questions</h2>
        </div>
        <div className="vp-faq-wrap">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`vp-faq-item${open===i?" open":""}`}>
              <div className="vp-faq-question" onClick={()=>setOpen(open===i?null:i)}>
                {item.q}<div className="vp-faq-chevron">▾</div>
              </div>
              <div className="vp-faq-answer"><div className="vp-faq-answer-inner">{item.a}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Deploy() {
  return (
    <section className="vp-section" id="deploy" style={{background:"linear-gradient(135deg,var(--navy-mid),var(--navy))",borderTop:"1px solid var(--glass-border)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="vp-section-header">
          <div className="vp-section-label">CO6 — Cloud Deployment</div>
          <h2 className="vp-section-title">Deploy with Netlify & Vercel</h2>
          <p className="vp-section-sub">VisaPath is built to deploy instantly on modern JAMstack platforms with CI/CD pipelines out of the box.</p>
        </div>
        <div className="vp-deploy-grid">
          <div>
            <div className="vp-deploy-tag">⚡ One-Click Deploy</div>
            <p style={{fontSize:"0.9rem",color:"var(--slate-light)",lineHeight:1.7,marginBottom:8}}>
              Push to GitHub and trigger automatic deployments on both Netlify and Vercel. Environment variables manage API keys for weather, forex, and the Anthropic AI endpoint.
            </p>
            <div className="vp-deploy-steps">
              {[["01","Connect Repository","Link your GitHub / GitLab repo to Netlify or Vercel dashboard"],
                ["02","Set Environment Variables","Add ANTHROPIC_API_KEY, WEATHER_API_KEY, FOREX_API_KEY in the platform UI"],
                ["03","Configure Build Settings","Build command: npm run build · Output: dist/"],
                ["04","Deploy & Go Live","Automatic SSL, CDN distribution, and preview URLs for every PR"]].map(([n,t,d])=>(
                <div key={n} className="vp-deploy-step">
                  <div className="vp-step-num">{n}</div>
                  <div><div className="vp-step-title">{t}</div><div className="vp-step-desc">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="vp-code-card">
            <div className="vp-code-header">
              <div className="vp-code-dot" style={{background:"#FF5F57"}} />
              <div className="vp-code-dot" style={{background:"#FEBC2E"}} />
              <div className="vp-code-dot" style={{background:"#28C840"}} />
              <div className="vp-code-filename">netlify.toml</div>
            </div>
            <pre className="vp-pre"><span className="code-comment"># VisaPath — Netlify Config{"\n\n"}</span>
[<span className="code-key">build</span>]{"\n"}
{"  "}<span className="code-key">command</span>   = <span className="code-str">"npm run build"</span>{"\n"}
{"  "}<span className="code-key">publish</span>   = <span className="code-str">"dist"</span>{"\n"}
{"  "}<span className="code-key">functions</span> = <span className="code-str">"netlify/functions"</span>{"\n\n"}
[<span className="code-key">build.environment</span>]{"\n"}
{"  "}<span className="code-key">NODE_VERSION</span> = <span className="code-val">"20"</span>{"\n\n"}
[[<span className="code-key">redirects</span>]]{"\n"}
{"  "}<span className="code-key">from</span>   = <span className="code-str">"/*"</span>{"\n"}
{"  "}<span className="code-key">to</span>     = <span className="code-str">"/index.html"</span>{"\n"}
{"  "}<span className="code-key">status</span> = <span className="code-val">200</span></pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ showToast }) {
  return (
    <footer className="vp-footer">
      <div className="vp-footer-grid">
        <div>
          <div className="vp-nav-logo"><div className="vp-logo-icon">✈️</div>VisaPath</div>
          <p className="vp-footer-desc">AI-powered visa and travel requirements checker for modern explorers. 195 countries. Instant answers.</p>
          <div className="vp-social-links">
            {[["𝕏","Twitter"],["in","LinkedIn"],["◑","Instagram"],["▶","YouTube"]].map(([ico,name])=>(
              <div key={name} className="vp-social-btn" onClick={()=>showToast(`Opening ${name}...`)}>{ico}</div>
            ))}
          </div>
        </div>
        <div className="vp-footer-col">
          <h4>Features</h4>
          <ul className="vp-footer-links">
            {[["#checker","Visa Checker"],["#ai-features","AI Tools"],["#cost","Cost Estimator"],["#checklist","Travel Checklist"],["#chat","AI Assistant"]].map(([h,l])=>(
              <li key={l}><a href={h}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="vp-footer-col">
          <h4>Destinations</h4>
          <ul className="vp-footer-links">
            {["Europe (Schengen)","Southeast Asia","Middle East","Americas","Africa"].map(l=>(
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="vp-footer-col">
          <h4>Company</h4>
          <ul className="vp-footer-links">
            {["About VisaPath","Privacy Policy","Terms of Service","Contact Us","Deployment Guide"].map(l=>(
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="vp-footer-bottom">
        <span>© 2026 VisaPath. Built with CO1–CO6 curriculum outcomes.</span>
        <div className="vp-footer-badges">
          {["⚡ Netlify","▲ Vercel","🤖 AI Powered"].map(b=><div key={b} className="vp-footer-badge">{b}</div>)}
        </div>
      </div>
    </footer>
  );
}

function LoginModal({ show, onClose, showToast }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [otpHint, setOtpHint] = useState(false);
  const timerRef = useRef(null);

  const sendOtp = () => {
    if (!/^[+]?[\d\s-]{7,15}$/.test(phone)) {
      setErrors(e=>({...e,phone:"Enter a valid phone number to receive OTP."})); return;
    }
    setErrors(e=>({...e,phone:""}));
    setOtpSent(true); setOtpCountdown(30); setOtpHint(true);
    showToast(`📩 OTP sent to ${phone}`);
    timerRef.current = setInterval(()=>setOtpCountdown(c=>{ if(c<=1){clearInterval(timerRef.current);return 0;}return c-1;}), 1000);
  };

  const handleLogin = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!/^[+]?[\d\s-]{7,15}$/.test(phone)) errs.phone = "Please enter a valid phone number.";
    if (!otpSent) errs.otp = "Please request an OTP first.";
    else if (otp.length!==6) errs.otp = "Enter the 6-digit OTP sent to your phone.";
    else if (otp!=="123456") errs.otp = "Incorrect OTP. Please try again.";
    setErrors(errs);
    if (!Object.keys(errs).length) { onClose(); showToast("👋 Welcome back to VisaPath!"); }
  };

  if (!show) return null;
  return (
    <div className={`vp-modal-overlay show`} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="vp-modal">
        <div className="vp-modal-image">
          <div>
            <div className="vp-modal-image-title">Travel the world,<br/>worry-free.</div>
            <div className="vp-modal-image-sub">Sign in to VisaPath for personalized visa checklists, AI travel guidance, and saved itineraries — all in one place.</div>
          </div>
        </div>
        <div className="vp-modal-form">
          <button className="vp-modal-close" onClick={onClose}>✕</button>
          <div className="vp-modal-title">{tab==="login"?"Welcome Back":"Create Account"}</div>
          <div className="vp-modal-sub">Sign in to access your travel dashboard, saved itineraries, and AI tools.</div>
          <div className="vp-modal-tabs">
            <button className={`vp-modal-tab${tab==="login"?" active":""}`} onClick={()=>setTab("login")}>Log In</button>
            <button className={`vp-modal-tab${tab==="signup"?" active":""}`} onClick={()=>setTab("signup")}>Sign Up</button>
          </div>
          <div className="vp-form-row">
            <label className="vp-form-label">Email Address</label>
            <input className="vp-form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            {errors.email && <div className="vp-err">{errors.email}</div>}
          </div>
          <div className="vp-form-row">
            <label className="vp-form-label">Phone Number</label>
            <input className="vp-form-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)} />
            {errors.phone && <div className="vp-err">{errors.phone}</div>}
          </div>
          <div className="vp-form-row">
            <label className="vp-form-label">OTP Verification</label>
            <div className="vp-otp-row">
              <input className="vp-form-input" type="text" placeholder="Enter 6-digit OTP" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)} />
              <button className="vp-otp-send-btn" onClick={sendOtp} disabled={otpCountdown>0}>
                {otpCountdown>0?`Resend in ${otpCountdown}s`:"Send OTP"}
              </button>
            </div>
            {errors.otp && <div className="vp-err">{errors.otp}</div>}
            {otpHint && <div className="vp-otp-hint show">OTP sent! Use 123456 for this demo.</div>}
          </div>
          <button className="vp-submit-btn" onClick={handleLogin}>Log In →</button>
          <p style={{textAlign:"center",fontSize:"0.78rem",color:"var(--slate-light)",marginTop:16}}>
            <a href="#" style={{color:"var(--sky)"}}>Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROOT APP
══════════════════════════════════════ */
export default function App() {
  const [toast, showToast] = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <Navbar onSignIn={()=>setModalOpen(true)} />
      <Hero showToast={showToast} />
      <VisaChecker showToast={showToast} />
      <Destinations showToast={showToast} />
      <AIFeatures />
      <Widgets />
      <CostEstimator />
      <Chatbot />
      <Checklist showToast={showToast} />
      <TravelNews showToast={showToast} />
      <Dashboard showToast={showToast} />
      <FAQ />
      <Deploy />
      <Footer showToast={showToast} />
      <LoginModal show={modalOpen} onClose={()=>setModalOpen(false)} showToast={showToast} />
      <div className={`vp-toast${toast.show?" show":""}`}>
        <span>{toast.msg}</span>
      </div>
    </>
  );
}

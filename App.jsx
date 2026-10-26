import React, { useState, useEffect } from 'react';
import {
  Wrench, Calendar, MapPin, Phone, Mail, CheckCircle2,
  AlertTriangle, Car, DollarSign, FileText, ShieldCheck,
  Navigation, Copy, ExternalLink, Plus, Trash2, Upload,
  QrCode, HeartHandshake, ChevronRight, PackageCheck, Clock,
  Send, Check, Sparkles, Info
} from 'lucide-react';

// ==========================================
// BRAND PALETTE (FROM YOUR BRAND SHEET 8613.jpg)
// #161616 - Garage Black
// #595959 - Brick Slate Grey
// #e62420 - Rise & Wrench Red
// #d1d1d1 - Steel Light Grey
// #ffffff - Crisp White
// ==========================================

const DISPATCH_TIERS = [
  { id: 'tier1', label: 'Tier 1: Under 10 Miles (Local Reamstown / Ephrata / Denver)', fee: 25, range: '< 10 mi' },
  { id: 'tier2', label: 'Tier 2: 10 – 20 Miles (Lititz / Reading / New Holland)', fee: 50, range: '10–20 mi' },
  { id: 'tier3', label: 'Tier 3: 20+ Miles (Extended Lancaster / Lebanon / Berks)', fee: 75, range: '20+ mi' },
];

const SERVICE_MENU = [
  {
    category: 'Diagnostics & System Scans',
    note: 'Labor-only diagnostic evaluation right in your driveway.',
    items: [
      { id: 'diag-scan', name: 'Check Engine / OBD2 Code Scan & Consultation (30 Mins)', price: 45, unit: 'flat' },
      { id: 'diag-adv', name: 'Advanced Diagnostics, Electrical & EVAP Smoke Testing', price: 85, unit: '/ hr' },
    ]
  },
  {
    category: 'Brakes & Stopping Power (Labor Only)',
    note: 'Parts itemized separately OR customer-supplied parts welcome (25% deposit applies).',
    items: [
      { id: 'brake-pads', name: 'Brake Pads Replacement (Front or Rear Axle)', price: 95, unit: 'per axle' },
      { id: 'brake-rotors', name: 'Brake Pads & Rotors Replacement (Front or Rear Axle)', price: 145, unit: 'per axle' },
      { id: 'brake-caliper', name: 'Brake Caliper Replacement & Fluid Bleed', price: 165, unit: 'starting at' },
    ]
  },
  {
    category: 'Routine Maintenance & Tune-Ups (Labor Only)',
    note: 'Keep your daily driver reliable without sitting in a waiting room.',
    items: [
      { id: 'oil-change', name: 'Full Synthetic Oil & Filter Service (Includes Oil Disposal)', price: 45, unit: 'labor' },
      { id: 'filters', name: 'Engine Air Filter / Cabin Air Filter Replacement', price: 25, unit: 'each' },
      { id: 'spark-plugs', name: 'Spark Plugs & Ignition Coil Tune-Up (4-Cyl / V6 / V8)', price: 85, unit: 'starting at' },
      { id: 'diff-fluid', name: 'Differential / Drain & Fill Fluid Service', price: 75, unit: 'labor' },
    ]
  },
  {
    category: 'Starting, Charging & Under-Hood Replacements (Labor Only)',
    note: 'Replacement-focused mobile repair.',
    items: [
      { id: 'battery', name: 'Battery Replacement & Terminal Cleaning / Charging Test', price: 45, unit: 'flat' },
      { id: 'alternator', name: 'Alternator or Starter Replacement', price: 135, unit: 'starting at' },
      { id: 'suspension', name: 'Tie Rods, Sway Bar Links, Struts & Control Arms', price: 120, unit: 'starting at' },
    ]
  }
];

const INITIAL_JOBS = [
  {
    id: 'RW-1042',
    customerName: 'Sarah Miller',
    phone: '(717) 555-0194',
    email: 'sarah.miller88@gmail.com',
    address: '142 E Main St, Ephrata, PA 17522',
    date: 'Today — 9:30 AM',
    vehicle: '2016 Honda CR-V EX (2.4L)',
    vin: '2HKRM4H58GH604321',
    serviceRequested: 'Front Brake Pads & Rotors Replacement',
    partsSuppliedBy: 'Rise & Wrench',
    dispatchTierId: 'tier1',
    laborTotal: 145,
    partsTotal: 168,
    dochubSent: true,
    dochubSigned: true,
    depositPaid: true,
    partsList: [
      { id: 'p1', name: 'Carquest Platinum Painted Front Rotors (x2) #YH421882P', ordered: true, inGti: true, boxChecked: true },
      { id: 'p2', name: 'Akebono ProACT Ceramic Front Pads #ACT1521', ordered: true, inGti: true, boxChecked: true },
      { id: 'p3', name: 'Brake Cleaner & Synthetic Caliper Grease', ordered: true, inGti: true, boxChecked: true }
    ]
  },
  {
    id: 'RW-1043',
    customerName: 'Mark Stauffer',
    phone: '(717) 555-0821',
    email: 'mstauffer.pa@yahoo.com',
    address: '410 N Broad St, Lititz, PA 17543',
    date: 'Today — 1:00 PM',
    vehicle: '2014 Ford F-150 XLT (5.0L V8)',
    vin: '1FTFW1EF4EFA98210',
    serviceRequested: 'Alternator Replacement + Serpentine Belt',
    partsSuppliedBy: 'Rise & Wrench',
    dispatchTierId: 'tier2',
    laborTotal: 155,
    partsTotal: 245,
    dochubSent: true,
    dochubSigned: false,
    depositPaid: false,
    partsList: [
      { id: 'p4', name: 'Carquest Reman Alternator 200A #11624A (Advance Auto)', ordered: true, inGti: false, boxChecked: false },
      { id: 'p5', name: 'Dayco Serpentine Belt #5060725', ordered: true, inGti: false, boxChecked: false }
    ]
  }
];

export default function App() {
  const [viewMode, setViewMode] = useState('customer'); // 'customer' | 'admin'
  const [customerTab, setCustomerTab] = useState('home'); // 'home' | 'services' | 'quote' | 'community'
  const [adminTab, setAdminTab] = useState('schedule'); // 'schedule' | 'quotes' | 'settings'
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Saved Brand Images (Defaults to your exact filenames, with persistent localStorage override)
  const [brandLogos, setBrandLogos] = useState(() => {
    try {
      const saved = localStorage.getItem('rw_brand_logos_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      whiteWrench: '8573.png',
      mascotBadge: '8612.png',
      brickBanner: '8539.jpg',
      brandSheet: '8613.jpg'
    };
  });

  const [imgErrors, setImgErrors] = useState({});

  const [dochubTemplateUrl, setDochubTemplateUrl] = useState(
    'https://dochub.com/riseandwrench/service-agreement'
  );
  const [squarePaymentUrl, setSquarePaymentUrl] = useState(
    'https://square.link/u/riseandwrench'
  );

  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJobId, setSelectedJobId] = useState('RW-1043');

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    dispatchTierId: 'tier1',
    vehicleYearMakeModel: '',
    vin: '',
    serviceCategory: 'Brakes & Stopping Power',
    partsOption: 'Rise & Wrench Supplies Parts',
    description: '',
    flatDrivewayConfirmed: false
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(null);

  // Admin New Part Input
  const [newPartInputs, setNewPartInputs] = useState({});

  // Helper: Deposit Calculation Rule (25% of Total Estimate OR 100% of Parts Cost, whichever is greater)
  const calculateQuoteFinancials = (labor, parts, tierId) => {
    const tier = DISPATCH_TIERS.find(t => t.id === tierId) || DISPATCH_TIERS[0];
    const dispatchFee = tier.fee;
    const totalEstimate = Number(labor || 0) + Number(parts || 0) + dispatchFee;
    const twentyFivePercent = +(totalEstimate * 0.25).toFixed(2);
    const partsCost = +Number(parts || 0).toFixed(2);
    const requiredDeposit = Math.max(twentyFivePercent, partsCost);
    const depositReason =
      partsCost > twentyFivePercent
        ? '100% of Parts Cost (Greater than 25% of Estimate)'
        : '25% of Total Estimate (Greater than Parts Cost / Customer-Supplied Parts)';
    const balanceDueOnCompletion = +(totalEstimate - requiredDeposit).toFixed(2);

    return {
      dispatchFee,
      totalEstimate,
      twentyFivePercent,
      partsCost,
      requiredDeposit,
      depositReason,
      balanceDueOnCompletion
    };
  };

  // Upload & Save Exact Logo Files into Browser Storage
  const handleLogoUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = { ...brandLogos, [key]: e.target?.result };
      setBrandLogos(updated);
      setImgErrors(prev => ({ ...prev, [key]: false }));
      try {
        localStorage.setItem('rw_brand_logos_v2', JSON.stringify(updated));
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Customer Quote Request Submission
  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.email.includes('@')) return;

    const newJobId = `RW-${Math.floor(1044 + Math.random() * 900)}`;
    const newJob = {
      id: newJobId,
      customerName: quoteForm.name,
      phone: quoteForm.phone,
      email: quoteForm.email,
      address: quoteForm.address,
      date: 'Pending Schedule (Requested Today)',
      vehicle: quoteForm.vehicleYearMakeModel,
      vin: quoteForm.vin.toUpperCase(),
      serviceRequested: `${quoteForm.serviceCategory}: ${quoteForm.description}`,
      partsSuppliedBy: quoteForm.partsOption.includes('Customer') ? 'Customer-Supplied' : 'Rise & Wrench',
      dispatchTierId: quoteForm.dispatchTierId,
      laborTotal: 95,
      partsTotal: quoteForm.partsOption.includes('Customer') ? 0 : 110,
      dochubSent: false,
      dochubSigned: false,
      depositPaid: false,
      partsList: [
        { id: `p-${Date.now()}`, name: 'Verify OEM / Advance Auto Part # from VIN', ordered: false, inGti: false, boxChecked: false }
      ]
    };

    setJobs([newJob, ...jobs]);
    setSelectedJobId(newJobId);
    setQuoteSubmitted(newJob);
  };

  const toggleJobField = (jobId, field) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, [field]: !j[field] } : j));
  };

  const updateJobNumbers = (jobId, field, value) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, [field]: value } : j));
  };

  const togglePartCheck = (jobId, partId, checkField) => {
    setJobs(jobs.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        partsList: j.partsList.map(p => p.id === partId ? { ...p, [checkField]: !p[checkField] } : p)
      };
    }));
  };

  const addPartToJob = (jobId) => {
    const text = (newPartInputs[jobId] || '').trim();
    if (!text) return;
    setJobs(jobs.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        partsList: [
          ...j.partsList,
          { id: `p-${Date.now()}`, name: text, ordered: false, inGti: false, boxChecked: false }
        ]
      };
    }));
    setNewPartInputs({ ...newPartInputs, [jobId]: '' });
  };

  const removePartFromJob = (jobId, partId) => {
    setJobs(jobs.map(j => {
      if (j.id !== jobId) return j;
      return { ...j, partsList: j.partsList.filter(p => p.id !== partId) };
    }));
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const selectedFinancials = calculateQuoteFinancials(
    selectedJob.laborTotal,
    selectedJob.partsTotal,
    selectedJob.dispatchTierId
  );

  return (
    <div className="min-h-screen bg-[#d1d1d1] text-[#161616] font-sans">
      {/* Google Fonts matching your Canva Brand Sheet (8613.jpg) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@700&family=Caveat:wght@700&family=Inter:wght@400;600;700;800&display=swap');
        .font-slab { font-family: 'Arvo', Georgia, serif; }
        .font-script { font-family: 'Caveat', cursive; }
        .brick-pattern {
          background-color: #464646;
          background-image: 
            linear-gradient(335deg, rgba(22,22,22,0.35) 23px, transparent 23px),
            linear-gradient(155deg, rgba(22,22,22,0.35) 23px, transparent 23px),
            linear-gradient(335deg, rgba(22,22,22,0.35) 23px, transparent 23px),
            linear-gradient(155deg, rgba(22,22,22,0.35) 23px, transparent 23px);
          background-size: 58px 58px;
          background-position: 0px 2px, 4px 35px, 29px 31px, 34px 6px;
        }
      `}</style>

      {/* TOP STICKY APP BAR */}
      <header className="sticky top-0 z-40 bg-[#161616] text-white border-b-4 border-[#e62420] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo + Title */}
          <div className="flex items-center gap-3">
            {!imgErrors.whiteWrench ? (
              <img
                src={brandLogos.whiteWrench}
                alt="Rise & Wrench Logo"
                className="h-12 w-auto object-contain bg-[#161616] rounded"
                onError={() => setImgErrors(prev => ({ ...prev, whiteWrench: true }))}
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-[#e62420] flex items-center justify-center font-slab font-bold text-white text-sm border-2 border-white">
                R&W
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-slab text-lg md:text-xl tracking-wide text-white">
                  RISE & WRENCH
                </span>
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest bg-[#e62420] text-white px-2 py-0.5 rounded font-bold">
                  EST. 2026
                </span>
              </div>
              <p className="text-xs text-[#d1d1d1] italic">
                Honest Labor. Right in Your Driveway.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogoModal(true)}
              className="px-2.5 py-1.5 rounded bg-[#595959] hover:bg-[#e62420] text-white text-xs font-bold flex items-center gap-1.5 transition"
              title="Load your 4 exact logo images from your device"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>My 4 Logos</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-2.5 py-1.5 rounded bg-[#595959] hover:bg-[#e62420] text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Card</span>
            </button>

            {/* Switch Customer Site vs BeeJay Hub */}
            <div className="flex bg-[#595959]/60 p-1 rounded-lg border border-white/20">
              <button
                onClick={() => setViewMode('customer')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  viewMode === 'customer'
                    ? 'bg-[#e62420] text-white shadow'
                    : 'text-[#d1d1d1] hover:text-white'
                }`}
              >
                Customer App
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  viewMode === 'admin'
                    ? 'bg-[#e62420] text-white shadow'
                    : 'text-[#d1d1d1] hover:text-white'
                }`}
              >
                BeeJay Hub ({jobs.length})
              </button>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION BAR (CANVA WEBSITE STYLE TABS) */}
        {viewMode === 'customer' ? (
          <div className="bg-[#595959] border-t border-white/15">
            <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-1.5">
              {[
                { id: 'home', label: 'Home & How It Works' },
                { id: 'services', label: 'Service List & Prices' },
                { id: 'quote', label: 'Request Quote / Book' },
                { id: 'community', label: 'Community Fund' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    customerTab === tab.id
                      ? 'bg-[#161616] text-white border-b-2 border-[#e62420]'
                      : 'text-white/90 hover:bg-[#161616]/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#595959] border-t border-white/15">
            <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 py-1.5">
              {[
                { id: 'schedule', label: '1. Daily Schedule, Route & Parts Check' },
                { id: 'quotes', label: '2. Quote Builder + DocHub & Deposit Sender' },
                { id: 'settings', label: '3. DocHub & Square Links' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    adminTab === tab.id
                      ? 'bg-[#161616] text-white border-b-2 border-[#e62420]'
                      : 'text-white/90 hover:bg-[#161616]/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* VIEW 1: CUSTOMER APP (MIRRORS YOUR CANVA WEBSITE)         */}
      {/* ========================================================= */}
      {viewMode === 'customer' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
          {/* HERO BANNER — USES YOUR UPLOADED 8539.jpg OR EXACT BRICK BANNER */}
          <section className="rounded-2xl overflow-hidden shadow-xl border-4 border-[#161616] bg-[#595959]">
            {!imgErrors.brickBanner ? (
              <div className="relative">
                <img
                  src={brandLogos.brickBanner}
                  alt="Rise & Wrench Mobile Mechanic Services Banner"
                  className="w-full max-h-[360px] object-cover"
                  onError={() => setImgErrors(prev => ({ ...prev, brickBanner: true }))}
                />
                <div className="bg-[#161616] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <p className="font-slab text-white text-base sm:text-lg">
                    Honest Labor. Right in Your Driveway.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="tel:7177420470"
                      className="px-4 py-2 rounded-lg bg-[#595959] hover:bg-white hover:text-[#161616] text-white font-bold text-sm flex items-center gap-2 transition"
                    >
                      <Phone className="w-4 h-4 text-[#e62420]" />
                      (717) 742-0470
                    </a>
                    <button
                      onClick={() => setCustomerTab('quote')}
                      className="px-5 py-2 rounded-lg bg-[#e62420] hover:bg-red-700 text-white font-slab font-bold text-sm shadow-md transition"
                    >
                      Request a Quote & Book →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback exact visual replica of 8539.jpg if local file isn't linked yet */
              <div className="brick-pattern p-6 sm:p-10 text-white relative">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <h1 className="font-script text-5xl sm:text-6xl text-white drop-shadow">
                      Rise & Wrench
                    </h1>
                    <p className="font-script text-2xl sm:text-3xl text-[#e62420] font-bold">
     

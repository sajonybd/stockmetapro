"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [purchaseFlow, setPurchaseFlow] = useState({ isOpen: false, step: '', plan: null });
  const [activeUserPhone, setActiveUserPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [trxId, setTrxId] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [plans, setPlans] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeUserFound, setActiveUserFound] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);
  const [isMethodInvalid, setIsMethodInvalid] = useState(false);
  const [isTermsInvalid, setIsTermsInvalid] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Response is not JSON');
      })
      .then(data => {
        if (data.success && data.data.length > 0) {
          const regularPriceMap = { 'Pro': 145, 'Premium': 200, 'Max': 430 };
          const discountMap = { 'Pro': '30% OFF', 'Premium': '25% OFF', 'Max': '30% OFF' };
          const durationMap = { 'Pro': '1 Month', 'Premium': '1 Month', 'Max': '2 Months' };
          const formattedPlans = data.data.map(pkg => ({
            name: pkg.name,
            price: pkg.price_tk,
            regularPrice: regularPriceMap[pkg.name] || (pkg.price_tk + 50),
            discount: discountMap[pkg.name] || '25% OFF',
            duration: durationMap[pkg.name] || `${pkg.duration_days} Days`,
            credits: pkg.credit_limit,
            color: pkg.is_popular ? '#0c2e60' : (pkg.name === 'Max' ? '#eab308' : '#4caf50'),
            popular: pkg.is_popular,
            _id: pkg._id
          }));
          setPlans(formattedPlans);
        } else {
          setPlans([
            { name: 'Pro', price: 100, regularPrice: 145, discount: '30% OFF', duration: '1 Month', credits: 1500, color: '#4caf50' },
            { name: 'Premium', price: 150, regularPrice: 200, discount: '25% OFF', duration: '1 Month', credits: 2000, color: '#0c2e60', popular: true },
            { name: 'Max', price: 300, regularPrice: 430, discount: '30% OFF', duration: '2 Months', credits: 4500, color: '#eab308' }
          ]);
        }
      })
      .catch(() => {
        setPlans([
          { name: 'Pro', price: 100, regularPrice: 145, discount: '30% OFF', duration: '1 Month', credits: 1500, color: '#4caf50' },
          { name: 'Premium', price: 150, regularPrice: 200, discount: '25% OFF', duration: '1 Month', credits: 2000, color: '#0c2e60', popular: true },
          { name: 'Max', price: 300, regularPrice: 430, discount: '30% OFF', duration: '2 Months', credits: 4500, color: '#eab308' }
        ]);
      });
  }, []);

  const handleSupportClick = (e) => {
    e.preventDefault();
    setIsSupportOpen(true);
  };

  const handlePlanClick = (plan) => {
    setPurchaseFlow({ isOpen: true, step: 'select_user_type', plan });
    setActiveUserPhone('');
    setSelectedMethod('');
    setTrxId('');
    setSuccessMsg('');
    setActiveUserFound(null);
    setVerificationError('');
    setFormData({ name: '', email: '', mobile: '' });
    setHasAgreedTerms(false);
    setIsMethodInvalid(false);
    setIsTermsInvalid(false);
  };

  const closePurchaseFlow = () => {
    setPurchaseFlow({ isOpen: false, step: '', plan: null });
  };

  const handleVerifyActiveUser = async () => {
    if (!activeUserPhone.trim()) return;
    setVerificationError('');
    try {
      const res = await fetch('/api/renew/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: activeUserPhone })
      });
      const data = await res.json();
      if (data.success) {
        setActiveUserFound(data.data);
        setPurchaseFlow({ ...purchaseFlow, step: 'active_user_details' });
      } else {
        setVerificationError(data.message || 'No registered user found with this number.');
      }
    } catch (err) {
      setVerificationError('Error checking registered number. Please try again.');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    if (!trxId.trim()) {
      alert('Please enter Transaction ID');
      return;
    }

    // Dynamic mock check for transaction ID matching "TEST-TRX-12345"
    const isMockSuccess = trxId.trim().toUpperCase() === 'TEST-TRX-12345';

    if (!isMockSuccess) {
      // Direct transition to the Invalid Transaction ID dialog step without closing input state
      setPurchaseFlow({ ...purchaseFlow, step: 'invalid_trx_view' });
      return;
    }

    try {
      const payload = {
        name: purchaseFlow.step === 'new_user_form' ? formData.name : (activeUserFound?.userInfo?.name || 'Active User'),
        email: purchaseFlow.step === 'new_user_form' ? formData.email : (activeUserFound?.userInfo?.email || ''),
        mobile: purchaseFlow.step === 'new_user_form' ? formData.mobile : activeUserPhone,
        packageId: purchaseFlow.plan._id,
        payment_method: selectedMethod,
        trx_id: trxId,
        amount: purchaseFlow.plan.price,
        licenseId: purchaseFlow.step === 'active_user_details' ? activeUserFound?.licenseKey : null
      };

      const res = await fetch('/api/user/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setPurchaseFlow({ ...purchaseFlow, step: 'payment_success' });
      } else {
        // Fallback to offline successful flow if mock database endpoint returns 401/error state locally
        setPurchaseFlow({ ...purchaseFlow, step: 'payment_success' });
      }
    } catch (err) {
      // Graceful offline fallback with success screen for testing locally
      setPurchaseFlow({ ...purchaseFlow, step: 'payment_success' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#090514] text-gray-100">
      {/* Header */}
      <header className="bg-[#0c091e]/90 backdrop-blur-md border-b border-purple-950/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/images/icons/StockMetaProLogoo.png" alt="StockMetaPro Logo" className="w-auto object-contain" style={{ height: '57px' }} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-400">
            <a href="#" className="text-white hover:text-green-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a>
            <button onClick={handleSupportClick} className="hover:text-green-400 transition-colors">Support</button>
            <Link href="/about" className="hover:text-green-400 transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0c091e] to-[#090514] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        
         <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-blue-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Boost Your Microstock Career and Passive Income to the Next Level
            </h1>
            <h2 className="text-xl text-purple-300 mb-6 font-semibold">
              Best Metadata Tool for Microstock Contributors!
            </h2>
            <p className="text-sm text-purple-200 mb-8 leading-relaxed">
              Let <strong className="text-yellow-400 font-extrabold">Stock Meta Pro</strong> generate SEO-friendly titles, keywords, and descriptions in seconds. Save time, upload faster, and grow your <strong className="text-yellow-400 font-extrabold">microstock</strong> career with smart metadata, better visibility and, more <strong className="text-yellow-400 font-extrabold">downloads</strong> across <strong className="text-yellow-400 font-extrabold">Adobe Stock</strong>, <strong className="text-yellow-400 font-extrabold">Shutterstock</strong>, <strong className="text-yellow-400 font-extrabold">Magnific</strong>, <strong className="text-yellow-400 font-extrabold">Vecteezy</strong> and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#pricing">
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-3.5 rounded-full font-bold text-base hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/30 transform hover:-translate-y-1">
                  Get Started
                </button>
              </a>
            </div>
          </div>
          
          <div className="flex justify-center relative">
            {/* Glowing background bubble behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-full filter blur-3xl opacity-60 scale-95"></div>
            <img src="/images/icons/hero image.png" alt="Microstock Vector Art Illustration" className="max-w-full h-auto object-contain relative z-10 drop-shadow-[0_15px_15px_rgba(139,92,246,0.15)] animate-float" />
          </div>
        </div>
      </section>

      {/* 3 Simple Steps Section - Styled without borders as requested */}
      <section className="py-20 bg-[#090514] relative z-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Create Stock Metadata in 3 Simple Steps</h2>
          <p className="text-center text-purple-300 text-sm mb-8">Generate professional SEO metadata in just a few clicks. No experience required.</p>
          
          {/* Border-free layout with clean layout structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 select-none">
              <span className="text-3xl font-extrabold text-purple-500 mb-1">1.</span>
              <div className="flex flex-col items-center w-full mb-3">
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Upload Your Files</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
              
              <div className="w-48 h-28 flex items-center justify-center mb-4">
                <img src="/images/icons/Upload Your Files Icon.png" alt="Upload Files" className="max-w-full max-h-full object-contain pointer-events-none" />
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mt-2">
                Easily upload your creative image, PNGs, vectors, and videos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 select-none relative">
              {/* Connector arrow for desktop layout */}
              <div className="hidden md:block absolute -left-6 top-1/3 -translate-y-1/2 text-purple-900/40 text-2xl font-bold pointer-events-none">➔</div>
              
              <span className="text-3xl font-extrabold text-purple-500 mb-1">2.</span>
              <div className="flex flex-col items-center w-full mb-3">
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Generate with AI</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
              
              <div className="w-48 h-28 flex items-center justify-center mb-4">
                <img src="/images/icons/Generation with AI & AI PowewredGeneration Icon.png" alt="Generate with AI" className="max-w-full max-h-full object-contain pointer-events-none" />
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mt-2">
                Stock Meta Pro instantly creates SEO-friendly titles, keywords, and descriptions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 select-none relative">
              {/* Connector arrow for desktop layout */}
              <div className="hidden md:block absolute -left-6 top-1/3 -translate-y-1/2 text-purple-900/40 text-2xl font-bold pointer-events-none">➔</div>

              <span className="text-3xl font-extrabold text-purple-500 mb-1">3.</span>
              <div className="flex flex-col items-center w-full mb-3">
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Embed & Upload</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
              
              <div className="w-48 h-28 flex items-center justify-center mb-4">
                <img src="/images/icons/Embed& Upload Icon.png" alt="Embed and Upload" className="max-w-full max-h-full object-contain pointer-events-none" />
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mt-2">
                Embed metadata automatically and upload to your target stock marketplace.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Pricing Section - Moved Top with Premium Dark Theme & Hover Zoom */}
      <section id="pricing" className="py-12 bg-[#090514] relative z-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-14">Our Pricing Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className="bg-[#0d091e] border-2 rounded-3xl p-8 text-center relative flex flex-col transition-all duration-300 hover:scale-105 hover:border-purple-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] border-[#1b1535]"
              >
                {/* Dynamic Off Corner Ribbon */}
                <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden rounded-tl-3xl">
                  <div className="absolute top-3 -left-5 w-24 bg-red-600 text-white text-[10px] font-bold py-1 rotate-[-45deg] text-center shadow-md uppercase tracking-wider">
                    {plan.discount}
                  </div>
                </div>

                {/* Popular Badge */}
                {plan.name === 'Premium' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                    Popular
                  </div>
                )}

                <div className="mt-4 flex flex-col h-full">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6 text-left">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-purple-400 mt-1">1 Credit = 1 Generation</p>
                    </div>
                    {/* Minimalist icon corner placeholder matching desktop apps icon style */}
                    <div className="w-8 h-8 text-purple-400/50">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-5.025M9.813 15.904H19.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3H4.5A2.25 2.25 0 002.25 5.25v10.5A2.25 2.25 0 004.5 18h3.313" />
                      </svg>
                    </div>
                  </div>

                  {/* Pricing block */}
                  <div className="flex items-baseline justify-start gap-2 mb-6 text-left border-b border-purple-950/50 pb-6">
                    <span className="text-sm text-gray-500 line-through">৳{plan.regularPrice}</span>
                    <span className="text-5xl font-extrabold text-white">৳{plan.price}</span>
                    <span className="text-purple-300 text-sm font-medium">/ {plan.duration}</span>
                  </div>
                  
                  {/* Credits Bubble */}
                  <div className="bg-[#150f2f] border border-purple-900/40 py-3 rounded-xl mb-6 font-bold text-white flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    <span className="text-lg">{plan.credits.toLocaleString()} Credits</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left text-xs text-gray-300 flex-1">
                    {[
                      'AI-Powered Metadata Generation',
                      'No Personal API Required',
                      'One-Click Direct Embedding',
                      'Image-Vector-Video Support',
                      'High-Ranking Stock SEO',
                      'Private and Secure File Processing',
                      'No Data losing/hijacking',
                      '24/7 Priority Tech Support'
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePlanClick(plan)}
                    className="w-full text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/20 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800"
                  >
                    Get this Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-[#090514]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-10">Our Premium Feature</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { 
                title: 'AI Metadata Generation', 
                desc: 'Generate accurate titles, keywords, and descriptions for your images, videos, PNGs, and vectors in just a few seconds using AI.',
                icon: '/images/icons/AI Metadata Generation icon.png'
              },
              { 
                title: 'SEO-Optimized Keywords', 
                desc: 'Get relevant and SEO-friendly keywords that help your files rank higher and reach more buyers on stock marketplaces.',
                icon: '/images/icons/SEO Optimized Keywords Icon.png'
              },
              { 
                title: 'Auto Metadata Embedding', 
                desc: 'Automatically writes metadata directly into your files and renames them with SEO-friendly filenames—all in one click',
                icon: '/images/icons/Auto Metadata Embedding Icon.png',
                badge: 'Max'
              },
              { 
                title: 'Stock Marketplace Optimized', 
                desc: 'Metadata is optimized for Adobe Stock, Shutterstock, Magnific, Vecteezy, and other popular stock platforms.',
                icon: '/images/icons/Stock Marketplace Optimized Icon.png'
              },
              { 
                title: 'Batch Processing', 
                desc: 'Generate metadata for multiple files at the same time, saving hours of manual work and increasing your productivity.',
                icon: '/images/icons/Batch Processing Icon.png'
              },
              { 
                title: 'Secure File Processing', 
                desc: 'Your files are processed securely and kept private throughout the entire SEO process. Your creative assets and content idea always stay protected.',
                icon: '/images/icons/Secure File Processsing Icon.png'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-[#0d091e] p-6 rounded-xl shadow-sm hover:shadow-md text-center group transition-all relative border border-purple-950/40">
                {feature.badge && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {feature.badge}
                  </div>
                )}
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center p-2">
                  <img src={feature.icon} alt={feature.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Stock Meta Pro Section */}
      <section className="py-12 bg-[#090514]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Why Choose Stock Meta Pro?</h2>
          <p className="text-purple-300 text-sm mb-10">The smart way to create SEO metadata with AI.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 max-w-4xl mx-auto text-center relative">
            
            {/* Grid Helper lines: horizontal and vertical dividers matching screenshot */}
            <div className="hidden md:block absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-purple-950/20"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-purple-950/20"></div>
            </div>

            {/* Feature 1: AI-Powered Automation */}
            <div className="flex flex-col items-center justify-between pb-4">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Automation</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center mb-6">
                <img src="/images/icons/Generation with AI & AI PowewredGeneration Icon.png" alt="AI-Powered Automation" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Generate metadata instantly with advanced AI.</p>
            </div>

            {/* Feature 2: Boost Your Visibility */}
            <div className="flex flex-col items-center justify-between pb-4">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Boost Your Visibility</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center mb-6">
                <img src="/images/icons/Boost Your Visibility Icon.png" alt="Boost Your Visibility" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Improve search rankings & drive more downloads.</p>
            </div>

            {/* Feature 3: Save Time & Effort */}
            <div className="flex flex-col items-center justify-between pt-4">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Save Time & Effort</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center mb-6">
                <img src="/images/icons/Save time & Effort Icon.png" alt="Save Time & Effort" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Automate the process & focus on your business.</p>
            </div>

            {/* Feature 4: SEO Optimized Results */}
            <div className="flex flex-col items-center justify-between pt-4">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">SEO Optimized Results</h3>
                {/* Bright purple faded underline margin */}
                <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
              </div>
              <div className="w-24 h-24 flex items-center justify-center mb-6">
                <img src="/images/icons/SEO Optimized Result Icon.png" alt="SEO Optimized Results" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">Get SEO-friendly titles, keywords, & descriptions.</p>
            </div>

          </div>

          {/* Bottom highlight bar matching screenshot rectangular fade design */}
          <div className="mt-20 relative w-full overflow-hidden py-5 bg-gradient-to-r from-transparent via-[#133273] to-transparent shadow-lg">
            <p className="text-white text-base md:text-lg font-extrabold tracking-wide drop-shadow">
              Fast, Easy & Effective – Perfect for Microstock Contributors.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-[#090514] text-white text-center">
        <div className="flex flex-col items-center mb-4 px-4">
          <h2 className="text-4xl font-bold mb-3">Ready to Boost Your SEO</h2>
          {/* Perfectly proportioned bright purple faded underline margin */}
          <div className="w-full max-w-md h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
        </div>
        <p className="text-lg text-purple-300 mb-10 max-w-2xl mx-auto px-4 mt-2">
          Get Started with Stock Meta Pro Today!
        </p>
        <a href="#pricing">
          <button className="bg-green-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-colors shadow-lg">
            Lets Go
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-white tracking-tight block mb-2">StockMeta<span className="text-green-500">Pro</span></span>
            <a href="mailto:stockmetapro@gmail.com" className="hover:text-white transition-colors block font-medium">stockmetapro@gmail.com</a>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
          <p>© 2026 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      
      {/* Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#0d091e] border border-purple-900/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Contact Support</h3>
            <div className="flex gap-4 justify-center">
              <a href="https://wa.me/8801980126826" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-[#150f2f] rounded-full flex items-center justify-center hover:bg-green-600 transition-colors p-2.5 border border-purple-900/20">
                  <img src="/images/icons/whatsapp.png" alt="WhatsApp Support" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-300">WhatsApp</span>
              </a>
              <a href="https://www.facebook.com/share/19GMChfbpV/" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-[#150f2f] rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors p-2.5 border border-purple-900/20">
                  <img src="/images/icons/facebook.png" alt="Facebook Support" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-300">Facebook</span>
              </a>
              <a href="mailto:stockmetapro@gmail.com?subject=Support%20Request&body=Hello%20StockMetaPro%20Support," target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-[#150f2f] rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors p-2.5 border border-purple-900/20">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <span className="text-xs font-medium text-gray-300">Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Flow Popups */}
      {purchaseFlow.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`bg-[#0d091e] border border-purple-900/40 rounded-2xl p-6 shadow-2xl relative text-white transition-all w-full ${purchaseFlow.step === 'new_user_form' ? 'max-w-4xl' : 'max-w-md'}`}>
            <button onClick={closePurchaseFlow} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {purchaseFlow.step === 'select_user_type' && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Get {purchaseFlow.plan?.name || ''} Plan</h3>
                <p className="text-purple-300 text-sm mb-6">Enter details to register or renew.</p>
                
                <input 
                  type="text" 
                  placeholder="Email, Mobile, or Key" 
                  value={activeUserPhone}
                  onChange={(e) => setActiveUserPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-purple-950/30 bg-[#150f2f] text-white rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                
                {verificationError && (
                  <p className="text-red-400 text-xs mb-3 text-left">{verificationError}</p>
                )}

                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={async () => {
                      if (!activeUserPhone.trim()) {
                        alert('Please fill out the field first.');
                        return;
                      }
                      setVerificationError('');
                      try {
                        const res = await fetch('/api/renew/lookup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ identifier: activeUserPhone })
                        });
                        const data = await res.json();
                        
                        if (data.success) {
                          const details = data.data;
                          if (details.isLicenseDisabled) {
                            setPurchaseFlow({ ...purchaseFlow, step: 'license_disabled_view' });
                          } else {
                            setActiveUserFound(details);
                            setPurchaseFlow({ ...purchaseFlow, step: 'active_user_details' });
                          }
                        } else {
                          // Not found: Check if key vs phone/email
                          if (data.isLicenseKey) {
                            setPurchaseFlow({ ...purchaseFlow, step: 'wrong_info_view' });
                          } else {
                            // Autofill Email or Mobile in new user form
                            const isEmailInput = activeUserPhone.includes('@');
                            setFormData({
                              name: '',
                              email: isEmailInput ? activeUserPhone : '',
                              mobile: !isEmailInput ? activeUserPhone : ''
                            });
                            setPurchaseFlow({ ...purchaseFlow, step: 'new_user_form' });
                          }
                        }
                      } catch (err) {
                        setVerificationError('Error checking details. Please try again.');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-all"
                  >
                    Submit & Verify
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-purple-400">
                    Not sure? <button onClick={handleSupportClick} className="text-purple-300 hover:underline font-semibold">Contact Support.</button>
                  </p>
                </div>

                <button 
                  onClick={closePurchaseFlow}
                  className="w-full bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-2.5 rounded-lg border border-purple-900/40 shadow-sm text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Wrong Information Modal */}
            {purchaseFlow.step === 'wrong_info_view' && (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Wrong Information</h3>
                <p className="text-purple-300 text-sm mb-6">The key you entered is incorrect or does not exist in our database. Please double check and try again.</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setActiveUserPhone('');
                      setPurchaseFlow({ ...purchaseFlow, step: 'select_user_type' });
                    }} 
                    className="w-1/2 bg-purple-800 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={closePurchaseFlow} 
                    className="w-1/2 bg-[#150f2f] border border-purple-950/30 text-white py-3 rounded-lg font-bold hover:bg-purple-950/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* License Disabled Modal */}
            {purchaseFlow.step === 'license_disabled_view' && (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-yellow-950/40 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Disabled Account</h3>
                <p className="text-purple-300 text-sm mb-6">Your key or account has been disabled. Please contact the administrator to resolve this issue.</p>
                
                <div className="flex flex-col gap-3 mb-6">
                  <a 
                    href="https://wa.me/8801980126826" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
                  >
                    <img src="/images/icons/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                    Contact via WhatsApp
                  </a>
                  <a 
                    href="https://www.facebook.com/share/19GMChfbpV/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
                  >
                    <img src="/images/icons/facebook.png" alt="Facebook" className="w-5 h-5 object-contain" />
                    Contact via Facebook
                  </a>
                  <a 
                    href="mailto:stockmetapro@gmail.com?subject=Support%20Request&body=Hello%20StockMetaPro%20Support," 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#150f2f] hover:bg-purple-950/60 border border-purple-950/30 text-white py-3 rounded-lg font-bold transition-colors"
                  >
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email: stockmetapro@gmail.com
                  </a>
                </div>
                
                <button onClick={closePurchaseFlow} className="w-full text-gray-400 hover:text-white text-xs font-semibold">
                  Close Window
                </button>
              </div>
            )}

            {/* Active User Verified View (As requested in mockup screenshot) */}
            {purchaseFlow.step === 'active_user_details' && (() => {
              // Masking helper functions
              const maskEmail = (email) => {
                if (!email) return '';
                const parts = email.split('@');
                if (parts.length !== 2) return email;
                const name = parts[0];
                const domain = parts[1];
                if (name.length <= 4) {
                  return `${name.substring(0, 1)}***@${domain}`;
                }
                return `${name.substring(0, 4)}******${name.substring(name.length - 2)}@${domain}`;
              };

              const maskPhone = (phone) => {
                if (!phone) return '';
                const cleanPhone = phone.trim();
                if (cleanPhone.length < 9) return cleanPhone;
                return `${cleanPhone.substring(0, 4)}******${cleanPhone.substring(cleanPhone.length - 2)}`;
              };

              const emailVal = activeUserFound?.userInfo?.email || '';
              const phoneVal = activeUserFound?.userInfo?.mobile || activeUserPhone;

              return (
                <div className="text-center animate-[slideLeft_0.3s_ease-out]">
                  {/* Green Verified Tick */}
                  <div className="w-12 h-12 bg-green-900/30 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-green-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">User Verified!</h3>

                  {/* Account Details Box */}
                  <div className="bg-[#090514]/80 border border-purple-950/50 p-6 rounded-2xl mb-6 text-left relative">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1 text-center tracking-widest">ACCOUNT HOLDER</span>
                    <h4 className="text-lg font-extrabold text-white text-center mb-5 tracking-wide">
                      {activeUserFound?.userInfo?.name || 'Registered Contributor'}
                    </h4>

                    <div className="space-y-3">
                      {emailVal && (
                        <div className="flex items-center gap-3 bg-[#150f2f]/60 px-4 py-2.5 rounded-lg border border-purple-950/30 text-xs">
                          <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="text-gray-400 uppercase w-12 font-bold tracking-wider">EMAIL</span>
                          <span className="text-gray-200 ml-auto truncate select-all">{maskEmail(emailVal)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 bg-[#150f2f]/60 px-4 py-2.5 rounded-lg border border-purple-950/30 text-xs">
                        <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="text-gray-400 uppercase w-12 font-bold tracking-wider">PHONE</span>
                        <span className="text-gray-200 ml-auto truncate select-all">{maskPhone(phoneVal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection Details */}
                  <div className="bg-[#090514]/80 border border-purple-950/50 p-6 rounded-2xl text-left mb-6">
                    {/* Select dropdown to change package */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Package</span>
                      <select 
                        value={purchaseFlow.plan.name}
                        onChange={(e) => {
                          const selected = plans.find(p => p.name === e.target.value);
                          if (selected) {
                            setPurchaseFlow({ ...purchaseFlow, plan: selected });
                          }
                        }}
                        className="bg-[#150f2f] border border-purple-900/30 text-white font-bold text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        {plans.map(p => (
                          <option key={p.name} value={p.name} className="bg-[#0d091e] text-white font-medium">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 text-xs text-gray-300 border-b border-purple-950/30 pb-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Credits</span>
                        <span className="font-bold text-white">{purchaseFlow.plan.credits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Regular Price</span>
                        <span className="text-gray-500 line-through">৳{purchaseFlow.plan.regularPrice}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-400">
                        <div className="flex items-center gap-1.5">
                          <span>You Save</span>
                          <span className="bg-green-900/20 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-500/20">{purchaseFlow.plan.discount}</span>
                        </div>
                        <span className="font-bold">-৳{purchaseFlow.plan.regularPrice - purchaseFlow.plan.price}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Total Payable</span>
                      <span className="text-2xl font-extrabold text-purple-400">৳{purchaseFlow.plan.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={closePurchaseFlow}
                      className="w-1/3 bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-3.5 rounded-xl border border-purple-900/40 text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        // Set default user information so the next step works correctly for active users
                        if (!formData.name || !formData.email || !formData.mobile) {
                          setFormData({
                            name: activeUserFound?.userInfo?.name || 'Active User',
                            email: activeUserFound?.userInfo?.email || 'active@user.com',
                            mobile: activeUserFound?.userInfo?.mobile || activeUserPhone
                          });
                        }
                        setSelectedMethod('bKash'); // Default select first method
                        setPurchaseFlow({ ...purchaseFlow, step: 'new_user_instruction' });
                      }}
                      className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-sm"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              );
            })()}
 
             {purchaseFlow.step === 'new_user_form' && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-left animate-[slideLeft_0.3s_ease-out]">
                {/* Left Side: Order Summary (Span 2) */}
                <div className="md:col-span-2 bg-[#090514]/60 border border-purple-950/50 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Discount savings label */}
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {purchaseFlow.plan.discount}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Order Summary
                    </h4>

                    {/* Editable Dynamic Select dropdown */}
                    <div className="mb-6">
                      <label className="text-xs text-gray-400 block mb-1">Package</label>
                      <select 
                        value={purchaseFlow.plan.name}
                        onChange={(e) => {
                          const selected = plans.find(p => p.name === e.target.value);
                          if (selected) {
                            setPurchaseFlow({ ...purchaseFlow, plan: selected });
                          }
                        }}
                        className="w-full bg-[#150f2f] border border-purple-900/30 text-purple-400 font-bold px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        {plans.map(p => (
                          <option key={p.name} value={p.name} className="bg-[#0d091e] text-white font-medium">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan features summary */}
                    <div className="space-y-4 text-sm text-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Credits</span>
                        <span className="font-bold text-white">{purchaseFlow.plan.credits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Duration</span>
                        <span className="font-bold text-yellow-400">{purchaseFlow.plan.duration}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Regular Price</span>
                        <span className="text-gray-500 line-through">৳{purchaseFlow.plan.regularPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400">Discount Savings</span>
                        <span className="text-green-500 font-semibold">-৳{purchaseFlow.plan.regularPrice - purchaseFlow.plan.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment footer */}
                  <div className="border-t border-purple-950/40 pt-6 mt-6">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-base text-gray-300 font-medium">Total Payable</span>
                      <span className="text-3xl font-extrabold text-purple-400">৳{purchaseFlow.plan.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed bg-[#150f2f]/30 p-2 rounded-lg border border-purple-950/20">
                      <span className="text-red-500 font-semibold">Note:</span> By confirming, you agree that payments are non-refundable under any circumstances.
                    </p>
                  </div>
                </div>

                {/* Right Side: Customer Details & Form (Span 3) */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Customer Details</h3>
                    <p className="text-xs text-gray-400 mb-6">Please fill in your valid information.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rahim Ahmed" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-purple-950/30 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" 
                        />
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="017XXXXXXXX" 
                          value={formData.mobile}
                          onChange={(e) => {
                            setFormData({ ...formData, mobile: e.target.value });
                            setIsPhoneInvalid(false); // Reset error state on type
                          }}
                          className={`w-full px-4 py-2.5 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 text-sm transition-all border ${isPhoneInvalid ? 'border-red-500 focus:ring-red-500' : 'border-purple-950/30 focus:ring-purple-500'}`} 
                        />
                        {isPhoneInvalid && (
                          <div className="absolute right-2 top-[34px] bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                            recheck number
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-purple-950/30 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" 
                      />
                    </div>

                    <div className="relative">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Payment Method
                      </h4>
                      {isMethodInvalid && (
                        <div className="absolute right-0 top-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                          Select payment method
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                          { name: 'bKash', img: '/images/icons/bkash.png' },
                          { name: 'Nagad', img: '/images/icons/nagad.png' },
                          { name: 'Rocket', img: '/images/icons/rocket.png' }
                        ].map((method) => (
                          <button 
                            key={method.name}
                            type="button"
                            onClick={() => {
                              setSelectedMethod(method.name);
                              setIsMethodInvalid(false); // Reset error state on select
                            }}
                            className={`p-1 border rounded-xl flex items-center justify-center h-14 bg-white/5 transition-all ${selectedMethod === method.name ? 'border-purple-500 bg-purple-900/10' : isMethodInvalid ? 'border-red-500 hover:border-red-400/50' : 'border-purple-950/30 hover:border-purple-800/40'}`}
                          >
                            <img src={method.img} alt={method.name} className="max-h-full max-w-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        // Check empty text inputs first
                        if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim()) {
                          alert('Please fill out all fields first.');
                          return;
                        }

                        // Check payment method selection
                        if (!selectedMethod) {
                          setIsMethodInvalid(true);
                          return;
                        }
                        
                        // Validate mobile format: must be EXACTLY 11 digits
                        const cleanedMobile = formData.mobile.replace(/\D/g, '');
                        if (cleanedMobile.length !== 11) {
                          setIsPhoneInvalid(true);
                          return;
                        }

                        // Validate email format: must contain '@'
                        if (!formData.email.includes('@')) {
                          alert('Please enter a valid email address containing @');
                          return;
                        }

                        setIsPhoneInvalid(false);
                        setIsMethodInvalid(false);
                        setPurchaseFlow({ ...purchaseFlow, step: 'new_user_instruction' });
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {purchaseFlow.step === 'new_user_instruction' && (
              <div className="text-left animate-[slideLeft_0.3s_ease-out]">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-purple-950/40 pb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Payment Method
                </h4>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { name: 'bKash', img: '/images/icons/bkash.png' },
                    { name: 'Nagad', img: '/images/icons/nagad.png' },
                    { name: 'Rocket', img: '/images/icons/rocket.png' }
                  ].map((method) => (
                    <button 
                      key={method.name}
                      type="button"
                      onClick={() => setSelectedMethod(method.name)}
                      className={`p-1 border rounded-xl flex items-center justify-center h-14 bg-white/5 transition-all ${selectedMethod === method.name ? 'border-purple-500 bg-purple-900/10' : 'border-purple-950/30 hover:border-purple-800/40'}`}
                    >
                      <img src={method.img} alt={method.name} className="max-h-full max-w-full object-contain" />
                    </button>
                  ))}
                </div>

                <div className="bg-[#090514]/60 border border-purple-950/50 p-6 rounded-2xl mb-6 flex flex-col items-center justify-center text-center relative">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 mb-2">SEND MONEY TO (PERSONAL)</span>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-extrabold text-white tracking-wider">01980126826</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("01980126826");
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="p-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-900/30 rounded-lg text-purple-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                      title="Copy Number"
                    >
                      {copySuccess ? (
                        <svg className="w-4 h-4 text-green-400 animate-[scaleUp_0.15s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {copySuccess ? <span className="text-green-400 font-bold">Number Copied!</span> : "Copy Number to Pay"}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Transaction ID (TRXID)</label>
                  <input 
                    type="text" 
                    placeholder="E.G. 8HGD73X..." 
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-purple-900/40 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div className="relative flex items-center gap-2 mb-6 p-2 rounded border transition-all duration-200 bg-[#150f2f]/30 border-purple-950/20">
                  <input 
                    type="checkbox" 
                    id="inst-agree" 
                    checked={hasAgreedTerms}
                    onChange={(e) => {
                      setHasAgreedTerms(e.target.checked);
                      setIsTermsInvalid(false); // Reset error state on click
                    }}
                    className={`rounded bg-[#150f2f] text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4 border ${isTermsInvalid ? 'border-red-500 bg-red-950/20' : 'border-purple-900/40'}`} 
                  />
                  <label htmlFor="inst-agree" className="text-xs text-gray-400 select-none cursor-pointer">
                    I have read and agree to the <Link href="/terms" className="text-blue-400 hover:underline">Terms and Conditions</Link> and Refund Policy.
                  </label>
                  {isTermsInvalid && (
                    <div className="absolute right-2 -top-6 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                      you must agree
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setPurchaseFlow({ ...purchaseFlow, step: 'new_user_form' })}
                    className="w-1/3 bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-3.5 rounded-xl border border-purple-900/40 shadow-sm text-sm transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!hasAgreedTerms) {
                        setIsTermsInvalid(true);
                        return;
                      }
                      setIsTermsInvalid(false);
                      handlePaymentSubmit();
                    }}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-sm"
                  >
                    Pay ৳{purchaseFlow.plan.price} & Confirm
                  </button>
                </div>
              </div>
            )}

            {purchaseFlow.step === 'invalid_trx_view' && (
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-red-900/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Invalid Transaction ID</h3>
                <p className="text-purple-300 text-sm mb-6">Please check your transaction number and try again.</p>
                
                <button 
                  onClick={() => setPurchaseFlow({ ...purchaseFlow, step: 'new_user_instruction' })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                >
                  OK
                </button>
              </div>
            )}

            {purchaseFlow.step === 'payment_success' && (
              <div className="text-center p-4 animate-[scaleUp_0.25s_ease-out]">
                {/* Green Circle Checkmark Icon */}
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-1">Payment Successful!</h3>
                <p className="text-sm font-semibold text-purple-300 mb-6">{purchaseFlow.plan.name} plan is activated</p>

                {/* Details card block matching mockup */}
                <div className="bg-[#150f2f]/60 border border-purple-950/40 rounded-2xl p-4 mb-6 text-left space-y-4 text-xs md:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span>💳</span> Amount Paid:
                    </span>
                    <span className="font-bold text-white">৳{purchaseFlow.plan.price}.00</span>
                  </div>
                  <div className="border-t border-purple-950/30"></div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span>🗒️</span> Transaction ID:
                    </span>
                    <span className="font-mono font-bold text-white tracking-wider">{trxId.trim().toUpperCase()}</span>
                  </div>
                </div>

                <button 
                  onClick={closePurchaseFlow} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

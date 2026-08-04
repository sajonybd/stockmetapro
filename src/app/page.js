"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Country code, prefixes, and exact digit length validation mapping parameters
const countryPrefixes = [
  { code: '+880', name: 'Bangladesh', short: 'BD', length: 11 },
  { code: '+1', name: 'United States', short: 'US', length: 10 },
  { code: '+44', name: 'United Kingdom', short: 'GB', length: 10 },
  { code: '+91', name: 'India', short: 'IN', length: 10 },
  { code: '+92', name: 'Pakistan', short: 'PK', length: 10 },
  { code: '+60', name: 'Malaysia', short: 'MY', length: 9 },
  { code: '+62', name: 'Indonesia', short: 'ID', length: 10 },
  { code: '+966', name: 'Saudi Arabia', short: 'SA', length: 9 },
  { code: '+971', name: 'United Arab Emirates', short: 'AE', length: 9 },
  { code: '+65', name: 'Singapore', short: 'SG', length: 8 },
  { code: '+81', name: 'Japan', short: 'JP', length: 10 },
  { code: '+82', name: 'South Korea', short: 'KR', length: 10 },
  { code: '+1', name: 'Canada', short: 'CA', length: 10 },
  { code: '+61', name: 'Australia', short: 'AU', length: 9 },
  { code: '+49', name: 'Germany', short: 'DE', length: 10 },
  { code: '+33', name: 'France', short: 'FR', length: 9 },
  { code: '+39', name: 'Italy', short: 'IT', length: 10 },
  { code: '+34', name: 'Spain', short: 'ES', length: 9 },
  { code: '+7', name: 'Russia', short: 'RU', length: 10 },
  { code: '+55', name: 'Brazil', short: 'BR', length: 11 },
  { code: '+90', name: 'Turkey', short: 'TR', length: 10 },
];

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
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isTrxInvalid, setIsTrxInvalid] = useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  
  // Global country region, BDT/USD switch states, and Payoneer/Skrill inputs
  const [pricingRegion, setPricingRegion] = useState('BD'); // 'BD' or 'Global'
  const [selectedCountry, setSelectedCountry] = useState('Bangladesh');
  const [senderEmail, setSenderEmail] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  
  // Real-time unique validation status states ('unchecked', 'checking', 'valid', 'invalid')
  const [mobileCheckStatus, setMobileCheckStatus] = useState('unchecked');
  const [emailCheckStatus, setEmailCheckStatus] = useState('unchecked');
  const [mobileCheckMessage, setMobileCheckMessage] = useState('');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

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
            priceUsd: pkg.price_usd || (pkg.name === 'Pro' ? 1.0 : (pkg.name === 'Premium' ? 2.0 : 3.0)),
            regularPrice: regularPriceMap[pkg.name] || (pkg.price_tk + 50),
            usdRegularPrice: pkg.name === 'Pro' ? 1.45 : (pkg.name === 'Premium' ? 2.6 : 4.3),
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
            { name: 'Pro', price: 100, priceUsd: 1.0, regularPrice: 145, usdRegularPrice: 1.45, discount: '30% OFF', duration: '1 Month', credits: 1500, color: '#4caf50' },
            { name: 'Premium', price: 150, priceUsd: 2.0, regularPrice: 200, usdRegularPrice: 2.6, discount: '25% OFF', duration: '1 Month', credits: 2000, color: '#0c2e60', popular: true },
            { name: 'Max', price: 300, priceUsd: 3.0, regularPrice: 430, usdRegularPrice: 4.3, discount: '30% OFF', duration: '2 Months', credits: 4500, color: '#eab308' }
          ]);
        }
      })
      .catch(() => {
        setPlans([
          { name: 'Pro', price: 100, priceUsd: 1.0, regularPrice: 145, usdRegularPrice: 1.45, discount: '30% OFF', duration: '1 Month', credits: 1500, color: '#4caf50' },
          { name: 'Premium', price: 150, priceUsd: 2.0, regularPrice: 200, usdRegularPrice: 2.6, discount: '25% OFF', duration: '1 Month', credits: 2000, color: '#0c2e60', popular: true },
          { name: 'Max', price: 300, priceUsd: 3.0, regularPrice: 430, usdRegularPrice: 4.3, discount: '30% OFF', duration: '2 Months', credits: 4500, color: '#eab308' }
        ]);
      });
  }, []);

  const handleSupportClick = (e) => {
    e.preventDefault();
    setIsSupportOpen(true);
  };

  const handlePlanClick = (plan) => {
    // If Global pricing region is selected, route to country selector dialog step first
    const targetStep = pricingRegion === 'Global' ? 'select_country' : 'select_user_type';
    setPurchaseFlow({ isOpen: true, step: targetStep, plan });
    setActiveUserPhone('');
    setSelectedMethod('');
    setTrxId('');
    setSuccessMsg('');
    setActiveUserFound(null);
    setVerificationError('');
    setFormData({ name: '', email: '', mobile: '' });
    setSenderEmail('');
    setReferenceNote('');
    setHasAgreedTerms(false);
    setIsMethodInvalid(false);
    setIsTermsInvalid(false);
    setSubmitAttempts(0);
    setIsTrxInvalid(false);
    setIsPaymentSubmitting(false);
  };

  const closePurchaseFlow = () => {
    setPurchaseFlow({ isOpen: false, step: '', plan: null });
    setSubmitAttempts(0);
    setIsTrxInvalid(false);
    setIsPaymentSubmitting(false);
  };

  const handleVerifyActiveUser = async () => {
    if (!activeUserPhone.trim()) return;
    setVerificationError('');
    try {
      const code = pricingRegion === 'BD' ? '+880' : (countryPrefixes.find(c => c.name === selectedCountry)?.code || '+1');
      
      let finalIdentifier = activeUserPhone.trim();
      const isEmail = finalIdentifier.includes('@');
      const isLicenseKey = !isEmail && /[a-zA-Z]/.test(finalIdentifier);
      
      // Keep a clean numeric version (without country code or leading 0) for fallback checks
      let rawDigits = finalIdentifier.replace(/\D/g, '');
      if (rawDigits.startsWith('880')) {
        rawDigits = rawDigits.substring(3);
      }
      if (rawDigits.startsWith('0')) {
        rawDigits = rawDigits.substring(1);
      }

      if (!isEmail && !isLicenseKey) {
        // Strip any leading zeros or prefix typed, and prepend clean selected prefix
        let rawNum = finalIdentifier.replace(/\D/g, '');
        if (rawNum.startsWith('880')) rawNum = rawNum.substring(3);
        if (rawNum.startsWith('0')) rawNum = rawNum.substring(1);

        // Check if length is correct for selected country
        const targetCountry = pricingRegion === 'BD' ? 'Bangladesh' : selectedCountry;
        const matchedCountry = countryPrefixes.find(c => c.name === targetCountry);
        const expectedLength = matchedCountry ? matchedCountry.length : 10;
        
        // Expected length without leading zero: BD: 11 - 1 = 10, Singapore: 8, USA: 10
        const expectedNoZeroLength = targetCountry === 'Bangladesh' ? 10 : expectedLength;

        if (rawNum.length !== expectedNoZeroLength) {
          setVerificationError(`⚠️ Invalid mobile number length for ${targetCountry}. Expected ${matchedCountry?.length || 10} digits.`);
          return;
        }

        finalIdentifier = code + rawNum;
      }

      // 1. Try to search using final formatted identifier (with selected prefix)
      let res = await fetch('/api/renew/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: finalIdentifier })
      });
      let data = await res.json();

      // 2. If not found, try searching with raw digit version to catch cross-country matches
      if (!data.success && !isEmail && !isLicenseKey && rawDigits) {
        // Test BD database fallback
        const fallbackBD = '+880' + rawDigits;
        const resBD = await fetch('/api/renew/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: fallbackBD })
        });
        const dataBD = await resBD.json();
        if (dataBD.success) {
          data = dataBD;
        } else {
          // Test Global database fallback using common code prefixes if not BD
          for (const cp of countryPrefixes.filter(c => c.code !== '+880')) {
            const fallbackGlobal = cp.code + rawDigits;
            const resG = await fetch('/api/renew/lookup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ identifier: fallbackGlobal })
            });
            const dataG = await resG.json();
            if (dataG.success) {
              data = dataG;
              break;
            }
          }
        }
      }

      if (data.isBlocked) {
        const bType = data.blockedType || (activeUserPhone.includes('@') ? 'email' : 'mobile');
        setPurchaseFlow({ ...purchaseFlow, step: 'account_rejected_view', blockedType: bType });
        return;
      }

      if (data.isPending) {
        setPurchaseFlow({ 
          ...purchaseFlow, 
          step: 'payment_success', 
          isAutoApproved: false, 
          plan: purchaseFlow.plan || { name: data.pendingDetails?.packageName || 'Pro Plan', price: data.pendingDetails?.amount || 150 },
          pendingDetails: data.pendingDetails 
        });
        return;
      }

      if (data.success) {
        // Enforce country check: If user phone belongs to a different country code, reject and prompt to change country/region
        const userMobile = data.data.userInfo?.mobile || '';
        const userDigits = userMobile.replace(/\D/g, '');
        const targetCleanCode = code.replace(/\D/g, ''); // e.g. "880" or "1"

        // Check if user matches current region
        let isCountryMatched = false;
        if (pricingRegion === 'BD') {
          // BD user can have number starting with +880, 880, or 0
          isCountryMatched = userMobile.startsWith('+880') || userMobile.startsWith('880') || (userMobile.startsWith('0') && userMobile.length === 11) || userDigits.length === 10;
        } else {
          // Global user matches if mobile prefix starts with the selected country code
          isCountryMatched = userMobile.startsWith(code) || userMobile.startsWith(code.replace('+', '')) || userDigits.startsWith(targetCleanCode);
        }

        if (userMobile && !isCountryMatched) {
          // Find registering country name from prefixes list
          const matchedCountry = countryPrefixes.find(cp => userMobile.startsWith(cp.code) || userDigits.startsWith(cp.code.replace('+', '')));
          const expectedLocation = matchedCountry ? matchedCountry.name : 'Bangladesh';
          const expectedRegion = matchedCountry?.code === '+880' || !matchedCountry ? 'Bangladesh' : 'Global';

          setVerificationError(`⚠️ This user is registered under ${expectedRegion} (${matchedCountry?.code || '+880'}). Please change pricing region or select '${expectedLocation}' to renew.`);
          return;
        }
        setActiveUserFound(data.data);
        setPurchaseFlow({ ...purchaseFlow, step: 'active_user_details' });
      } else {
        if (data.isBlocked) {
          setPurchaseFlow({ ...purchaseFlow, step: 'account_rejected_view' });
          return;
        }
        if (!isLicenseKey) {
          // Keep the typed phone number as-is (clean digits only, preserving leading zero if BD)
          let cleanedPhone = activeUserPhone.trim().replace(/\D/g, '');
          
          // If BD user typed number without leading 0, prepend it to satisfy 11-digit input requirement
          if (pricingRegion === 'BD' && !isEmail) {
            if (cleanedPhone.startsWith('880')) {
              cleanedPhone = cleanedPhone.substring(3);
            }
            if (!cleanedPhone.startsWith('0')) {
              cleanedPhone = '0' + cleanedPhone;
            }
          }

          setFormData({
            name: '',
            email: isEmail ? activeUserPhone.trim() : '',
            mobile: !isEmail ? cleanedPhone : ''
          });
          
          if (isEmail) {
            setEmailCheckStatus('valid');
            setMobileCheckStatus('unchecked');
          } else {
            setMobileCheckStatus('valid');
            setEmailCheckStatus('unchecked');
          }
          setPurchaseFlow({ ...purchaseFlow, step: 'new_user_form' });
        } else {
          setPurchaseFlow({ ...purchaseFlow, step: 'wrong_info_view' });
        }
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

    const isGlobal = ['Payoneer', 'Skrill'].includes(selectedMethod) || pricingRegion === 'Global';
    const finalTrxId = isGlobal ? `${senderEmail} (${referenceNote})` : trxId;

    if (isGlobal && (!senderEmail.trim() || !referenceNote.trim())) {
      alert('Please fill out Sender Email and Payment Reference fields.');
      return;
    }
    if (!isGlobal && (!trxId.trim() || /\s/.test(trxId))) {
      setIsTrxInvalid(true);
      return;
    }

    try {
      setIsPaymentSubmitting(true);
      const code = pricingRegion === 'BD' ? '+880' : (countryPrefixes.find(c => c.name === selectedCountry)?.code || '+1');
      const isRenewUser = !!activeUserFound;

      let mobileVal = isRenewUser
        ? (activeUserFound?.userInfo?.mobile || activeUserPhone)
        : (formData.mobile.startsWith('+') ? formData.mobile : (code + formData.mobile.replace(/\D/g, '').replace(/^880/, '').replace(/^0/, '')));

      const payload = {
        name: isRenewUser ? (activeUserFound?.userInfo?.name || 'Active User') : formData.name,
        email: isRenewUser ? (activeUserFound?.userInfo?.email || '') : formData.email,
        mobile: mobileVal,
        packageId: purchaseFlow.plan._id,
        payment_method: selectedMethod,
        trx_id: finalTrxId,
        amount: isGlobal ? purchaseFlow.plan.priceUsd : purchaseFlow.plan.price,
        currency: isGlobal ? 'USD' : 'BDT',
        licenseId: isRenewUser ? activeUserFound?.licenseKey : null,
        userId: activeUserFound?.userInfo?._id || null
      };

      const isGlobalMethod = ['Payoneer', 'Skrill'].includes(selectedMethod);

      const res = await fetch('/api/user/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          bypass_sms: isGlobalMethod || submitAttempts >= 1 // Payoneer & Skrill go directly to Admin approval on 1st submit
        })
      });
      const data = await res.json();

      // Enforce at least 2 seconds of loading animation to make it look smooth and clear
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (data.success) {
        setIsTrxInvalid(false);
        setPurchaseFlow({ 
          ...purchaseFlow, 
          step: 'payment_success',
          isAutoApproved: data.isAutoApproved,
          message: data.message
        });
      } else {
        if (submitAttempts < 1) {
          const nextAttemptCount = submitAttempts + 1;
          setSubmitAttempts(nextAttemptCount);
          setIsTrxInvalid(true);
        } else {
          alert(data.message || 'Payment processing failed. Please check details.');
        }
      }
    } catch (err) {
      alert('Network error occurred: ' + err.message);
    } finally {
      setIsPaymentSubmitting(false);
    }
  };
  const checkUniqueMobile = async (mobileNum) => {
    const cleaned = mobileNum.replace(/\D/g, '');
    const isBD = pricingRegion === 'BD';
    
    // Find expected exact phone length for selected country
    const targetCountry = isBD ? 'Bangladesh' : selectedCountry;
    const matchedCountry = countryPrefixes.find(c => c.name === targetCountry);
    const expectedLength = matchedCountry ? matchedCountry.length : 10;
    
    // Enforce exact length matching (e.g. 11 for BD, 8 for Singapore, 10 for USA)
    const isValidLength = cleaned.length === expectedLength;
    
    if (!isValidLength) {
      setMobileCheckStatus('unchecked');
      return;
    }
    setMobileCheckStatus('checking');
    try {
      const code = isBD ? '+880' : (countryPrefixes.find(c => c.name === selectedCountry)?.code || '+1');
      const finalMobileVal = code + cleaned.replace(/^0/, ''); // Normalize prefix value to store in database

      const res = await fetch('/api/auth/check-unique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'mobile', value: finalMobileVal })
      });
      const data = await res.json();
      if (data.success) {
        setMobileCheckStatus(data.isUsed ? 'invalid' : 'valid');
        setMobileCheckMessage(data.message || (data.isUsed ? 'This mobile number is already registered or pending verification.' : ''));
      } else {
        setMobileCheckStatus('unchecked');
        setMobileCheckMessage('');
      }
    } catch {
      setMobileCheckStatus('unchecked');
      setMobileCheckMessage('');
    }
  };

  const checkUniqueEmail = async (emailStr) => {
    if (!emailStr.includes('@') || emailStr.length < 5) {
      setEmailCheckStatus('unchecked');
      setEmailCheckMessage('');
      return;
    }
    setEmailCheckStatus('checking');
    try {
      const res = await fetch('/api/auth/check-unique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'email', value: emailStr })
      });
      const data = await res.json();
      if (data.success) {
        setEmailCheckStatus(data.isUsed ? 'invalid' : 'valid');
        setEmailCheckMessage(data.message || (data.isUsed ? 'This email address is already registered or pending verification.' : ''));
      } else {
        setEmailCheckStatus('unchecked');
        setEmailCheckMessage('');
      }
    } catch {
      setEmailCheckStatus('unchecked');
      setEmailCheckMessage('');
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
          <h2 className="text-4xl font-bold text-center text-white mb-4">Our Pricing Plan</h2>
          
          {/* Bangladesh - International Region Toggler */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#0d091e] border border-purple-900/40 p-1 rounded-2xl flex gap-1">
              <button 
                onClick={() => {
                  setPricingRegion('BD');
                  setSelectedCountry('Bangladesh');
                }}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pricingRegion === 'BD' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                🇧🇩 Bangladesh
              </button>
              <button 
                onClick={() => {
                  setPricingRegion('Global');
                  if (selectedCountry === 'Bangladesh') {
                    setSelectedCountry('United States'); // Set default international country
                  }
                }}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pricingRegion === 'Global' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                🌐 Global
              </button>
            </div>
          </div>

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
                    <span className="text-sm text-gray-500 line-through">
                      {pricingRegion === 'BD' ? `৳${plan.regularPrice}` : `$${plan.usdRegularPrice?.toFixed(2)}`}
                    </span>
                    <span className="text-5xl font-extrabold text-white">
                      {pricingRegion === 'BD' ? `৳${plan.price}` : `$${plan.priceUsd?.toFixed(2)}`}
                    </span>
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
            
            {purchaseFlow.step === 'select_country' && (
              <div className="text-center animate-[slideLeft_0.3s_ease-out]">
                <h3 className="text-2xl font-bold text-white mb-2">Select Your Country</h3>
                <p className="text-purple-300 text-sm mb-6">Select your country to get correct codes and payment options.</p>
                
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-purple-950/30 bg-[#150f2f] text-white rounded-lg mb-6 focus:ring-2 focus:ring-purple-600 focus:outline-none text-sm"
                >
                  {countryPrefixes.filter(c => c.name !== 'Bangladesh').map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#0d091e] text-white">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <div className="flex gap-4">
                  <button 
                    onClick={closePurchaseFlow}
                    className="w-1/3 bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-3 rounded-lg text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setPurchaseFlow({ ...purchaseFlow, step: 'select_user_type' });
                    }}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {purchaseFlow.step === 'select_user_type' && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Get {purchaseFlow.plan?.name && purchaseFlow.plan.name.toLowerCase().includes('plan') ? purchaseFlow.plan.name : `${purchaseFlow.plan?.name || ''} Plan`}</h3>
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
                    onClick={() => {
                      if (!activeUserPhone.trim()) {
                        alert('Please fill out the field first.');
                        return;
                      }
                      handleVerifyActiveUser();
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
                <div className="text-center animate-[slideLeft_0.3s_ease-out] max-w-sm mx-auto">
                  {/* Green Verified Tick */}
                  <div className="w-10 h-10 bg-green-900/30 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-2 text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  
                  <h3 className="text-base font-bold text-white mb-4">User Verified!</h3>

                  {/* Account Details Box */}
                  <div className="bg-[#090514]/80 border border-purple-950/50 p-4 rounded-xl mb-4 text-left relative">
                    <span className="text-[8px] uppercase font-bold text-gray-500 block mb-0.5 text-center tracking-widest">ACCOUNT HOLDER</span>
                    <h4 className="text-sm font-extrabold text-white text-center mb-3 tracking-wide">
                      {activeUserFound?.userInfo?.name || 'Registered Contributor'}
                    </h4>

                    <div className="space-y-2">
                      {emailVal && (
                        <div className="flex items-center gap-3 bg-[#150f2f]/60 px-3 py-2 rounded-lg border border-purple-950/30 text-[11px]">
                          <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="text-gray-400 uppercase w-10 font-bold tracking-wider">EMAIL</span>
                          <span className="text-gray-200 ml-auto truncate select-all">{maskEmail(emailVal)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 bg-[#150f2f]/60 px-3 py-2 rounded-lg border border-purple-950/30 text-[11px]">
                        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="text-gray-400 uppercase w-10 font-bold tracking-wider">PHONE</span>
                        <span className="text-gray-200 ml-auto truncate select-all">{maskPhone(phoneVal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection Details */}
                  <div className="bg-[#090514]/80 border border-purple-950/50 p-4 rounded-xl text-left mb-4 text-xs">
                    {/* Select dropdown to change package */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Package</span>
                      <select 
                        value={purchaseFlow.plan.name}
                        onChange={(e) => {
                          const selected = plans.find(p => p.name === e.target.value);
                          if (selected) {
                            setPurchaseFlow({ ...purchaseFlow, plan: selected });
                          }
                        }}
                        className="bg-[#150f2f] border border-purple-900/30 text-white font-bold text-[10px] px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        {plans.map(p => (
                          <option key={p.name} value={p.name} className="bg-[#0d091e] text-white font-medium">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-[11px] text-gray-300 border-b border-purple-950/30 pb-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Credits</span>
                        <span className="font-bold text-white">{purchaseFlow.plan.credits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Regular Price</span>
                        <span className="text-gray-500 line-through">
                          {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                            ? `৳${purchaseFlow.plan.regularPrice}` 
                            : `$${purchaseFlow.plan.usdRegularPrice?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-green-400">
                        <div className="flex items-center gap-1.5">
                          <span>You Save</span>
                          <span className="bg-green-900/20 text-green-400 text-[8px] font-bold px-1.5 py-0.2 rounded border border-green-500/20">{purchaseFlow.plan.discount}</span>
                        </div>
                        <span className="font-bold">
                          {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                            ? `-৳${purchaseFlow.plan.regularPrice - purchaseFlow.plan.price}`
                            : `-$${(purchaseFlow.plan.usdRegularPrice - purchaseFlow.plan.priceUsd)?.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Total Payable</span>
                      <span className="text-lg font-extrabold text-purple-400">
                        {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                          ? `৳${purchaseFlow.plan.price}`
                          : `$${purchaseFlow.plan.priceUsd?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector for Renewing User */}
                  <div className="bg-[#090514]/80 border border-purple-950/50 p-4 rounded-xl text-left mb-4 relative">
                    <h4 className="text-[10px] font-bold text-white mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      Payment Method
                    </h4>
                    {isMethodInvalid && (
                      <div className="absolute right-4 top-4 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow animate-bounce">
                        Select method
                      </div>
                    )}
                    <div className={`grid gap-2 ${pricingRegion === 'BD' ? 'grid-cols-5' : 'grid-cols-2'}`}>
                      {(pricingRegion === 'BD' 
                        ? [
                            { name: 'bKash', img: '/images/icons/bkash.png' },
                            { name: 'Nagad', img: '/images/icons/nagad.png' },
                            { name: 'Rocket', img: '/images/icons/rocket.png' },
                            { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                            { name: 'Skrill', img: '/images/icons/skrill.png' }
                          ]
                        : [
                            { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                            { name: 'Skrill', img: '/images/icons/skrill.png' }
                          ]
                      ).map((method) => (
                        <button 
                          key={method.name}
                          type="button"
                          onClick={() => {
                            setSelectedMethod(method.name);
                            setIsMethodInvalid(false); // Reset error state on select
                          }}
                          className={`p-1 border rounded-lg flex items-center justify-center h-10 bg-white/5 transition-all ${selectedMethod === method.name ? 'border-purple-500 bg-purple-900/10' : isMethodInvalid ? 'border-red-500 hover:border-red-400/50' : 'border-purple-950/30 hover:border-purple-800/40'}`}
                        >
                          <img src={method.img} alt={method.name} className="max-h-full max-w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setPurchaseFlow({ ...purchaseFlow, step: 'select_user_type' });
                      }}
                      className="w-1/3 bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-2.5 rounded-lg border border-purple-900/40 text-xs transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        // Check payment method selection
                        if (!selectedMethod) {
                          setIsMethodInvalid(true);
                          return;
                        }
                        // Set default user information so the next step works correctly for active users
                        setFormData({
                          name: activeUserFound?.userInfo?.name || 'Active User',
                          email: activeUserFound?.userInfo?.email || '',
                          mobile: activeUserFound?.userInfo?.mobile || activeUserPhone
                        });
                        setIsMethodInvalid(false);
                        setPurchaseFlow({ ...purchaseFlow, step: 'new_user_instruction' });
                      }}
                      className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-md text-xs"
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
                        <span className="text-gray-500 line-through">
                          {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod) 
                            ? `৳${purchaseFlow.plan.regularPrice}` 
                            : `$${purchaseFlow.plan.usdRegularPrice?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400">Discount Savings</span>
                        <span className="text-green-500 font-semibold">
                          {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                            ? `-৳${purchaseFlow.plan.regularPrice - purchaseFlow.plan.price}`
                            : `-$${(purchaseFlow.plan.usdRegularPrice - purchaseFlow.plan.priceUsd)?.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment footer */}
                  <div className="border-t border-purple-950/40 pt-6 mt-6">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-base text-gray-300 font-medium">Total Payable</span>
                      <span className="text-3xl font-extrabold text-purple-400">
                        {pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                          ? `৳${purchaseFlow.plan.price}`
                          : `$${purchaseFlow.plan.priceUsd?.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed bg-[#150f2f]/30 p-2 rounded-lg border border-purple-950/20">
                      <span className="text-red-500 font-semibold">Note:</span> By confirming, you agree that payments are non-refundable under any circumstances.
                    </p>
                  </div>
                </div>

                {/* Right Side: Contributor Details & Form (Span 3) */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Contributor Details</h3>
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
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                          {isPhoneInvalid && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                              recheck number
                            </span>
                          )}
                          {mobileCheckStatus === 'invalid' && !isPhoneInvalid && (
                            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                              already used
                            </span>
                          )}
                        </div>
                        <div className={`relative flex items-center rounded-lg border overflow-hidden transition-all ${
                          isPhoneInvalid || mobileCheckStatus === 'invalid' 
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-950/10' 
                            : mobileCheckStatus === 'valid' 
                            ? 'border-green-500 ring-1 ring-green-500 bg-green-950/10' 
                            : 'border-purple-950/30 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'
                        }`}>
                          {/* Locked/Fixed Country Code display prefix */}
                          <span className="px-3 py-2.5 bg-purple-950/40 text-xs font-bold text-purple-300 select-none border-r border-purple-900/40 flex items-center justify-center shrink-0">
                            {pricingRegion === 'BD' ? '+880' : (countryPrefixes.find(c => c.name === selectedCountry)?.code || '+1')}
                          </span>
                          <input 
                            type="tel" 
                            placeholder="Phone Number" 
                            value={formData.mobile}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, ''); // Strip non-digits
                              setFormData({ ...formData, mobile: val });
                              setIsPhoneInvalid(false); // Reset error state on type

                              const targetCountry = pricingRegion === 'BD' ? 'Bangladesh' : selectedCountry;
                              const matchedCountry = countryPrefixes.find(c => c.name === targetCountry);
                              const expectedLength = matchedCountry ? matchedCountry.length : 10;

                              if (val.length === expectedLength) {
                                checkUniqueMobile(val);
                              } else {
                                setMobileCheckStatus('unchecked');
                                if (val.length > expectedLength) {
                                  setIsPhoneInvalid(true);
                                } else {
                                  setIsPhoneInvalid(false);
                                }
                              }
                            }}
                            className="w-full pl-3 pr-8 py-2.5 bg-[#150f2f] text-white focus:outline-none text-sm transition-all border-0" 
                          />
                          {/* Inner Right Status Indicator */}
                          <div className="absolute right-2 flex items-center justify-center">
                            {mobileCheckStatus === 'checking' && (
                              <svg className="animate-spin h-3 w-3 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {mobileCheckStatus === 'valid' && (
                              <span className="text-green-500 font-bold text-sm" title="Available">✓</span>
                            )}
                            {mobileCheckStatus === 'invalid' && (
                              <span className="text-red-500 font-bold text-xs" title="Already Used">⚠️</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                        {emailCheckStatus === 'invalid' && (
                          <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
                            already used
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="email" 
                          placeholder="name@example.com" 
                          value={formData.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, email: val });
                            if (val.includes('@') && val.length >= 5) {
                              checkUniqueEmail(val);
                            } else {
                              setEmailCheckStatus('unchecked');
                            }
                          }}
                          className={`w-full pl-4 pr-10 py-2.5 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 text-sm transition-all border ${emailCheckStatus === 'invalid' ? 'border-red-500 focus:ring-red-500 bg-red-950/10' : emailCheckStatus === 'valid' ? 'border-green-500 focus:ring-green-500 bg-green-950/10' : 'border-purple-950/30 focus:ring-purple-500'}`} 
                        />
                        {/* Inner Right Status Indicator */}
                        <div className="absolute right-3 flex items-center justify-center">
                          {emailCheckStatus === 'checking' && (
                            <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {emailCheckStatus === 'valid' && (
                            <span className="text-green-500 font-bold text-base" title="Available">✓</span>
                          )}
                          {emailCheckStatus === 'invalid' && (
                            <span className="text-red-500 font-bold text-sm" title="Already Used">⚠️</span>
                          )}
                        </div>
                      </div>
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
                      <div className={`grid gap-3 mb-6 ${pricingRegion === 'BD' ? 'grid-cols-5' : 'grid-cols-2'}`}>
                        {(pricingRegion === 'BD' 
                          ? [
                              { name: 'bKash', img: '/images/icons/bkash.png' },
                              { name: 'Nagad', img: '/images/icons/nagad.png' },
                              { name: 'Rocket', img: '/images/icons/rocket.png' },
                              { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                              { name: 'Skrill', img: '/images/icons/skrill.png' }
                            ]
                          : [
                              { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                              { name: 'Skrill', img: '/images/icons/skrill.png' }
                            ]
                        ).map((method) => (
                          <button 
                            key={method.name}
                            type="button"
                            onClick={() => {
                              setSelectedMethod(method.name);
                              setIsMethodInvalid(false); // Reset error state on select
                            }}
                            className={`p-1.5 border rounded-xl flex items-center justify-center h-14 bg-white/5 transition-all ${selectedMethod === method.name ? 'border-purple-500 bg-purple-900/10' : isMethodInvalid ? 'border-red-500 hover:border-red-400/50' : 'border-purple-950/30 hover:border-purple-800/40'}`}
                          >
                            <img src={method.img} alt={method.name} className="max-h-full max-w-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const cleanedMobile = formData.mobile.replace(/\D/g, '');
                    const isBD = pricingRegion === 'BD';
                    const targetCountry = isBD ? 'Bangladesh' : selectedCountry;
                    const matchedCountry = countryPrefixes.find(c => c.name === targetCountry);
                    const expectedLength = matchedCountry ? matchedCountry.length : 10;
                    const isLengthValid = cleanedMobile.length === expectedLength;

                    const isStep2Valid = 
                      formData.name.trim().length > 0 &&
                      formData.mobile.trim().length > 0 &&
                      formData.email.trim().length > 0 &&
                      formData.email.includes('@') &&
                      !!selectedMethod &&
                      isLengthValid &&
                      mobileCheckStatus === 'valid' &&
                      emailCheckStatus === 'valid';

                    return (
                      <div className="mt-4">
                        <button 
                          type="button"
                          disabled={!isStep2Valid}
                          onClick={() => {
                            if (!isStep2Valid) return;
                            setIsPhoneInvalid(false);
                            setIsMethodInvalid(false);
                            setPurchaseFlow({ ...purchaseFlow, step: 'new_user_instruction' });
                          }}
                          className={`w-full py-3.5 rounded-xl font-bold transition-all text-sm ${
                            isStep2Valid 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white cursor-pointer shadow-md shadow-purple-600/30 transform hover:-translate-y-0.5' 
                              : 'bg-gray-800/80 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            {purchaseFlow.step === 'new_user_instruction' && (() => {
              const selectedMethodDetails = (pricingRegion === 'BD'
                ? [
                    { name: 'bKash', img: '/images/icons/bkash.png' },
                    { name: 'Nagad', img: '/images/icons/nagad.png' },
                    { name: 'Rocket', img: '/images/icons/rocket.png' },
                    { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                    { name: 'Skrill', img: '/images/icons/skrill.png' }
                  ]
                : [
                    { name: 'Payoneer', img: '/images/icons/payoneer.png' },
                    { name: 'Skrill', img: '/images/icons/skrill.png' }
                  ]
              ).find(m => m.name === selectedMethod);

              const isGlobalMethod = ['Payoneer', 'Skrill'].includes(selectedMethod);
              const payAmountString = (pricingRegion === 'BD' && !isGlobalMethod)
                ? `Pay ৳${purchaseFlow.plan.price} & Confirm`
                : `Pay $${purchaseFlow.plan.priceUsd?.toFixed(2)} & Confirm`;

              // Global/BD Account info mapping for Payoneer/Skrill/Local
              const getRecipientAccount = () => {
                if (selectedMethod === 'Payoneer') return 'okentertainmentbd@hotmail.com';
                if (selectedMethod === 'Skrill') return 'mahfuj11081999@gmail.com';
                return '01980126826';
              };

              return (
                <div className="text-left animate-[slideLeft_0.3s_ease-out]">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-purple-950/40 pb-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Payment Method
                  </h4>

                  {/* Unified Selected Method Header Row (Single Logo Left, Amount Right) */}
                  <div className="bg-[#150f2f]/30 border border-purple-950/30 p-4 rounded-xl flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-white/5 border border-purple-950/20 rounded-lg flex items-center justify-center p-1">
                        {selectedMethodDetails && (
                          <img src={selectedMethodDetails.img} alt={selectedMethod} className="max-h-full max-w-full object-contain" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-white">{selectedMethod}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Amount to Pay</span>
                      <span className="text-lg font-extrabold text-green-400">
                        {pricingRegion === 'BD' && !isGlobalMethod 
                          ? `৳${purchaseFlow.plan.price}` 
                          : `$${purchaseFlow.plan.priceUsd?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#090514]/60 border border-purple-950/50 p-6 rounded-2xl mb-6 flex flex-col items-center justify-center text-center relative">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 mb-2">
                      {isGlobalMethod ? 'SEND MONEY TO (EMAIL)' : 'SEND MONEY TO (PERSONAL)'}
                    </span>
                    
                    <div className="flex items-center justify-center gap-2 mb-2 max-w-full overflow-hidden">
                      <span className={`${isGlobalMethod ? 'text-sm sm:text-base' : 'text-xl'} font-extrabold text-white tracking-normal whitespace-nowrap`}>{getRecipientAccount()}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(getRecipientAccount());
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        }}
                        className="p-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-900/30 rounded-lg text-purple-400 hover:text-white transition-colors flex items-center justify-center gap-1 shrink-0"
                        title="Copy"
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
                      {copySuccess ? <span className="text-green-400 font-bold">Account Copied!</span> : "Copy Account Details to Pay"}
                    </span>
                  </div>

                  {/* Input Form Fields (Conditional layout based on Selected Method type) */}
                  {isTrxInvalid && (
                    <div className="text-red-500 font-bold text-xs mb-3 animate-[pulse_1s_infinite] flex items-center gap-1">
                      <span>⚠️</span> Please recheck your transaction number / ID
                    </div>
                  )}

                  {isGlobalMethod ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Sender Email Address</label>
                        <input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          value={senderEmail}
                          onChange={(e) => {
                            setSenderEmail(e.target.value);
                            setTrxId(e.target.value); // Sync to payload to satisfy API models validations
                            setIsTrxInvalid(false); // Reset border on type
                          }}
                          className={`w-full px-4 py-2.5 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 text-sm transition-all border ${isTrxInvalid ? 'border-red-500 focus:ring-red-500 bg-red-950/10' : 'border-purple-900/40 focus:ring-purple-500'}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Payment Reference / TrxID</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Ref No / Transaction ID" 
                          value={referenceNote}
                          onChange={(e) => {
                            setReferenceNote(e.target.value);
                            setIsTrxInvalid(false); // Reset border on type
                          }}
                          className={`w-full px-4 py-2.5 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 text-sm transition-all border ${isTrxInvalid ? 'border-red-500 focus:ring-red-500 bg-red-950/10' : 'border-purple-900/40 focus:ring-purple-500'}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Transaction ID (TRXID)</label>
                      <input 
                        type="text" 
                        placeholder="E.G. 8HGD73X..." 
                        value={trxId}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\s+/g, ''); // Disallow and strip spaces instantly
                          setTrxId(cleaned);
                          setIsTrxInvalid(false); // Reset border on type
                        }}
                        className={`w-full px-4 py-2.5 bg-[#150f2f] text-white rounded-lg focus:outline-none focus:ring-1 text-sm transition-all border ${isTrxInvalid ? 'border-red-500 focus:ring-red-500 bg-red-950/10' : 'border-purple-900/40 focus:ring-purple-500'}`}
                      />
                    </div>
                  )}

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
                      onClick={() => {
                        if (activeUserFound) {
                          setPurchaseFlow({ ...purchaseFlow, step: 'active_user_details' });
                        } else {
                          setPurchaseFlow({ ...purchaseFlow, step: 'new_user_form' });
                        }
                      }}
                      className="w-1/3 bg-[#150f2f] hover:bg-purple-950/50 text-white font-semibold py-3.5 rounded-xl border border-purple-900/40 shadow-sm text-sm transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (isPaymentSubmitting) return;
                        if (!hasAgreedTerms) {
                          setIsTermsInvalid(true);
                          return;
                        }
                        if (isGlobalMethod && (!senderEmail.trim() || !referenceNote.trim())) {
                          alert('Please fill out Sender Email and Payment Reference fields.');
                          return;
                        }
                        if (!isGlobalMethod && !trxId.trim()) {
                          alert('Please enter Transaction ID.');
                          return;
                        }
                        setIsTermsInvalid(false);
                        handlePaymentSubmit();
                      }}
                      disabled={isPaymentSubmitting}
                      className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isPaymentSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        payAmountString
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {purchaseFlow.step === 'payment_success' && (
              <div className="text-center p-4 animate-[scaleUp_0.25s_ease-out]">
                {purchaseFlow.isAutoApproved ? (
                  <>
                    {/* Green Circle Checkmark Icon */}
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">Payment Successful!</h3>
                    <p className="text-sm font-semibold text-purple-300 mb-6">
                      {activeUserFound 
                        ? `Your assigned ${purchaseFlow.plan.name} Plan has been renewed / activated.`
                        : `⭐ ${purchaseFlow.plan.name} plan is activated.`}
                    </p>
                    {!activeUserFound && (
                      <p className="text-xs text-gray-400 mb-4">📧 Please check your email for access details.</p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Orange/Yellow Waiting Clock Icon */}
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">Payment Awaiting Verification</h3>
                    <p className="text-sm font-semibold text-amber-400 mb-6">
                      {activeUserFound
                        ? `Your assigned ${purchaseFlow.plan.name} Plan renewal request is pending verification. It will activate shortly.`
                        : `Your ${purchaseFlow.plan.name} Plan registration request is pending verification. Please check your email shortly.`}
                    </p>
                  </>
                )}

                {/* Details card block matching mockup */}
                <div className="bg-[#150f2f]/60 border border-purple-950/40 rounded-2xl p-4 mb-6 text-left space-y-4 text-xs md:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span>💳</span> Amount Paid:
                    </span>
                    <span className="font-bold text-white">
                      {purchaseFlow.pendingDetails
                        ? `৳${purchaseFlow.pendingDetails.amount?.toFixed(2) || purchaseFlow.pendingDetails.amount}`
                        : (pricingRegion === 'BD' && !['Payoneer', 'Skrill'].includes(selectedMethod)
                          ? `৳${purchaseFlow.plan?.price}.00`
                          : `$${purchaseFlow.plan?.priceUsd?.toFixed(2)}`)}
                    </span>
                  </div>
                  <div className="border-t border-purple-950/30"></div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span>🗒️</span> {['Payoneer', 'Skrill'].includes(selectedMethod) ? 'Sender Email / Ref:' : 'Transaction ID:'}
                    </span>
                    <span className="font-mono font-bold text-white tracking-wider truncate max-w-[180px]">
                      {purchaseFlow.pendingDetails
                        ? (purchaseFlow.pendingDetails.trx_id || 'PENDING').toUpperCase()
                        : (['Payoneer', 'Skrill'].includes(selectedMethod)
                          ? `${senderEmail} (${referenceNote})`
                          : trxId.trim().toUpperCase())}
                    </span>
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

            {purchaseFlow.step === 'account_rejected_view' && (
              <div className="text-center p-4 animate-[scaleUp_0.25s_ease-out]">
                {/* Red Circle Exclamation Icon */}
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  {purchaseFlow.blockedType === 'email' ? 'Email Blocked' : 'Number Blocked'}
                </h3>
                <p className="text-sm font-semibold text-red-400 mb-6">
                  {purchaseFlow.blockedType === 'email' 
                    ? 'Email blocked. Account Rejected. Please try with a new email address.' 
                    : 'Number blocked. Account Rejected. Please try with a new mobile number.'}
                </p>

                <button 
                  onClick={closePurchaseFlow} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

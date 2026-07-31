"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [purchaseFlow, setPurchaseFlow] = useState({ isOpen: false, step: '', plan: null });
  const [activeUserPhone, setActiveUserPhone] = useState('');

  const [plans, setPlans] = useState([]);

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
          const formattedPlans = data.data.map(pkg => ({
            name: pkg.name,
            price: pkg.price_tk,
            regularPrice: pkg.price_tk + 50, // Simulated regular price
            duration: `${pkg.duration_days} Days`,
            credits: pkg.credit_limit,
            color: pkg.is_popular ? '#0c2e60' : (pkg.price_tk > 150 ? '#eab308' : '#4caf50'),
            popular: pkg.is_popular
          }));
          setPlans(formattedPlans);
        } else {
          setPlans([
            { name: 'Pro', price: 100, regularPrice: 150, duration: '30 Days', credits: 1500, color: '#4caf50' },
            { name: 'Premium', price: 150, regularPrice: 200, duration: '30 Days', credits: 2000, color: '#0c2e60', popular: true },
            { name: 'Max', price: 300, regularPrice: 400, duration: '60 Days', credits: 4500, color: '#eab308' }
          ]);
        }
      })
      .catch(() => {
        setPlans([
          { name: 'Pro', price: 100, regularPrice: 150, duration: '30 Days', credits: 1500, color: '#4caf50' },
          { name: 'Premium', price: 150, regularPrice: 200, duration: '30 Days', credits: 2000, color: '#0c2e60', popular: true },
          { name: 'Max', price: 300, regularPrice: 400, duration: '60 Days', credits: 4500, color: '#eab308' }
        ]);
      });
  }, []);

  const commonFeatures = [
    'AI-Powered Metadata Generation', 'No Personal API Required', 'One-Click Metadata Embedding',
    'Images, Vectors & Videos Supported', 'SEO-Optimized Metadata', 'Batch File Processing',
    'Secure File Processing', '24/7 Priority Support'
  ];

  const handleSupportClick = (e) => {
    e.preventDefault();
    setIsSupportOpen(true);
  };

  const handlePlanClick = (plan) => {
    setPurchaseFlow({ isOpen: true, step: 'select_user_type', plan });
  };

  const closePurchaseFlow = () => setPurchaseFlow({ isOpen: false, step: '', plan: null });

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h2v18H3V3zm4 10h2v8H7v-8zm4-5h2v13h-2V8zm4 7h2v6h-2v-6zm4-9h2v15h-2V6z" />
            </svg>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">StockMeta<span className="text-green-600">Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <a href="#" className="text-gray-900 hover:text-green-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-green-600 transition-colors">Pricing</a>
            <button onClick={handleSupportClick} className="hover:text-green-600 transition-colors">Support</button>
            <Link href="/about" className="hover:text-green-600 transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0c2e60] to-[#041a3b] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Boost Your Microstock Career and Passive Income to the Next Level
          </h1>
          <h2 className="text-2xl text-blue-200 mb-8 font-semibold">
            Best Metadata Tool for Microstock Contributors!
          </h2>
          <p className="text-lg text-blue-100 mb-10 leading-relaxed max-w-3xl mx-auto">
            Let Stock Meta Pro generate SEO-friendly titles, keywords, and descriptions in seconds. Save time, upload faster, and grow your microstock career with smart metadata, better visibility and, more downloads across Adobe Stock, Shutterstock, Magnific, Vecteezy and more.
          </p>
          <a href="#pricing">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/30 transform hover:-translate-y-1">
              GET STARTED
            </button>
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 relative z-20 -mt-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1c3f6e] mb-16">Our Pricing Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <div key={idx} className={`bg-white border ${plan.popular ? 'border-2 border-[#0c2e60] shadow-xl md:-translate-y-4' : 'border-gray-100 shadow-lg'} rounded-2xl p-8 text-center relative flex flex-col`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[#0c2e60] text-white text-center py-2 rounded-t-xl text-sm font-bold tracking-wider uppercase -mt-px -mx-px">
                    Popular
                  </div>
                )}
                <div className={plan.popular ? 'mt-6' : ''}>
                  <h3 className={`text-2xl font-bold mb-4 ${plan.popular ? 'text-[#0c2e60]' : 'text-gray-800'}`}>{plan.name} Plan</h3>
                  <div className="flex flex-col items-center justify-center mb-6">
                    <span className="text-sm text-gray-400 line-through mb-1">Regular ৳{plan.regularPrice}</span>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold" style={{ color: plan.color }}>৳{plan.price}</span>
                      <span className="text-gray-500 font-medium mb-1">/ {plan.duration}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 py-3 rounded-lg mb-6 font-bold text-gray-700">
                    <span className="text-lg">{plan.credits} Credits</span>
                    <p className="text-xs text-gray-500 font-normal mt-1">1 Credit = 1 Generation</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left text-sm text-gray-600 flex-1">
                    {commonFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> 
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handlePlanClick(plan)}
                    className="w-full text-white py-3 rounded-lg font-semibold transition-colors mt-auto shadow-md"
                    style={{ backgroundColor: plan.color }}
                  >
                    Get {plan.name} Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
           <h2 className="text-4xl font-bold text-center text-[#1c3f6e] mb-16">Key Features</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { 
                title: 'AI Metadata Generation', 
                desc: 'Generate accurate titles, keywords, and descriptions for your images, videos, PNGs, and vectors in just a few seconds using AI.',
                icon: '/images/icons/AI_Metadata_Generation_icon.png'
              },
              { 
                title: 'SEO-Optimized Keywords', 
                desc: 'Get relevant and SEO-friendly keywords that help your files rank higher and reach more buyers on stock marketplaces.',
                icon: '/images/icons/SEO_Optimized_Keywords_Icon.png'
              },
              { 
                title: 'Auto Metadata Embedding', 
                desc: 'Embed metadata automatically and upload to your target stock marketplace.',
                icon: '/images/icons/Auto_Metadata_Embedding_Icon.png',
                badge: 'Max'
              },
              { 
                title: 'Stock Marketplace Optimized', 
                desc: 'Metadata is optimized for Adobe Stock, Shutterstock, Magnific, Vecteezy, and other popular stock platforms.',
                icon: '/images/icons/Stock_Marketplace_Optimized_Icon.png'
              },
              { 
                title: 'Batch Processing', 
                desc: 'Generate metadata for multiple files at the same time, saving hours of manual work and increasing your productivity.',
                icon: '/images/icons/Batch_Processing_Icon.png'
              },
              { 
                title: 'Secure File Processing', 
                desc: 'Your files are processed securely and kept private throughout the entire SEO process. Your creative assets and content idea always stay protected.',
                icon: '/images/icons/Secure_File_Processsing_Icon.png'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md text-center group transition-all relative">
                {feature.badge && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {feature.badge}
                  </div>
                )}
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center p-2">
                  {/* Since icons were copied, we use img tag. Fallback if not loaded */}
                  <img src={feature.icon} alt={feature.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Improve search rankings, attract more buyers & drive more downloads.</h2>
        <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
          Fast, Easy & Effective – Perfect for Microstock Contributors.
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
            <a href="mailto:support@stockmetapro.com" className="hover:text-white transition-colors block">support@stockmetapro.com</a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
          <p>© 2024 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      
      {/* Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h3>
            <div className="flex gap-4 justify-center">
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <span className="text-green-600 font-bold group-hover:text-white text-2xl">WA</span>
                </div>
                <span className="text-sm font-medium text-gray-600">WhatsApp</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <span className="text-blue-600 font-bold group-hover:text-white text-2xl">FB</span>
                </div>
                <span className="text-sm font-medium text-gray-600">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Flow Popups */}
      {purchaseFlow.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={closePurchaseFlow} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {purchaseFlow.step === 'select_user_type' && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Select User Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPurchaseFlow({ ...purchaseFlow, step: 'new_user_form' })}
                    className="p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
                    <span className="font-semibold text-gray-700">New User</span>
                  </button>
                  <button 
                    onClick={() => setPurchaseFlow({ ...purchaseFlow, step: 'active_user_verify' })}
                    className="p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">A</div>
                    <span className="font-semibold text-gray-700">Active User</span>
                  </button>
                </div>
              </div>
            )}

            {purchaseFlow.step === 'active_user_verify' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Package: {purchaseFlow.plan.name}/{purchaseFlow.plan.price}৳</h3>
                <p className="text-gray-500 text-sm mb-6">Confirm your registered number to proceed.</p>
                <input 
                  type="text" 
                  placeholder="Enter registered phone number" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={activeUserPhone}
                  onChange={(e) => setActiveUserPhone(e.target.value)}
                />
                <button 
                  onClick={() => setPurchaseFlow({ ...purchaseFlow, step: 'active_user_details' })}
                  className="w-full bg-[#0c2e60] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors"
                >
                  Verify
                </button>
              </div>
            )}

            {purchaseFlow.step === 'active_user_details' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">User Information</h3>
                {/* Placeholder UI for Active User Details / Payment */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-600 space-y-2">
                   <p><strong>Name:</strong> John Doe</p>
                   <p><strong>Phone:</strong> {activeUserPhone}</p>
                </div>
                <h4 className="font-bold text-gray-800 mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="py-2 border rounded hover:border-pink-500 font-medium">bKash</button>
                  <button className="py-2 border rounded hover:border-purple-500 font-medium">Nagad</button>
                </div>
                <input type="text" placeholder="Transaction ID" className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4"/>
                <button onClick={closePurchaseFlow} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold">Confirm Payment</button>
              </div>
            )}

            {purchaseFlow.step === 'new_user_form' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contributor Details</h3>
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <h4 className="font-bold text-gray-800 mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="py-2 border rounded hover:border-pink-500 font-medium text-pink-600">bKash</button>
                  <button className="py-2 border rounded hover:border-purple-500 font-medium text-purple-600">Nagad</button>
                </div>
                <input type="text" placeholder="Transaction ID" className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button onClick={closePurchaseFlow} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">Confirm Payment</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

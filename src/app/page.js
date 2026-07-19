import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Simple SVG Logo */}
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h2v18H3V3zm4 10h2v8H7v-8zm4-5h2v13h-2V8zm4 7h2v6h-2v-6zm4-9h2v15h-2V6z" />
            </svg>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">StockMeta<span className="text-green-600">Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <a href="#" className="text-gray-900 hover:text-green-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-green-600 transition-colors">Pricing</a>
            <a href="/login" className="hover:text-green-600 transition-colors">Log In</a>
            <Link href="/register">
              <button className="bg-[#1f934b] text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                Subscribe
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0c2e60] to-[#041a3b] text-white py-24 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Generate Stock Market Metadata Easily!
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Create metadata instantly according to your preferred plan.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <button className="bg-[#4caf50] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-green-500/30">
                  View Plans
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-white text-gray-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
                  Start Free Trial
                </button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-2xl">
              {/* Mockup Laptop Screen */}
              <div className="bg-white rounded-lg p-2 aspect-[16/10] flex flex-col">
                <div className="flex gap-1 mb-2 px-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-gray-50 flex-1 rounded border border-gray-100 relative overflow-hidden">
                   {/* Fake Chart Lines */}
                   <div className="absolute bottom-4 left-4 right-4 h-24 flex items-end gap-2">
                      {[40,70,30,50,90,60,80,45,65,35].map((h, i) => (
                        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-green-400' : 'bg-red-400'}`} style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Automatic Data Generation', 
              desc: 'Quickly and accurately create metadata.',
              icon: <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            },
            { 
              title: 'Real-Time Updates', 
              desc: 'Stay updated with live market data.',
              icon: <path d="M3 3v18h18 M7 14l4-4 4 4 6-6" />
            },
            { 
              title: 'Secure & Protected', 
              desc: 'Your data remains completely safe.',
              icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1c3f6e] mb-16">Plans & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Basic Plan */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-[#0c2e60] mb-6">Basic Plan</h3>
              <div className="flex justify-center items-end gap-1 mb-8">
                <span className="text-5xl font-bold text-[#4caf50]">$5</span>
                <span className="text-gray-500 font-medium mb-1">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 text-left text-gray-600">
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> 1000 reports / month</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Basic Analysis</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Email Support</li>
              </ul>
              <button className="w-full bg-[#4caf50] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Subscribe</button>
            </div>

            {/* Premium Plan (Popular) */}
            <div className="bg-white border-2 border-[#0c2e60] rounded-2xl shadow-xl relative transform md:-translate-y-4">
              <div className="bg-[#0c2e60] text-white text-center py-2 rounded-t-xl text-sm font-bold tracking-wider uppercase">
                Popular
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-[#0c2e60] mb-6">Premium Plan</h3>
                <div className="flex justify-center items-end gap-1 mb-8">
                  <span className="text-5xl font-bold text-[#0c2e60]">$15</span>
                  <span className="text-gray-500 font-medium mb-1">/ month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left text-gray-600">
                  <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> 5000 reports / month</li>
                  <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Advanced Analysis</li>
                  <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Live Chat Support</li>
                </ul>
                <button className="w-full bg-[#0c2e60] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">Subscribe</button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-[#0c2e60] mb-6">Pro Plan</h3>
              <div className="flex justify-center items-end gap-1 mb-8">
                <span className="text-5xl font-bold text-[#4caf50]">$30</span>
                <span className="text-gray-500 font-medium mb-1">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 text-left text-gray-600">
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Unlimited Reports</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Full Analysis Tools</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> VIP Support</li>
              </ul>
              <button className="w-full bg-[#4caf50] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Subscribe</button>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-[#1c3f6e] mb-4">Try for Free</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Get a 14-day free trial and experience our service.
        </p>
        <Link href="/register">
          <button className="bg-[#1f934b] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg">
            Start Free Trial
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200 text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 StockMetaPro. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms & Conditions</a>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700">f</div>
            <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center cursor-pointer hover:bg-blue-500">t</div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer hover:bg-blue-600">in</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

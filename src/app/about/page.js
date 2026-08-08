import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen font-sans bg-[#090514] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#090514]/90 backdrop-blur-md border-b border-purple-950/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/images/icons/StockMetaProLogoo.png" alt="StockMetaPro Logo" className="w-auto object-contain" style={{ height: '57px' }} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-purple-200">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="https://wa.me/8801980126826" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>Support</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-5xl font-bold text-white mb-8 text-center tracking-wide">About Us</h1>
        
        <div className="bg-[#0d091e] p-8 md:p-10 rounded-3xl border border-purple-950/40 text-base md:text-lg leading-relaxed text-gray-300 space-y-6 shadow-xl">
          <p>
            Welcome to StockMetaPro — your trusted partner for smarter metadata and faster growth. We help creators, businesses, and professionals organize, optimize, and scale their digital assets with ease. Our mission is simple: make metadata management powerful yet effortless, so you can focus on what truly matters — growing your success.
          </p>
          
          <p>
            At StockMetaPro, we combine clean design, advanced technology, and user-friendly tools to deliver a seamless experience. Whether you are starting your microstock career or managing large content libraries, our platform is built to save time, boost SEO, and maximize your reach.
          </p>
          
          <p>
            In today’s industry, there are several well‑known platforms such as ImStocker, Xpiks, CyberStock, PhotoKeyworder, CSVNest, Metainjector, Auto Metadata AI, SendStock AI, MetaPhotoAI, and more that provide related services. StockMetaPro stands alongside of the same ecosystem, offering solutions that meet the needs of new and active contributors.
          </p>
          
          <div>
            <h3 className="text-xl font-bold text-purple-400 mt-8 mb-4">Our focus is on:</h3>
            <ul className="list-none space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Effortless metadata management that saves time.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                SEO-friendly optimization to increase visibility.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Clean design and user-friendly workflows.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Scalable solutions for both individuals and enterprises.
              </li>
            </ul>
          </div>
          
          <p className="mt-8 font-medium">
            We believe in transparency, reliability, and innovation. That’s why users choose StockMetaPro to streamline their workflow and unlock new opportunities in the digital marketplace.
          </p>

          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-2xl font-bold text-[#1c3f6e] mb-4">Contact Information</h3>
            <div className="space-y-3 text-base">
              <p className="flex items-center gap-2">
                <span>📧</span> <strong>Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=stockmetapro@gmail.com&su=Support%20Request&body=Hello%20StockMetaPro%20Support," target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stockmetapro@gmail.com</a>
              </p>
              <p className="flex items-center gap-2">
                <span>💬</span> <strong>WhatsApp:</strong> <a href="https://wa.me/8801980126826" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+8801980126826</a>
              </p>
              <p className="flex items-center gap-2">
                <span>🌐</span> <strong>Facebook:</strong> <a href="https://www.facebook.com/share/19GMChfbpV/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">StockMetaPro Page</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-white tracking-tight block mb-2">StockMeta<span className="text-green-500">Pro</span></span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=stockmetapro@gmail.com&su=Support%20Request&body=Hello%20StockMetaPro%20Support," target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">stockmetapro@gmail.com</a>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors text-white font-bold">About Us</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
          <p>© 2026 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

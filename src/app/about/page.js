import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h2v18H3V3zm4 10h2v8H7v-8zm4-5h2v13h-2V8zm4 7h2v6h-2v-6zm4-9h2v15h-2V6z" />
            </svg>
            <Link href="/">
              <span className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer">StockMeta<span className="text-green-600">Pro</span></span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-green-600 transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-green-600 transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-[#0c2e60] mb-8 text-center">About Us</h1>
        
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-lg leading-relaxed text-gray-700 space-y-6">
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
            <h3 className="text-2xl font-bold text-[#1c3f6e] mt-8 mb-4">Our focus is on:</h3>
            <ul className="list-none space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Effortless metadata management that saves time.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                SEO-friendly optimization to increase visibility.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Clean design and user-friendly workflows.
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Scalable solutions for both individuals and enterprises.
              </li>
            </ul>
          </div>
          
          <p className="mt-8 font-medium">
            We believe in transparency, reliability, and innovation. That’s why users choose StockMetaPro to streamline their workflow and unlock new opportunities in the digital marketplace.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400 text-sm mt-auto">
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
    </div>
  );
}

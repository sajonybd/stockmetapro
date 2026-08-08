import Link from 'next/link';

export default function PrivacyPolicy() {
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
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">Privacy Policy</h1>
          <p className="text-sm font-semibold text-purple-400">Your Data Protection & Privacy Commitment</p>
        </div>
        
        <div className="bg-[#0d091e] p-8 md:p-10 rounded-3xl border border-purple-950/40 text-gray-300 space-y-8 shadow-xl leading-relaxed text-sm md:text-base">
          
          <p className="text-purple-200 font-medium text-base">
            At Stock Meta Pro, we respect user privacy, protect your creative work, and take reasonable steps to guarantee that your content ideas are 100% safe.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">1. Information We Collect</h2>
            <p>We collect minimal information necessary to deliver our metadata generation and license verification services:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-purple-200">
              <li><strong>Account Details:</strong> Name, Email Address, Phone Number provided during subscription registration.</li>
              <li><strong>License Credentials:</strong> Unique API keys, credits balance, and subscription activation dates.</li>
              <li><strong>Hardware Identification:</strong> Non-personal PC Hardware IDs (HWID) used strictly to prevent unauthorized multi-device license abuse.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">2. Ownership of Uploaded Files</h2>
            <p>Your uploaded files and information belong entirely to you.</p>
            <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-xl text-center font-bold text-purple-300 my-2">
              &quot;We take reasonable steps to protect your data and guarantee that your content ideas are 100% safe.&quot;
            </div>
            <p className="text-purple-200">Stock Meta Pro does not claim ownership or rights to your images, vectors, videos, or designs. Files are processed solely for metadata extraction and tagging.</p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300">
              <li>To issue license keys and deliver subscription services.</li>
              <li>To send essential transactional notifications, activation keys, and receipt details via email.</li>
              <li>To provide technical support and verify license key integrity.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">4. Third-Party Marketplace Disclaimer</h2>
            <p>
              Stock Meta Pro is an independent service. We do not share, sell, or rent your personal information to third parties. We are not officially connected with Adobe Stock, Shutterstock, Freepik, Vecteezy, or Getty Images.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">5. Contact Us</h2>
            <p>If you have any questions regarding this Privacy Policy, please contact our privacy team at <a href="mailto:stockmetapro@gmail.com" className="text-blue-400 hover:underline">stockmetapro@gmail.com</a>.</p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400 text-sm mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-white tracking-tight block mb-2">StockMeta<span className="text-green-500">Pro</span></span>
            <a href="mailto:stockmetapro@gmail.com" className="hover:text-white transition-colors block font-medium">stockmetapro@gmail.com</a>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-white transition-colors text-white font-bold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
          <p>© 2026 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

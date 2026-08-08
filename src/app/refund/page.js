import Link from 'next/link';

export default function RefundPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">Refund Policy</h1>
          <p className="text-sm font-semibold text-purple-400">Fair & Transparent Subscription Refund Terms</p>
        </div>
        
        <div className="bg-[#0d091e] p-8 md:p-10 rounded-3xl border border-purple-950/40 text-gray-300 space-y-8 shadow-xl leading-relaxed text-sm md:text-base">
          
          <p className="text-purple-200 font-medium text-base">
            We want every user to have a fair and transparent experience with Stock Meta Pro. Please read our refund policy carefully before purchasing a subscription.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">1. Customer Requested Refund</h2>
            <p>If you decide to cancel your subscription for personal reasons after purchasing it, you may request a refund.</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-purple-200">
              <li>A <strong>25% processing and service fee</strong> will be deducted from your subscription payment.</li>
              <li>The remaining <strong>75%</strong> will be refunded to your original payment method, subject to approval.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">2. Refund Due to Our Responsibility</h2>
            <p>If a refund is required because of an issue caused by Stock Meta Pro, such as a verified technical or billing problem on our side:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-emerald-300">
              <li>You will receive a <strong>100% refund</strong> of your subscription payment, or</li>
              <li>A <strong>100% cashback</strong> (if both parties agree to this option).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">3. Credit Usage Policy</h2>
            <p>Each subscription includes a specific number of credits.</p>
            <div className="bg-amber-950/30 border border-amber-900/40 p-4 rounded-xl space-y-2 text-amber-200 text-xs md:text-sm">
              <p>Once even a single allocated credit has been used, the subscription is considered partially consumed.</p>
              <p className="font-bold text-amber-400">
                No refund will be available after any credit has been used, regardless of the reason for cancellation.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">4. Refund Eligibility</h2>
            <p className="font-semibold text-purple-200">To be eligible for a refund:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>The refund request must comply with this Refund Policy.</li>
              <li>No subscription credits must have been used (unless the refund is due to an issue caused by Stock Meta Pro).</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">5. Contact Support</h2>
            <p>
              If you have any questions, concerns, or believe your case requires special review, please contact our Support Team.
            </p>
            <p className="text-purple-200">We will review your request fairly and do our best to provide an appropriate solution.</p>

            <div className="bg-[#150f2f] border border-purple-900/40 p-5 rounded-2xl space-y-2 mt-4 text-xs md:text-sm">
              <p className="flex items-center gap-2">
                <span>📧</span> <strong>Email Support:</strong> <a href="mailto:stockmetapro@gmail.com" className="text-blue-400 hover:underline">stockmetapro@gmail.com</a>
              </p>
              <p className="flex items-center gap-2">
                <span>💬</span> <strong>WhatsApp Support:</strong> <a href="https://wa.me/8801980126826" target="_blank" rel="noreferrer" className="text-green-400 hover:underline">+8801980126826</a>
              </p>
            </div>
          </section>

          <div className="border-t border-purple-900/30 pt-6 text-center text-xs text-purple-300/80 italic">
            At Stock Meta Pro, our goal is to provide a simple, reliable, and helpful tool for creators. We respect user privacy, protect your creative work, and continuously improve our service to provide a better experience.
          </div>

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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/refund" className="hover:text-white transition-colors text-white font-bold">Refund Policy</Link>
          </div>
          <p>© 2026 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

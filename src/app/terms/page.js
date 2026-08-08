import Link from 'next/link';

export default function TermsAndConditions() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">Terms & Conditions</h1>
          <p className="text-sm font-semibold text-purple-400">Last Updated: August 2026</p>
        </div>
        
        <div className="bg-[#0d091e] p-8 md:p-10 rounded-3xl border border-purple-950/40 text-gray-300 space-y-8 shadow-xl leading-relaxed text-sm md:text-base">
          
          <p className="text-purple-200 font-medium text-base">
            Welcome to Stock Meta Pro. By using our website, software, and services, you agree to follow these Terms & Conditions. Please read them carefully before using our service.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">1. About Our Service</h2>
            <p>
              Stock Meta Pro is a digital tool that helps content creators, designers, photographers, and microstock contributors generate metadata such as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-200 pl-2">
              <li>Titles</li>
              <li>Keywords</li>
              <li>Descriptions</li>
              <li>Tags</li>
              <li>Other file-related information</li>
            </ul>
            <p>Our goal is to help users save time and improve their workflow when preparing content for stock marketplaces.</p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">2. User Account</h2>
            <p>To use some features of our service, you may need to create an account.</p>
            <p className="font-semibold text-purple-200">You agree that:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>You will provide accurate information during registration.</li>
              <li>You are responsible for keeping your account information secure.</li>
              <li>You should not share your account’s personal info with others.</li>
              <li>You are responsible for all activities performed through your account.</li>
            </ul>
            <p className="text-amber-300 text-xs bg-amber-950/30 border border-amber-900/40 p-3 rounded-xl">
              If we find suspicious activity, misuse, or security risks, we may temporarily restrict or terminate your account License.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">3. Acceptable Use Policy</h2>
            <p>You agree to use Stock Meta Pro only for legal purposes.</p>
            <p className="font-semibold text-purple-200">You must not:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Use our service for illegal activities.</li>
              <li>Upload files that violate copyright laws.</li>
              <li>Use our service to create misleading, harmful, or fraudulent content.</li>
              <li>Attempt to damage, hack, or misuse our software.</li>
              <li>Try to access other users&apos; accounts or private information.</li>
            </ul>
            <p className="text-red-300 text-xs">Any misuse of our service may result in account suspension / temporary termination.</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">4. User Uploaded Files & Data Privacy</h2>
            <p>Your uploaded files and information belong to you.</p>
            <p className="font-semibold text-purple-200">Stock Meta Pro does not claim ownership of your:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-purple-200">
              <li>Images</li>
              <li>Videos</li>
              <li>Vectors</li>
              <li>Designs</li>
              <li>Creative assets</li>
            </ul>
            <p>We only process your files to provide our service.</p>
            <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-xl text-center font-bold text-purple-300">
              &quot;We take reasonable steps to protect your data and guarantee that your content ideas are 100% safe.&quot;
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">5. Stock Marketplace Disclaimer</h2>
            <p>Stock Meta Pro is an independent software service.</p>
            <p className="font-semibold text-purple-200">We are not officially connected with or responsible for any third-party marketplace, including:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-purple-200">
              <li>Adobe Stock</li>
              <li>Shutterstock</li>
              <li>Freepik</li>
              <li>Vecteezy</li>
              <li>Getty Images</li>
              <li>Dreamstime</li>
              <li>Other stock platforms</li>
            </ul>
            <p>Each marketplace has its own rules, policies, and approval systems. Users are responsible for following marketplace guidelines.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">6. Subscription & Payment</h2>
            <p>All features of Stock Meta Pro may require paid plans.</p>
            <p className="font-semibold text-purple-200">By purchasing a plan:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>You agree to pay the displayed price.</li>
              <li>Prices may change in the future.</li>
              <li>All features will be available according to your selected plan.</li>
              <li>All payments must be completed through approved payment methods.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">7. Service Availability</h2>
            <p>We work hard to keep Stock Meta Pro available and reliable.</p>
            <p className="font-semibold text-purple-200">However, we cannot guarantee that the service will always be:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Available without interruption.</li>
              <li>Free from errors.</li>
              <li>Completely secure from all possible risks.</li>
            </ul>
            <p className="font-semibold text-purple-200">Temporary downtime may happen because of:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-400">
              <li>Maintenance</li>
              <li>Updates</li>
              <li>Technical problems</li>
              <li>Third-party service issues</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">8. Account Suspension or Termination</h2>
            <p className="font-semibold text-purple-200">We may suspend or terminate accounts if users:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Violate these Terms & Conditions.</li>
              <li>Abuse our service.</li>
              <li>Perform fraudulent activities.</li>
              <li>Create security risks.</li>
            </ul>
            <p>Users may stop using our service at any time.</p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">9. Limitation of Responsibility</h2>
            <p className="font-semibold text-purple-200">Stock Meta Pro provides tools to improve productivity, but we do not guarantee:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-purple-200">
              <li>More sales</li>
              <li>Higher ranking</li>
              <li>Marketplace approval</li>
              <li>Specific financial results</li>
            </ul>
            <p>
              Your success depends on many factors, including content quality, marketplace rules, competition, and your own decisions. Our only option is to write highly accurate, detailed, and attractive descriptions (tags/titles) for your assets so they sell easily.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-purple-900/30 pb-2">10. Changes to These Terms</h2>
            <p>We may update these Terms & Conditions when needed.</p>
            <p className="font-semibold text-purple-200">If important changes are made:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>We may notify users through our website or email.</li>
              <li>Continued use of our service means you accept the updated terms.</li>
            </ul>
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors text-white font-bold">Terms & Conditions</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
          <p>© 2026 StockMetaPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

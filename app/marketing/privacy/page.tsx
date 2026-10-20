// app/marketing/privacy/page.tsx
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-950">
      <Header />

      <main className="flex-1 px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Ambient background accents */}
        <div className="absolute inset-0 bg-light-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-sky-200/40 via-cyan-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto bg-white border border-sky-100 rounded-3xl p-8 md:p-14 shadow-sm relative z-10">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-semibold mb-8 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-slate-500 mb-10">
            Last Updated: September 19, 2026
          </p>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600">

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                KABO (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the website and digital customer loyalty platform available at kabo.my (the &ldquo;Service&rdquo;). This Privacy Policy outlines how we collect, use, store, disclose, and safeguard your personal data in accordance with the Malaysian Personal Data Protection Act 2010 (PDPA). By using our Service, registering an account, or subscribing to our platform, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
              <p className="mb-3">
                We collect information that identifies, relates to, or describes you or your business (&ldquo;Personal Data&rdquo;). The types of information we collect include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong className="text-slate-800">Account Registration Data:</strong> Store name, account owner&apos;s full legal name, business address, email address, and phone number when registering a merchant profile.</li>
                <li><strong className="text-slate-800">Merchant Customer Data:</strong> Customer phone numbers and basic program activity details (e.g., stamp logs, reward redemptions, and private feedback submissions) provided when merchants process rewards via the POS counter interface.</li>
                <li><strong className="text-slate-800">Billing &amp; Payment Information:</strong> Payment processing status, subscription histories, mandate identifiers, and billing schedules. Sensitive card numbers or bank credentials are processed directly by our secure payment partner (Curlec / Razorpay) and are never stored on our servers.</li>
                <li><strong className="text-slate-800">Technical &amp; Usage Data:</strong> Internet Protocol (IP) addresses, browser types, device categories, operating systems, and page interaction logs recorded automatically when visiting our platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We utilize collected Personal Data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>To provision, maintain, and optimize your KABO merchant account and digital counter tools.</li>
                <li>To process subscription billing transactions, mandating auto-debit payments via Curlec/Razorpay.</li>
                <li>To route customer feedback and manage automated review systems configured by store owners.</li>
                <li>To communicate service updates, account notices, system warnings, and technical support responses.</li>
                <li>To detect, prevent, and address security breaches, fraudulent activity, or technical malfunctions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Disclosure of Personal Data</h2>
              <p className="mb-3">
                We strictly do not sell, rent, or trade your Personal Data to third parties. We may disclose your data only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong className="text-slate-800">Third-Party Service Providers:</strong> Trusted third-party vendors who provide infrastructure, authentication, payment processing, or hosting services (such as Supabase, Vercel, and Curlec/Razorpay) solely to enable platform functionalities.</li>
                <li><strong className="text-slate-800">Legal Compliance:</strong> When required to comply with applicable Malaysian laws, court orders, government regulations, or requests from law enforcement authorities.</li>
                <li><strong className="text-slate-800">Business Transfers:</strong> In connection with or during negotiations for any merger, acquisition, sale of assets, or reorganization of our business entity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Payment Security &amp; Data Storage</h2>
              <p>
                Your data is encrypted in transit using SSL/TLS protocols and stored securely on cloud database infrastructure governed by modern access control policies. Payment transactions are securely executed through Curlec (a Razorpay entity), adhering to PCI-DSS Level 1 compliance standards. We do not directly capture, process, or store sensitive banking credentials or credit card numbers on KABO infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Retention &amp; Your Rights</h2>
              <p className="mb-3">
                We retain Personal Data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Under the PDPA, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Request access to your Personal Data stored in our database.</li>
                <li>Request correction or updating of any inaccurate or outdated Personal Data.</li>
                <li>Withdraw your consent or request account deletion, subject to legal or contractual obligations regarding subscription history.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies and Tracking Technologies</h2>
              <p>
                We use essential session cookies and local storage items to maintain authenticated user logins, securely tokenise requests, and preserve UI preferences. You can configure your browser to decline non-essential cookies; however, doing so may impact platform navigation and features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Changes to This Privacy Policy</h2>
              <p>
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Continued use of the platform after updates take effect constitutes your acknowledgement and acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or how your personal data is handled under the PDPA, please contact our Data Protection Office at:
              </p>
              <div className="mt-4 p-5 bg-sky-50/70 border border-sky-100 rounded-2xl text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">KABO Support Team</p>
                <p>Email: <a href="mailto:support@kabo.my" className="text-sky-600 hover:underline">support@kabo.my</a></p>
                <p>Kuala Lumpur, Malaysia</p>
              </div>
            </section>

          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-semibold mt-8 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

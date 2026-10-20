// app/marketing/terms/page.tsx
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowLeft } from 'lucide-react'

export default function TermsAndConditionsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-sm font-medium text-slate-500 mb-10">
            Last Updated: September 19, 2026
          </p>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600">

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing, registering an account, or using the digital loyalty platform provided by KABO (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) at kabo.my (the &ldquo;Service&rdquo;), you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, you must immediately discontinue use of the Service. These terms apply to all merchants, business owners, and authorized users of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
              <p>
                KABO provides a cloud-based point-of-sale (POS) counter and digital loyalty management system. The Service allows registered businesses to issue digital stamps, manage customer rewards, collect feedback, and route customer reviews. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Registration &amp; Security</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>You must provide accurate, current, and complete business information during registration.</li>
                <li>You are solely responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
                <li>You must immediately notify us of any unauthorized use of your account or security breaches.</li>
                <li>Accounts are strictly for the registered business entity and cannot be transferred or sold to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Billing, Payments, and Subscriptions</h2>
              <p className="mb-3">
                KABO operates on a subscription-based model. By subscribing to a paid plan (e.g., the Pro Plan), you agree to our billing terms:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong className="text-slate-800">Payment Processor:</strong> All payments, including recurring FPX Direct Debit and credit card mandates, are processed securely through our authorized payment gateway, Curlec (Razorpay). KABO does not store your banking credentials.</li>
                <li><strong className="text-slate-800">Auto-Renewal:</strong> Subscriptions automatically renew on a monthly basis unless canceled prior to the next billing cycle.</li>
                <li><strong className="text-slate-800">Failed Payments:</strong> If an automatic deduction fails, your account status will be downgraded or suspended until payment is successfully authorized.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cancellation and Refund Policy</h2>
              <p>
                You may cancel your KABO subscription at any time through your dashboard settings. Cancellation will prevent future billing, and you will retain access to Pro features until the end of your current paid billing cycle. Please refer to our separate Refund Policy page for specific eligibility regarding prorated returns or disputed charges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Acceptable Use and Prohibited Conduct</h2>
              <p className="mb-3">When using KABO, you agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Use the Service for any unlawful purposes or to promote illegal activities.</li>
                <li>Spam, harass, or abuse your customers through the platform&apos;s messaging or feedback channels.</li>
                <li>Attempt to bypass our security measures, probe system vulnerabilities, or reverse-engineer the platform&apos;s infrastructure.</li>
                <li>Upload malicious code, viruses, or use automated scripts (bots) to manipulate stamp distributions or analytics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Intellectual Property</h2>
              <p>
                All software, design, text, graphics, logos, and infrastructure associated with the Service are the exclusive property of KABO. You are granted a limited, non-exclusive, non-transferable license to use the platform for your internal business operations. You may not duplicate, copy, or reuse any portion of our visual design or code without explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, KABO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business interruption, arising out of your use or inability to use the Service. The Service is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without any warranties, express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of Malaysia. Any disputes arising from these terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts located in Kuala Lumpur, Malaysia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Information</h2>
              <p>
                For questions regarding these Terms &amp; Conditions or to report violations, please contact us at:
              </p>
              <div className="mt-4 p-5 bg-sky-50/70 border border-sky-100 rounded-2xl text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">KABO Legal &amp; Support</p>
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

// app/terms/page.tsx
import Link from 'next/link'

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#100e0b] text-gray-300 font-sans px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto bg-black/60 border border-gray-900 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-8 transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last Updated: September 19, 2026
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing, registering an account, or using the digital loyalty platform provided by KABO ("we," "our," or "us") at kabo.my (the "Service"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you must immediately discontinue use of the Service. These terms apply to all merchants, business owners, and authorized users of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              KABO provides a cloud-based point-of-sale (POS) counter and digital loyalty management system. The Service allows registered businesses to issue digital stamps, manage customer rewards, collect feedback, and route customer reviews. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Registration & Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>You must provide accurate, current, and complete business information during registration.</li>
              <li>You are solely responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
              <li>You must immediately notify us of any unauthorized use of your account or security breaches.</li>
              <li>Accounts are strictly for the registered business entity and cannot be transferred or sold to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Billing, Payments, and Subscriptions</h2>
            <p className="mb-3">
              KABO operates on a subscription-based model. By subscribing to a paid plan (e.g., the Pro Plan), you agree to our billing terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Payment Processor:</strong> All payments, including recurring FPX Direct Debit and credit card mandates, are processed securely through our authorized payment gateway, Curlec (Razorpay). KABO does not store your banking credentials.</li>
              <li><strong className="text-gray-200">Auto-Renewal:</strong> Subscriptions automatically renew on a monthly basis unless canceled prior to the next billing cycle.</li>
              <li><strong className="text-gray-200">Failed Payments:</strong> If an automatic deduction fails, your account status will be downgraded or suspended until payment is successfully authorized.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Cancellation and Refund Policy</h2>
            <p>
              You may cancel your KABO subscription at any time through your dashboard settings. Cancellation will prevent future billing, and you will retain access to Pro features until the end of your current paid billing cycle. Please refer to our separate Refund Policy page for specific eligibility regarding prorated returns or disputed charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Acceptable Use and Prohibited Conduct</h2>
            <p className="mb-3">When using KABO, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Use the Service for any unlawful purposes or to promote illegal activities.</li>
              <li>Spam, harass, or abuse your customers through the platform's messaging or feedback channels.</li>
              <li>Attempt to bypass our security measures, probe system vulnerabilities, or reverse-engineer the platform's infrastructure.</li>
              <li>Upload malicious code, viruses, or use automated scripts (bots) to manipulate stamp distributions or analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>
              All software, design, text, graphics, logos, and infrastructure associated with the Service are the exclusive property of KABO. You are granted a limited, non-exclusive, non-transferable license to use the platform for your internal business operations. You may not duplicate, copy, or reuse any portion of our visual design or code without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, KABO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business interruption, arising out of your use or inability to use the Service. The Service is provided on an "as-is" and "as-available" basis without any warranties, express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of Malaysia. Any disputes arising from these terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts located in Kuala Lumpur, Malaysia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact Information</h2>
            <p>
              For questions regarding these Terms & Conditions or to report violations, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-950 border border-gray-900 rounded-xl text-gray-400 space-y-1">
              <p className="font-semibold text-white">KABO Legal & Support</p>
              <p>Email: support@kabo.my</p>
              <p>Kuala Lumpur, Malaysia</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
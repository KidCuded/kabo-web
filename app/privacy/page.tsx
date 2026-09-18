// app/privacy/page.tsx
import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last Updated: September 19, 2026
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              KABO ("we," "our," or "us") operates the website and digital customer loyalty platform available at kabo.my (the "Service"). This Privacy Policy outlines how we collect, use, store, disclose, and safeguard your personal data in accordance with the Malaysian Personal Data Protection Act 2010 (PDPA). By using our Service, registering an account, or subscribing to our platform, you consent to the data practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">
              We collect information that identifies, relates to, or describes you or your business ("Personal Data"). The types of information we collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Account Registration Data:</strong> Store name, account owner's full legal name, business address, email address, and phone number when registering a merchant profile.</li>
              <li><strong className="text-gray-200">Merchant Customer Data:</strong> Customer phone numbers and basic program activity details (e.g., stamp logs, reward redemptions, and private feedback submissions) provided when merchants process rewards via the POS counter interface.</li>
              <li><strong className="text-gray-200">Billing & Payment Information:</strong> Payment processing status, subscription histories, mandate identifiers, and billing schedules. Note that sensitive card numbers or bank account passwords are processed directly by our secure payment partner (Curlec / Razorpay) and are never stored on our servers.</li>
              <li><strong className="text-gray-200">Technical & Usage Data:</strong> Internet Protocol (IP) addresses, browser types, device categories, operating systems, and page interaction logs recorded automatically when visiting our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We utilize collected Personal Data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>To provision, maintain, and optimize your KABO merchant account and digital counter tools.</li>
              <li>To process subscription billing transactions, mandating auto-debit payments via Curlec/Razorpay.</li>
              <li>To route customer feedback and manage automated review systems configured by store owners.</li>
              <li>To communicate service updates, account notices, system warnings, and technical support responses.</li>
              <li>To detect, prevent, and address security breaches, fraudulent activity, or technical malfunctions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Disclosure of Personal Data</h2>
            <p className="mb-3">
              We strictly do not sell, rent, or trade your Personal Data to third parties. We may disclose your data only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Third-Party Service Providers:</strong> Trusted third-party vendors who provide infrastructure, authentication, payment processing, or hosting services (such as Supabase, Vercel, and Curlec/Razorpay) solely to enable platform functionalities.</li>
              <li><strong className="text-gray-200">Legal Compliance:</strong> When required to comply with applicable Malaysian laws, court orders, government regulations, or requests from law enforcement authorities.</li>
              <li><strong className="text-gray-200">Business Transfers:</strong> In connection with or during negotiations for any merger, acquisition, sale of assets, or reorganization of our business entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Payment Security & Data Storage</h2>
            <p>
              Your data is encrypted in transit using SSL/TLS protocols and stored securely on cloud database infrastructure governed by modern access control policies. Payment transactions are securely executed through Curlec (a Razorpay entity), adhering to PCI-DSS Level 1 compliance standards. We do not directly capture, process, or store sensitive banking credentials or credit card numbers on KABO infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention & Your Rights</h2>
            <p className="mb-3">
              We retain Personal Data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Under the PDPA, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Request access to your Personal Data stored in our database.</li>
              <li>Request correction or updating of any inaccurate or outdated Personal Data.</li>
              <li>Withdraw your consent or request account deletion, subject to legal or contractual obligations regarding subscription history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies and Tracking Technologies</h2>
            <p>
              We use essential session cookies and local storage items to maintain authenticated user logins, securely tokenise requests, and preserve UI preferences. You can configure your browser to decline non-essential cookies; however, doing so may impact platform navigation and features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated "Last Updated" date. Continued use of the platform after updates take effect constitutes your acknowledgement and acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your personal data is handled under the PDPA, please contact our Data Protection Office at:
            </p>
            <div className="mt-4 p-4 bg-gray-950 border border-gray-900 rounded-xl text-gray-400 space-y-1">
              <p className="font-semibold text-white">KABO Support Team</p>
              <p>Email: support@kabo.my</p>
              <p>Kuala Lumpur, Malaysia</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
// app/refund-policy/page.tsx
import Link from 'next/link'

export default function RefundPolicyPage() {
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
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last Updated: September 19, 2026
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. General Overview</h2>
            <p>
              At KABO, we offer a 14-day free trial so that you can fully evaluate our digital loyalty and POS counter features before committing to a paid subscription. Because you have the opportunity to test the platform risk-free, our refund policy is strictly limited to specific circumstances outlined below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Subscription Cancellations</h2>
            <p className="mb-3">
              You may cancel your KABO monthly subscription at any time directly from your dashboard settings.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>When you cancel, your subscription will remain active until the end of your current paid billing cycle.</li>
              <li>Once the billing cycle concludes, your account will be downgraded, and future automated deductions via Curlec (Razorpay) will be halted immediately.</li>
              <li>We do not offer prorated refunds for mid-cycle cancellations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Refund Eligibility</h2>
            <p className="mb-3">Refunds are only issued under the following exceptional conditions:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">First-Time Billing Exception:</strong> If you forgot to cancel your subscription before the end of your 14-day free trial, you may request a full refund within <strong>7 days</strong> of the initial charge.</li>
              <li><strong className="text-gray-200">Technical Failures:</strong> If a documented system outage or critical bug prevents you from using core features (e.g., stamp issuance or QR scanning) for an extended period, and our support team cannot resolve the issue.</li>
              <li><strong className="text-gray-200">Duplicate Billing:</strong> If a system error results in you being charged multiple times for the same billing cycle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Non-Refundable Scenarios</h2>
            <p className="mb-3">We will not issue refunds for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Lack of usage or failure to actively use the platform after a successful billing cycle.</li>
              <li>Requests made outside the 7-day grace period following the initial subscription charge.</li>
              <li>Subsequent monthly renewals (after the first paid month), as you are responsible for managing your active subscriptions.</li>
              <li>Accounts that have been suspended or terminated due to violations of our Terms & Conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. How to Request a Refund</h2>
            <p>
              To request a refund, please email our support team at <strong>support@kabo.my</strong> using the email address associated with your KABO account. Include your store name, the charge date, and a brief explanation of your request.
            </p>
            <p className="mt-3">
              Approved refunds are processed back to the original payment method (FPX or Credit/Debit Card) via Curlec. Please allow 5 to 10 business days for the funds to appear in your bank account, depending on your financial institution's processing times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact Information</h2>
            <div className="mt-4 p-4 bg-gray-950 border border-gray-900 rounded-xl text-gray-400 space-y-1">
              <p className="font-semibold text-white">KABO Billing & Support</p>
              <p>Email: support@kabo.my</p>
              <p>Kuala Lumpur, Malaysia</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
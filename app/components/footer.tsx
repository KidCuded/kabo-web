// app/components/footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-900/60 py-16 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-black text-lg leading-none">K</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">KABO</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The retention and reputation engine for modern brick-and-mortar stores.
            </p>
          </div>

          {/* Column 2: Legal (Required for Curlec Compliance) */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              Need help? Reach out to our support team.
            </p>
            <a href="mailto:support@kabo.my" className="text-sm text-blue-400 hover:underline">
              support@kabo.my
            </a>
          </div>

        </div>

        {/* Bottom Divider & Copyright */}
        <div className="border-t border-gray-900/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} KABO. All rights reserved.</p>
          {/* <p>Powered by Curlec Secure Direct Debit</p> */}
        </div>
      </div>
    </footer>
  )
}
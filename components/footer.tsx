// app/components/footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-sky-100 py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20">
                <span className="text-white font-black text-lg leading-none">K</span>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">KABO</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              The retention and reputation engine for modern brick-and-mortar stores.
            </p>
          </div>

          {/* Column 2: Legal*/}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-sky-600 transition-colors cursor-pointer">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Contact Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">Support</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Need help? Reach out to our dedicated support team.
            </p>
            <a href="mailto:support@kabo.my" className="inline-flex items-center text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
              support@kabo.my
            </a>
          </div>

        </div>

        {/* Bottom Divider & Copyright */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} KABO. All rights reserved.</p>
          <p className="text-slate-400">Crafted for modern merchants in Malaysia &amp; beyond.</p>
        </div>
      </div>
    </footer>
  )
}
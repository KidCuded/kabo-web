// app/page.tsx
import Link from 'next/link'
import Header from '../components/header'
import Footer from '../components/footer'
import DarkVeil from '../components/DarkVeil'
import {
  Zap,
  Star,
  BarChart3,
  QrCode,
  Check,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-950">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="min-h-screen relative overflow-hidden w-full border-b border-sky-100/80 bg-white">
          {/* Ambient Elements: Soft airy sky-blue radial blurs and light grid */}
          <div className="absolute inset-0 z-0">
            <DarkVeil
              color="#3498fd"
              speed={1.5}
              scale={2}
              variation={11}
              brightness={1}
              grain={0.03}
              quality={0.5}
              fade={0}
              opacity={0.65}
              mouseInteraction={true}
              mouseStrength={0.2}
              intro
              lightMode
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-36 text-center relative z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Next-Gen Retention &amp; Google Reviews</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 max-w-5xl mx-auto leading-[1.08]">
              Drive retention. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600">
                Skyrocket your reputation.
              </span>
            </h1>

            {/* Body Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-750 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
              A lightning-fast digital platform that keeps customers coming back for rewards, catches negative feedback privately, and automatically drives your best customers to leave 5-star Google Reviews.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Upgrade Your Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center text-base font-bold bg-white text-slate-700 hover:text-slate-900 px-8 py-4 rounded-xl border border-sky-200/90 hover:border-sky-300 transition-all duration-200 shadow-xs hover:shadow-md hover:bg-slate-50/80 cursor-pointer"
              >
                View Pricing
              </Link>
            </div>

            {/* Quick Proof Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="inline-flex items-center gap-2 bg-slate-50/90 border border-slate-200/70 px-3.5 py-1.5 rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>14-day risk-free trial</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50/90 border border-slate-200/70 px-3.5 py-1.5 rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>No customer app download</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50/90 border border-slate-200/70 px-3.5 py-1.5 rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Zero hardware required</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Flow */}
        <div className="py-20 bg-white border-b border-sky-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Effortless Workflow</h2>
              <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                How KABO transforms counter checkout
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#F8FAFC] border border-sky-100 rounded-3xl p-8 relative group hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Scan Counter QR</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Customers scan your custom table or counter QR stand with their smartphone camera. No app store installation required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F8FAFC] border border-sky-100 rounded-3xl p-8 relative group hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">1-Click Stamp Issuance</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Cashiers look up customers by phone number or scan customer QR in seconds to add loyalty stamps without holding up lines.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#F8FAFC] border border-sky-100 rounded-3xl p-8 relative group hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">5-Star Google Reviews</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Delighted customers are automatically guided to post public Google reviews, while any constructive feedback stays private.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="bg-[#F8FAFC] py-24 relative overflow-hidden">
          {/* Subtle ambient blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/25 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
                Platform Capabilities
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Everything physical stores need to retain customers
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Built specifically for cafés, restaurants, salons, and retail shops looking to replace paper loyalty cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

              {/* Feature 1: Checkout */}
              <div className="group bg-white border border-sky-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-sky-100/60 hover:border-sky-300 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Lightning Fast Checkout</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Search by phone number and add stamps in one click. Never slow down your checkout line waiting for customers to find an app or fiddle with downloads.
                </p>
              </div>

              {/* Feature 2: Reputation Management */}
              <div className="group bg-white border border-sky-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-sky-100/60 hover:border-sky-300 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                  <Star className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Reputation Builder</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Intercept negative feedback privately to resolve issues promptly, while automatically funneling your happiest customers directly to Google Reviews.
                </p>
              </div>

              {/* Feature 3: Analytics */}
              <div className="group bg-white border border-sky-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-sky-100/60 hover:border-sky-300 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Actionable Analytics</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Know exactly how many stamps you've issued, your daily redemption rates, and how many new customers are returning as loyal regulars.
                </p>
              </div>

              {/* Feature 4: No App */}
              <div className="group bg-white border border-sky-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-sky-100/60 hover:border-sky-300 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Frictionless for Customers</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  No apps to download. Customers simply scan a QR code on your counter or table to instantly view their digital stamp card in their phone's browser.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="bg-white py-24 border-t border-sky-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
                Simple &amp; Honest
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-lg md:text-xl text-slate-600">
                Everything you need to grow your store, for less than the cost of a daily coffee.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

              {/* Free Trial Card */}
              <div className="bg-white border border-sky-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Trial</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-black text-slate-900">RM 0</span>
                    <span className="text-slate-500 font-medium">for 14 days</span>
                  </div>
                  <p className="text-slate-600 mb-8 min-h-[3rem] text-sm leading-relaxed">
                    Test the waters and see how KABO works for your store with zero financial commitment.
                  </p>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Full dashboard access
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Unlimited customer registrations
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Basic loyalty tracking
                    </li>
                  </ul>
                </div>
                <Link
                  href="/auth/register"
                  className="block w-full text-center font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-4 rounded-xl transition-colors cursor-pointer"
                >
                  Start 14-Day Trial
                </Link>
              </div>

              {/* Pro Plan Card */}
              <div className="bg-white border-2 border-sky-400 rounded-3xl p-8 lg:p-10 relative shadow-xl shadow-sky-100/70 hover:shadow-2xl hover:shadow-sky-200/60 hover:border-sky-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md shadow-sky-500/25">
                    Most Popular
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro Plan</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-black text-slate-900">RM 150</span>
                    <span className="text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-slate-600 mb-8 min-h-[3rem] text-sm leading-relaxed">
                    The complete retention and reputation engine for ambitious brick-and-mortar stores.
                  </p>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-slate-900 font-semibold text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      Everything in Free Trial, plus:
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Smart Reputation Management
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Automated Google Review routing
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      Digital QR code scanner support
                    </li>
                  </ul>
                </div>
                <Link
                  href="/auth/register"
                  className="block w-full text-center font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 cursor-pointer"
                >
                  Upgrade to Pro
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="bg-[#F8FAFC] border-t border-sky-100 py-20 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-blue-700 rounded-3xl p-10 md:p-16 text-center text-white relative shadow-2xl shadow-sky-500/20 overflow-hidden">
              {/* Soft decorative background glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                  Ready to upgrade your store?
                </h2>
                <p className="text-lg md:text-xl text-sky-100 mb-8 leading-relaxed font-normal">
                  Join modern Malaysian stores using KABO to bring customers back and gather glowing Google reviews.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 font-bold bg-white text-slate-900 px-9 py-4 rounded-xl hover:bg-slate-50 transition-all transform hover:-translate-y-0.5 shadow-xl cursor-pointer"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4 text-sky-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// app/(marketing)/contact/page.tsx
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Handshake, MessageSquare, Mail, Sparkles, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-950">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background accents */}
        <div className="absolute inset-0 bg-light-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-sky-200/40 via-cyan-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl w-full space-y-12 relative z-10">
          
          {/* Hero Section */}
          <div className="text-center space-y-5 pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Contact Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600">touch.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
              Whether you need technical support, have a question about our platform, or want to explore working together, we're here to help.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            
            {/* General Support */}
            <div className="bg-white border border-sky-100 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">General &amp; Support</h2>
              <p className="text-sm text-slate-600 mb-8 flex-1 leading-relaxed">
                Need help setting up your store, managing loyalty stamp rules or custom branding? Drop us a note anytime.
              </p>
              <a 
                href="mailto:support@kabo.my" 
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-sky-600" />
                <span>support@kabo.my</span>
              </a>
            </div>

            {/* Collaboration */}
            <div className="bg-white border border-sky-100 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 relative z-10 shadow-xs">
                <Handshake className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Collaborations</h2>
              <p className="text-sm text-slate-600 mb-8 flex-1 leading-relaxed relative z-10">
                Interested in integrating with KABO, white-labeling our software, or forming a strategic partnership? Let's talk.
              </p>
              <a 
                href="mailto:support@kabo.my?subject=KABO%20Collaboration%20Inquiry" 
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 relative z-10 cursor-pointer"
              >
                <Handshake className="w-4 h-4" />
                <span>Partner with us</span>
              </a>
            </div>

          </div>

          {/* Location Note */}
          <div className="text-center pt-6">
            <div className="inline-flex items-center gap-2.5 bg-white border border-sky-100 px-4 py-2 rounded-full shadow-xs text-sm text-slate-600 font-medium">
              <span className="text-base">🇲🇾</span>
              <span>Proudly based in Kuala Lumpur, Malaysia</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
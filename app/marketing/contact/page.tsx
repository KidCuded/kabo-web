// app/contact/page.tsx
import Link from 'next/link'
import Header from '@/components/header' // Adjust import path if needed
import Footer from '@/components/footer'
import { Handshake, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header />

      <main className="flex-1 flex flex-col items-center pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
              Contact Us
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Get in touch
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto">
              Whether you need technical support, have a question about our platform, or want to explore working together, we're here to help.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 pt-6">
            
            {/* General Support */}
            <div className="bg-[#0a0c10] border border-gray-800/80 rounded-3xl p-8 flex flex-col items-center text-center hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">General & Support</h2>
              <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed">
                Need help setting up your store, managing your loyalty rules or customization? Drop us a line.
              </p>
              <a 
                href="mailto:akid@kabo.my" 
                className="w-full block bg-[#111318] border border-gray-800 hover:border-gray-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
              >
                support@kabo.my
              </a>
            </div>

            {/* Collaboration */}
            <div className="bg-[#0a0c10] border border-gray-800/80 rounded-3xl p-8 flex flex-col items-center text-center hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <Handshake className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3 relative z-10">Collaborations</h2>
              <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed relative z-10">
                Interested in integrating with KABO, white-labeling our software, or forming a strategic partnership? Let's talk.
              </p>
              <a 
                href="mailto:akid@kabo.my?subject=KABO%20Collaboration%20Inquiry" 
                className="w-full block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10"
              >
                Partner with us
              </a>
            </div>

          </div>

          {/* Location Note */}
          <div className="text-center pt-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#111318] border border-gray-800 mb-4 shadow-sm">
              <span className="text-xl">🇲🇾</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Based in Kuala Lumpur, Malaysia.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
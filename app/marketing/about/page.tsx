// app/marketing/about/page.tsx
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowRight, TrendingUp, ShieldCheck, MapPin, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-950">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background accents */}
        <div className="absolute inset-0 bg-light-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-sky-200/40 via-cyan-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full space-y-14 relative z-10">
          
          {/* Hero Section */}
          <div className="text-center space-y-5 pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Our Mission</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Empowering local <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600">
                business growth.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
              KABO is a modern customer loyalty and reputation management platform designed to help physical stores thrive in an increasingly digital world.
            </p>
          </div>

          {/* Core Values Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-sky-100 rounded-3xl p-8 md:p-9 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Driving Revenue &amp; Retention</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Customer acquisition is expensive, but retention shouldn't be. We built KABO to help businesses turn first-time visitors into regulars. By removing the friction of paper stamp cards and standalone apps, merchants can seamlessly capture customer data, issue rewards, and drive predictable repeat visits.
              </p>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl p-8 md:p-9 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Protecting Your Reputation</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Your online reputation directly impacts your foot traffic. KABO acts as a smart filter—encouraging happy, loyal customers to share their experiences on Google Reviews, while giving businesses a private channel to intercept and resolve negative feedback before it ever reaches the public eye.
              </p>
            </div>

            <div className="md:col-span-2 bg-white border border-sky-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300 cursor-pointer group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 relative z-10">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="relative z-10 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Rooted in Kuala Lumpur</h2>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Proudly developed and based in Kuala Lumpur, Malaysia. We understand the unique challenges facing local F&amp;B, retail, and service businesses in our region. KABO is built to scale with local merchants, providing enterprise-grade loyalty and reputation tools at an accessible tier.
                </p>
              </div>
            </div>

          </div>

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start your free trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
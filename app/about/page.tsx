// app/about/page.tsx
import Link from 'next/link'
import Header from '@/app/components/header' // Adjust import path if needed
import Footer from '@/app/components/footer'
import { ArrowRight, TrendingUp, ShieldCheck, MapPin } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header />

      <main className="flex-1 flex flex-col items-center pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
              Our Mission
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Empowering local <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">business growth.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              KABO is a modern customer loyalty and reputation management platform designed to help physical stores thrive in a digital world.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-[#0a0c10] border border-gray-800/80 rounded-3xl p-8 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Driving Revenue & Retention</h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                Customer acquisition is expensive, but retention shouldn't be. We built KABO to help businesses turn first-time visitors into regulars. By removing the friction of paper stamp cards and standalone apps, merchants can seamlessly capture customer data, issue rewards, and ultimately drive predictable, recurring revenue.
              </p>
            </div>

            <div className="bg-[#0a0c10] border border-gray-800/80 rounded-3xl p-8 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Protecting Your Reputation</h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                Your online reputation directly impacts your foot traffic. KABO acts as a smart filter—encouraging happy, loyal customers to share their experiences on Google Reviews, while giving businesses a private channel to intercept and resolve negative feedback before it ever reaches the public eye.
              </p>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-[#0a0c10] to-black border border-gray-800/80 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Rooted in Kuala Lumpur</h2>
                <p className="text-gray-400 leading-relaxed">
                  Proudly developed and based in Kuala Lumpur, Malaysia. We understand the unique challenges facing local F&B, retail, and service businesses in our region. KABO is built to scale with local merchants, providing enterprise-grade loyalty tools at an accessible tier.
                </p>
              </div>
            </div>

          </div>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              Start your free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
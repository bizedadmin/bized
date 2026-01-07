
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import Process from "@/components/landing/Process";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main>
        <Hero />
        <TrustedBy />
        <Process />
        <Features />

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600 z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-blue-700 opacity-90 z-0" />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold mb-8 backdrop-blur-sm border border-white/20">
              <Sparkles size={16} />
              Ready to transform your business?
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Start your 14-day free trial today.
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 5,000+ businesses using Bized to streamline their operations, increase revenue, and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-2xl flex items-center justify-center gap-2 group">
                Get Started Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

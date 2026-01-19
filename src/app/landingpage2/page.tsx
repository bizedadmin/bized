"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage2() {
    return (
        <div className="min-h-screen w-full bg-[#f0f1f5] text-slate-900 font-sans selection:bg-pink-200">
            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-2">
                    {/* Simple logo placeholder if real one isn't desired, but user asked for "sleek" */}
                    <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600"></div>
                        Bized Labs
                    </div>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                    <Link href="#" className="hover:text-black transition-colors">Experiments</Link>
                    <Link href="#" className="hover:text-black transition-colors">About</Link>
                    <Link href="#" className="hover:text-black transition-colors">Community</Link>
                </div>
                <Link href="/register" className="px-6 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-slate-800 transition-all hover:scale-105">
                    Join Waitlist
                </Link>
            </nav>

            {/* Main Content / Hero */}
            <main className="relative w-full min-h-screen flex items-center justify-center p-4 pt-24 overflow-hidden">

                {/* Background Aura Layers */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    {/* Top Right Aura */}
                    <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-transparent blur-3xl opacity-60 animate-aura" />
                    {/* Bottom Left Aura */}
                    <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-100 via-sky-100 to-transparent blur-3xl opacity-60 animate-aura" style={{ animationDelay: '-5s' }} />
                </div>

                {/* Hero Card Container */}
                <div className="relative w-full max-w-7xl  rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">

                    {/* Left Content */}
                    <div className="flex-1 space-y-8 z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-white/60 text-xs font-semibold tracking-wide uppercase text-slate-500 animate-fade-in shadow-sm backdrop-blur-md">
                            New Experiments
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight animate-fade-in text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600" style={{ animationDelay: '0.1s' }}>
                            Play with the <br />
                            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Future of Work</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            Explore our latest AI-powered tools designed to transform how businesses operate. Simple, sleek, and powerful.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-medium text-lg hover:bg-black transition-all hover:shadow-lg hover:-translate-y-1 block text-center">
                                Try it now
                            </button>
                            <button className="px-8 py-4 rounded-full bg-white text-slate-900 font-medium text-lg border border-slate-200 hover:bg-slate-50 transition-all hover:shadow-md block text-center">
                                Learn more
                            </button>
                        </div>
                    </div>

                    {/* Right Content - 3D Visual */}
                    <div className="flex-1 w-full h-[500px] relative flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        {/* 3D Image */}
                        <div className="relative w-full h-full animate-float">
                            <Image
                                src="/landing2/hero-3d.png"
                                alt="Abstract 3D Shape"
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>

                        {/* Floating Elements / Decor */}
                        <div className="absolute top-10 right-10 w-24 h-24 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl animate-bounce" style={{ animationDuration: '3s' }} />
                        <div className="absolute bottom-20 left-10 w-16 h-16 bg-pink-500/10 backdrop-blur-md rounded-full border border-pink-200/40 shadow-lg animate-pulse" />
                    </div>
                </div>
            </main>

            {/* Feature Section Preview */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group relative h-96 rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${i === 1 ? 'from-pink-100 to-white' : i === 2 ? 'from-purple-100 to-white' : 'from-blue-100 to-white'}`} />
                            <div className="relative p-8 h-full flex flex-col justify-end">
                                <div className="mb-auto p-4 bg-slate-50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-8 h-8 bg-slate-900 rounded-full opacity-20" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-slate-900">Experiment 0{i}</h3>
                                <p className="text-slate-500">Discover new ways to manage your business with advanced AI analytics.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

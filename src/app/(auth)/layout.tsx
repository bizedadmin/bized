import React from 'react'
import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950 p-4 lg:p-8">
            <div className="w-full max-w-[1200px] bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[650px] border border-zinc-200 dark:border-zinc-800">

                {/* Form Side (Left) - Order 1 on mobile (default) */}
                <div className="p-6 lg:p-8 flex flex-col h-full bg-background relative">
                    {/* Logo Section */}
                    <div className="mb-8 lg:mb-0">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <Image
                                src="/logo-light-mode.png"
                                alt="Bized Logo"
                                width={36}
                                height={36}
                                className="h-9 w-auto dark:hidden group-hover:scale-105 transition-transform"
                            />
                            <Image
                                src="/logo-dark-mode.png"
                                alt="Bized Logo"
                                width={36}
                                height={36}
                                className="h-9 w-auto hidden dark:block group-hover:scale-105 transition-transform mix-blend-screen"
                            />
                            <span className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight">BizedApp</span>
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto space-y-6">
                        {children}
                    </div>
                </div>

                {/* Visual Side (Right) - Image */}
                <div className="hidden lg:relative lg:flex h-full w-full bg-zinc-900 items-end justify-start">
                    <Image
                        src="/auth-human.png"
                        alt="Authentication Background"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    {/* Optional Overlay Content */}
                    <div className="relative z-20 mt-auto bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 m-8 lg:m-10">
                        <blockquote className="space-y-2">
                            <p className="text-lg text-white font-medium italic leading-relaxed">
                                &ldquo;Simply all the tools my team and I need. Bized has completely transformed our workflow.&rdquo;
                            </p>
                            <footer className="flex items-center gap-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">KY</div>
                                <div className="text-sm">
                                    <span className="block text-white font-semibold">Karen Yue</span>
                                    <span className="block text-white/70 text-xs">Director of Digital Marketing</span>
                                </div>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    )
}

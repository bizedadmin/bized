"use client"

import { Metadata } from 'next';
import LoginForm from './LoginForm';
import Image from 'next/image';
import SettingsToggle from './_components/SettingsToggle';

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen">
            {/* Settings Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <SettingsToggle />
            </div>

            {/* Background Image Layer */}
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 bg-gray-900">
                <Image
                    src="/assets/admin-bg.png"
                    alt="Admin Background"
                    fill
                    className="object-cover opacity-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent z-10" />
            </div>

            {/* Left Side - Hero/Brand (Hidden on Mobile) */}
            <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex text-white">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo-dark-mode.png"
                        alt="Bized Logo"
                        width={40}
                        height={40}
                        className="h-10 w-auto rounded-sm"
                        priority
                    />
                    <span className="font-bold text-xl tracking-tight text-white">
                        BizedApp
                    </span>
                </div>

                <div className="space-y-6 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight">
                        Orchestrate your business from one central hub.
                    </h1>
                    <p className="text-lg text-gray-300">
                        Secure access to user management, system metrics, and platform configurations.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>&copy; 2024 Bized Inc.</span>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative z-10 flex w-full items-center justify-center bg-white p-8 lg:w-1/2 dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bized Admin</h2>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

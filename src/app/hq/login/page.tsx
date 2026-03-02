"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, TerminalSquare } from "lucide-react";
import { auth as firebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function PlatformLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Authenticate with Firebase using Email/Password
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // 2. Pass the token to NextAuth
            const result = await signIn("credentials", {
                idToken,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error || "Authentication failed.");
            }

            // Automatically redirect to the dashboard
            router.push("/");
            router.refresh();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8">

                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
                        <ShieldAlert className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mt-4">Bized HQ Login</h2>
                    <p className="text-sm text-neutral-400">Restricted access area.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all placeholder:text-neutral-600"
                            placeholder="admin@bized.app"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all placeholder:text-neutral-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Access Platform"}
                    </button>
                </form>

                <div className="pt-8 text-center border-t border-neutral-800/50">
                    <p className="text-xs text-neutral-500">
                        Unauthorized access is strictly prohibited and logged.
                    </p>
                </div>
            </div>
        </div>
    );
}

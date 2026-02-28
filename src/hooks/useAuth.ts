"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    GoogleAuthProvider,
    signInWithRedirect,
    signInWithPopup,
    getRedirectResult,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    User
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/admin/stores";
    const checkCalled = useRef(false);

    // Private helper to complete NextAuth sign-in
    const handleAuthCompletion = async (user: User, idToken: string) => {
        try {
            const res = await signIn("credentials", {
                idToken,
                redirect: false,
                callbackUrl,
            });

            if (res?.error) {
                console.error("useAuth: NextAuth error:", res.error);
                setError("Authentication failed. Please try again.");
                setIsRedirecting(false);
                setIsLoading(false);
            } else {
                router.push(callbackUrl);
            }
        } catch (e) {
            console.error("useAuth: NextAuth Exception:", e);
            setError("An unexpected error occurred.");
            setIsRedirecting(false);
            setIsLoading(false);
        }
    };

    // Check for redirects and existing sessions on mount
    useEffect(() => {
        if (checkCalled.current) return;
        checkCalled.current = true;

        const checkRedirect = async () => {
            const wasRedirecting = sessionStorage.getItem('auth_redirecting');

            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    setIsLoading(true);
                    sessionStorage.removeItem('auth_redirecting');
                    const idToken = await result.user.getIdToken();
                    await handleAuthCompletion(result.user, idToken);
                    return;
                }
            } catch (error) {
                console.error("useAuth: Redirect result error:", error);
                // Don't set error here yet, try fallback
            }

            // Fallback: Check for session if we expected a redirect
            if (wasRedirecting) {
                console.log("useAuth: Fallback - Flag exists but no RedirectResult. Checking onAuthStateChanged...");
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    unsubscribe(); // Run once
                    if (user) {
                        console.log("useAuth: Fallback - User found via onAuthStateChanged:", user.email);
                        sessionStorage.removeItem('auth_redirecting');
                        setIsLoading(true);
                        const idToken = await user.getIdToken();
                        await handleAuthCompletion(user, idToken);
                    } else {
                        console.log("useAuth: Fallback - No user found despite flag.");
                        setIsRedirecting(false);
                        setIsLoading(false);
                    }
                });
            } else {
                console.log("useAuth: No redirect flag. Stopping loader.");
                setIsRedirecting(false);
            }
        };

        checkRedirect();
    }, [callbackUrl, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        console.log("useAuth: Starting Google Sign In with Popup...");
        try {
            const provider = new GoogleAuthProvider();
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, provider);
            console.log("useAuth: Popup success. User:", result.user.email);

            const idToken = await result.user.getIdToken();
            await handleAuthCompletion(result.user, idToken);
        } catch (error: any) {
            console.error("useAuth: Google signin error", error);
            setError(error.message || "Failed to sign in with Google.");
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (email: string, password: string, name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (name) {
                await updateProfile(user, { displayName: name });
            }

            const idToken = await user.getIdToken(true); // Force refresh to get updated profile
            await handleAuthCompletion(user, idToken);
        } catch (error: any) {
            console.error("useAuth: Email signup error", error);
            setError(error.message || "Failed to create account.");
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            await handleAuthCompletion(userCredential.user, idToken);
        } catch (error: any) {
            console.error("useAuth: Email signin error", error);
            setError(error.message || "Invalid email or password.");
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        isRedirecting,
        error,
        handleGoogleSignIn,
        handleEmailSignUp,
        handleEmailSignIn
    };
}

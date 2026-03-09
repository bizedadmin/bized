"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithRedirect,
    signInWithPopup,
    getRedirectResult,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithCustomToken,
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
    const callbackUrl = searchParams.get("callbackUrl") || "/businesses";
    const checkCalled = useRef(false);

    // Private helper to complete NextAuth sign-in
    const handleAuthCompletion = async (user: User, idToken: string, customCallbackUrl?: string) => {
        try {
            const finalCallback = customCallbackUrl || callbackUrl;
            const res = await signIn("credentials", {
                idToken,
                redirect: false,
                callbackUrl: finalCallback,
            });

            if (res?.error) {
                console.error("useAuth: NextAuth error:", res.error);
                setError("Authentication failed. Please try again.");
                setIsRedirecting(false);
                setIsLoading(false);
            } else {
                router.push(finalCallback);
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
            }

            if (wasRedirecting) {
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    unsubscribe();
                    if (user) {
                        sessionStorage.removeItem('auth_redirecting');
                        setIsLoading(true);
                        const idToken = await user.getIdToken();
                        await handleAuthCompletion(user, idToken);
                    } else {
                        setIsRedirecting(false);
                        setIsLoading(false);
                    }
                });
            } else {
                setIsRedirecting(false);
            }
        };

        checkRedirect();
    }, [callbackUrl, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await handleAuthCompletion(result.user, idToken);
        } catch (error: any) {
            console.error("useAuth: Google signin error", error);
            setError(error.message || "Failed to sign in with Google.");
            setIsLoading(false);
        }
    };

    const handleFacebookSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const provider = new FacebookAuthProvider();
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await handleAuthCompletion(result.user, idToken);
        } catch (error: any) {
            console.error("useAuth: Facebook signin error", error);
            setError(error.message || "Failed to sign in with Facebook.");
            setIsLoading(false);
        }
    };

    const handleMetaSignIn = async (token: string, customCallbackUrl?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signInWithCustomToken(auth, token);
            const idToken = await result.user.getIdToken(true);
            await handleAuthCompletion(result.user, idToken, customCallbackUrl);
        } catch (error: any) {
            console.error("useAuth: Meta custom token error", error);
            setError(error.message || "Failed to finalize Meta sign-in.");
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
            const idToken = await user.getIdToken(true);
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
        handleFacebookSignIn,
        handleMetaSignIn,
        handleEmailSignUp,
        handleEmailSignIn
    };
}

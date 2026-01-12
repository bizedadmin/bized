"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { toast } from "sonner"

function LoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            // 1. Login with Firebase (Client Side popup)
            const userCredential = await signInWithPopup(auth, googleProvider)
            const idToken = await userCredential.user.getIdToken()

            // 2. Create NextAuth Session (Server Side verification)
            const res = await signIn("firebase-google", {
                idToken,
                redirect: false,
                callbackUrl: "/businesses/select"
            })

            if (res?.error) {
                toast.error("Failed to create session")
            } else {
                router.push("/businesses/select")
                router.refresh()
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full shadow-lg border-none sm:border-border sm:shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Login to your account
                </CardTitle>
                <CardDescription>
                    Use your Google account to access Bized
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 mt-6">
                <Button
                    variant="outline"
                    type="button"
                    className="w-full h-12 text-base font-medium relative"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <svg className="mr-2 h-5 w-5 text-[#4285F4]" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                        </>
                    )}
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline text-black hover:text-black/80 font-medium">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <LoginForm />
        </Suspense>
    )
}

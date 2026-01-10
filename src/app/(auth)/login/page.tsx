"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccess("Registration successful! You can now login.")
        }
        if (searchParams.get("error") === "CredentialsSignin") {
            setError("Invalid email or password.")
        }
    }, [searchParams])

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (res?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/businesses/select") // Redirect to business selector
                router.refresh()
            }
        } catch {
            setError("An error occurred. Please try again.")
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
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 mt-6">
                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md dark:bg-green-900/30 dark:text-green-400">
                        {success}
                    </div>
                )}
                <Button
                    variant="outline"
                    type="button"
                    className="w-full h-12 text-base font-medium"
                    onClick={() => signIn("google", { callbackUrl: "/businesses/select" })}
                >
                    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Continue with Google
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
        <Suspense fallback={
            <Card className="w-full shadow-lg border-none sm:border-border sm:shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Login to your account
                    </CardTitle>
                    <CardDescription>
                        Loading...
                    </CardDescription>
                </CardHeader>
            </Card>
        }>
            <LoginForm />
        </Suspense>
    )
}

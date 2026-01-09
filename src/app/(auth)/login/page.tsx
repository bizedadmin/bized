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
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
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
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Button
                        className="w-full bg-black hover:bg-black/90 text-white"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Login
                    </Button>
                    <Button variant="outline" type="button" className="w-full">
                        Login with Google
                    </Button>
                </CardContent>
            </form>
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

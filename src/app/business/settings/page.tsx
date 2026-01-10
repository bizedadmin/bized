"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage your business settings and preferences.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general business settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Settings configuration coming soon...</p>
                </CardContent>
            </Card>
        </div>
    )
}

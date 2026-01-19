"use client"

import { useWizard } from "./wizard-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function Step7WhatsApp() {
    const { data, updateData } = useWizard()
    const [testing, setTesting] = useState(false)

    const testConnection = async () => {
        setTesting(true)
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1500))
        updateData({ whatsappConnected: true })
        setTesting(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <Label className="text-lg">Connect your WhatsApp Business</Label>
                <p className="text-sm text-gray-500 mt-1">Receive orders and communicate with customers</p>
            </div>

            {!data.whatsappConnected ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <div className="flex gap-3">
                            <Input
                                value={data.phone.code}
                                className="w-24 bg-white dark:bg-zinc-900"
                                disabled
                            />
                            <Input
                                id="whatsapp"
                                value={data.whatsappNumber || data.phone.number}
                                onChange={(e) => updateData({ whatsappNumber: e.target.value })}
                                placeholder="Phone number"
                                className="flex-1 bg-white dark:bg-zinc-900"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            This should be a WhatsApp Business account number
                        </p>
                    </div>

                    <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-zinc-900/50 text-center space-y-4">
                        <MessageCircle className="w-12 h-12 mx-auto text-green-600" />
                        <div>
                            <div className="font-medium">Connect WhatsApp</div>
                            <div className="text-sm text-gray-500 mt-1">
                                Scan QR code with WhatsApp Business app
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={testConnection}
                            disabled={testing || !data.whatsappNumber}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {testing ? "Testing..." : "Test Connection"}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="p-8 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20 text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                    <div>
                        <div className="text-xl font-bold text-green-900 dark:text-green-100">
                            WhatsApp Connected!
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                            Your store is ready to receive orders via WhatsApp
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 text-center">
                    You can skip this step and connect WhatsApp later from settings
                </p>
            </div>
        </div>
    )
}

"use client"
import { motion } from "framer-motion"
import { Receipt, Smartphone, CheckCircle2, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function InvoiceMockup() {
    return (
        <div className="relative w-full max-w-sm mx-auto md:max-w-2xl md:ml-auto md:mr-0 z-20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                {/* Customer View (Receipt) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Fake Mobile Header */}
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                        <div className="text-[10px] font-medium text-gray-400">bized.app</div>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <img src="/brand-icon.png" alt="Bized" className="w-8 h-8 object-contain" />
                                <span className="font-bold text-lg tracking-tight">Bized<span className="text-blue-600">.</span></span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Invoice</p>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">#INV-2026-003</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-2 py-4 border-t border-b border-gray-100 dark:border-zinc-800 border-dashed">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Professional Booking</span>
                                <span className="font-medium">$150.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Platform Fee</span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">$3.50</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-black text-blue-600">$153.50</span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 mt-2">
                            <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity h-11 font-bold shadow-lg shadow-black/10 dark:shadow-white/10 active:scale-95">
                                Pay Now <Zap className="w-4 h-4 ml-2 fill-current" />
                            </Button>
                            <Button variant="outline" className="w-full border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 h-10 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <Smartphone className="w-3.5 h-3.5 mr-2" />
                                Add to Wallet
                            </Button>
                        </div>
                    </div>
                </motion.div>


                {/* Business Dashboard View */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col gap-3"
                >

                    {/* Inbox Message Bubble */}
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 shadow-lg flex gap-3 relative overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm">Invoice Sent</h4>
                                <span className="text-[10px] text-gray-400">Just now</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">To: Jane Smith (jane@example.com)</p>

                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ delay: 0.8 }}
                                className="mt-2 flex items-center gap-2"
                            >
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 text-[10px] px-2 py-0.5 h-auto font-bold gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Low Risk
                                </Badge>
                                <span className="text-[10px] text-gray-400">Automated Check</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Cashbook Snapshot */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zinc-950 dark:bg-white text-white dark:text-black rounded-xl p-4 shadow-xl flex items-center packet-card"
                    >
                        <div className="flex-1">
                            <p className="text-[10px] opacity-70 uppercase tracking-wider font-medium mb-0.5">Total Inflow</p>
                            <div className="text-xl font-bold font-mono tracking-tight flex items-baseline gap-1">
                                $12,450.00
                                <span className="text-[10px] text-emerald-400 dark:text-emerald-600 font-sans font-bold">+12%</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                    </motion.div>

                </motion.div>

            </div>
        </div>
    )
}

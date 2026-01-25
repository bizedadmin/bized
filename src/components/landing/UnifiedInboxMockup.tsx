"use client"
import { motion } from "framer-motion"
import { MessageCircle, Search, MoreVertical, Paperclip, Mic, Send } from "lucide-react"

export function UnifiedInboxMockup() {
    return (
        <div className="relative w-full max-w-sm mx-auto md:max-w-none md:ml-auto md:mr-0 z-10 perspective-1000">
            {/* Main Phone/App Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gray-50 dark:bg-zinc-950 p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                            JD
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">John Doe</h3>
                            <p className="text-xs text-gray-500">via WhatsApp • Just now</p>
                        </div>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                        <Search className="w-5 h-5" />
                        <MoreVertical className="w-5 h-5" />
                    </div>
                </div>

                {/* Messages Body */}
                <div className="p-4 space-y-4 h-[320px] bg-gray-50/50 dark:bg-zinc-900/50 overflow-y-auto">
                    {/* Incoming Message */}
                    <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex-shrink-0" />
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[80%] border border-gray-100 dark:border-zinc-700">
                            <p className="text-sm text-gray-800 dark:text-gray-200">Hi! Do you have the Nike Air Max in size 42?</p>
                            <span className="text-[10px] text-gray-400 block mt-1">10:42 AM</span>
                        </div>
                    </div>

                    {/* Outgoing Message (Automated) */}
                    <div className="flex items-end gap-2 flex-row-reverse">
                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[80%]">
                            <p className="text-sm">Yes! We have 2 pairs left in stock at our CBD branch.</p>
                            <span className="text-[10px] text-blue-100 block mt-1 text-right">10:42 AM • AI Bot</span>
                        </div>
                    </div>

                    {/* Incoming Message 2 */}
                    <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex-shrink-0" />
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[80%] border border-gray-100 dark:border-zinc-700">
                            <p className="text-sm text-gray-800 dark:text-gray-200">Perfect, can I pay via M-Pesa?</p>
                            <span className="text-[10px] text-gray-400 block mt-1">10:43 AM</span>
                        </div>
                    </div>

                    {/* Payment Request */}
                    <div className="flex items-end gap-2 flex-row-reverse">
                        <div className="bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-2xl rounded-br-none shadow-sm max-w-[80%]">
                            <div className="flex items-center gap-2 mb-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                                <div className="p-1.5 bg-emerald-500 rounded-full text-white">
                                    <MessageCircle className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Payment Request</span>
                            </div>
                            <p className="text-sm font-medium mb-1">Nike Air Max 90</p>
                            <p className="text-2xl font-black mb-3">KES 12,500</p>
                            <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors">
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600"><Paperclip className="w-5 h-5" /></button>
                    <input className="flex-1 bg-gray-100 dark:bg-zinc-900 rounded-full px-4 py-2 text-sm outline-none" placeholder="Type a message..." />
                    <button className="text-gray-400 hover:text-gray-600"><Mic className="w-5 h-5" /></button>
                    <button className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Floating Elements / Notifications */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute top-[20%] -right-12 bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-zinc-700 w-64 z-20"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <span className="font-bold text-xs">IG</span>
                </div>
                <div>
                    <p className="text-xs font-bold">New Instagram DM</p>
                    <p className="text-[10px] text-gray-500">@sarah_designs wants to collab...</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-[30%] -left-8 bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-zinc-700 w-56 z-20"
            >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <span className="font-bold text-xs">G</span>
                </div>
                <div>
                    <p className="text-xs font-bold">Google Review</p>
                    <div className="flex text-yellow-500 text-[10px]">★★★★★</div>
                </div>
            </motion.div>
        </div>
    )
}

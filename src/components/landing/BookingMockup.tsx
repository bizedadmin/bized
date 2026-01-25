"use client"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2 } from "lucide-react"

export function BookingMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-sm mx-auto md:max-w-none md:ml-auto md:mr-0 z-30 mb-6"
        >
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl p-4 flex flex-col gap-3 mx-4 md:mx-0 md:w-80 backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 transform transition-transform hover:scale-105 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">New Booking</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Just now</span>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                        SJ
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Sarah Jenkins</h4>
                        <p className="text-xs text-gray-500 font-medium">Hair Spa & Treatment</p>
                        <p className="text-xs text-gray-400 mt-1">Tomorrow, 10:00 AM</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <button className="py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        Decline
                    </button>
                    <button className="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200 dark:shadow-none">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept
                    </button>
                </div>

            </div>
        </motion.div>
    )
}

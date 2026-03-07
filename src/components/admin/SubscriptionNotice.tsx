"use client";

import React from "react";
import { AlertCircle, CreditCard, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/contexts/BusinessContext";

export function SubscriptionNotice() {
    const { currentBusiness } = useBusiness();
    const subscription = currentBusiness?.subscription;

    if (!subscription) return null;

    const isTrialing = subscription.status === "trialing";
    const isPastDue = subscription.status === "past_due";
    const isUnpaid = subscription.status === "unpaid";
    const isCanceled = subscription.status === "canceled";

    if (subscription.status === "active") return null;

    // Determine notice level and message
    let variant: "warning" | "error" | "info" = "info";
    let message = "";
    let actionLabel = "Manage Billing";

    if (isTrialing) {
        variant = "info";
        message = "You are currently on a free trial. Upgrade now to unlock full platform power.";
        actionLabel = "View Plans";
    } else if (isPastDue) {
        variant = "warning";
        message = "Your last payment failed. Your account is in a grace period; please update your payment method to avoid service interruption.";
        actionLabel = "Update Payment";
    } else if (isUnpaid || isCanceled) {
        variant = "error";
        message = "Your subscription is " + subscription.status + ". Core features are restricted.";
        actionLabel = "Renew Now";
    }

    return (
        <div className={cn(
            "w-full px-6 py-3 flex items-center justify-between gap-4 transition-all animate-in slide-in-from-top duration-500",
            variant === "info" && "bg-indigo-600 text-white",
            variant === "warning" && "bg-amber-500 text-black",
            variant === "error" && "bg-rose-600 text-white"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-1.5 rounded-lg",
                    variant === "info" && "bg-white/20",
                    variant === "warning" && "bg-black/10",
                    variant === "error" && "bg-white/20"
                )}>
                    {variant === "error" ? <AlertCircle size={16} /> : (isTrialing ? <Zap size={16} /> : <CreditCard size={16} />)}
                </div>
                <p className="text-sm font-black tracking-tight uppercase">
                    {message}
                </p>
            </div>

            <Link
                href="/admin/billing"
                className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                    variant === "info" && "bg-white text-indigo-600 shadow-lg shadow-indigo-900/20",
                    variant === "warning" && "bg-black text-amber-500 shadow-lg shadow-amber-900/20",
                    variant === "error" && "bg-white text-rose-600 shadow-lg shadow-rose-900/20"
                )}
            >
                {actionLabel}
                <ChevronRight size={14} />
            </Link>
        </div>
    );
}

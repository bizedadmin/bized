import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"

interface RiskBadgeProps {
    level: "Low" | "Medium" | "High"
}

export function RiskBadge({ level }: RiskBadgeProps) {
    if (level === "Low") {
        return (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1.5 px-3 py-1 text-xs border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Low Risk
            </Badge>
        )
    }

    if (level === "Medium") {
        return (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 gap-1.5 px-3 py-1 text-xs border border-amber-200 dark:border-amber-800">
                <ShieldQuestion className="w-3.5 h-3.5" />
                Medium Risk
            </Badge>
        )
    }

    return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 gap-1.5 px-3 py-1 text-xs border border-red-200 dark:border-red-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            High Risk
        </Badge>
    )
}

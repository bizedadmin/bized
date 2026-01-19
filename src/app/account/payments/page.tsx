export default function PaymentsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
                <p className="text-muted-foreground mt-1">Manage payment methods and view transactions</p>
            </div>
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
                <p className="text-muted-foreground">No payment history available.</p>
            </div>
        </div>
    )
}

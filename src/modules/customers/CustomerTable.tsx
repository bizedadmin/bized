"use client"

import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Mail,
    Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CustomerTableProps {
    customers: any[]
    loading: boolean
    onDelete?: () => void
}

export function CustomerTable({ customers, loading, onDelete }: CustomerTableProps) {
    const router = useRouter()

    const handleDelete = async (customerId: string) => {
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return

        try {
            const res = await fetch(`/api/business/customers/${customerId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success("Customer deleted successfully")
                if (onDelete) onDelete()
            } else {
                toast.error("Failed to delete customer")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Contact Info</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold text-center">Orders</TableHead>
                    <TableHead className="font-semibold text-right">Total Spent</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            Loading customers...
                        </TableCell>
                    </TableRow>
                ) : customers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            No customers found.
                        </TableCell>
                    </TableRow>
                ) : (
                    customers.map((customer) => (
                        <TableRow key={customer._id} className="border-b transition-colors group">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">{customer.identifier}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span>{customer.email}</span>
                                    </div>
                                    {customer.telephone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{customer.telephone}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {customer.address?.addressLocality ? (
                                    <span>{customer.address.addressLocality}, {customer.address.addressCountry}</span>
                                ) : (
                                    <span className="italic">Not set</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-medium">{customer.totalOrders || 0}</span>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                KES {(customer.totalSpent || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/business/customers/${customer._id}`)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/business/customers/edit/${customer._id}`)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" /> Edit Customer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(customer._id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}

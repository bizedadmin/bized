import dbConnect from "@/lib/db";
import SystemError from "@/models/SystemError";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

async function getErrors() {
    await dbConnect();
    // Fetch last 50 errors, sorted by newest first
    const errors = await SystemError.find({}).sort({ timestamp: -1 }).limit(50).lean();
    return errors;
}

export const dynamic = 'force-dynamic';

export default async function ApiErrorsPage() {
    const errors = await getErrors();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">API Error Logs</h1>
                    <p className="text-muted-foreground">Monitor and debug system API failures.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    {errors.length} Recent Errors
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Failures</CardTitle>
                    <CardDescription>
                        Displaying the last 50 system errors captured from API endpoints.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[100px]">Method</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Path</TableHead>
                                <TableHead className="w-[300px]">Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {errors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No API errors found. Everything looks good!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                errors.map((error: any) => (
                                    <TableRow key={error._id.toString()}>
                                        <TableCell className="font-mono text-xs">
                                            {format(new Date(error.timestamp), "MMM dd, HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">{error.method}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={error.status >= 500 ? "destructive" : "default"} // Use 'default' (black) for 400s instead of yellow/warning as requested style usually prefers specific variants
                                                className={error.status >= 500 ? "bg-red-500" : "bg-orange-500"}
                                            >
                                                {error.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {error.path}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate text-xs" title={error.message}>
                                            {error.message}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

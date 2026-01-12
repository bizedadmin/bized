"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Mock Data for Charts
const userGrowthData = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 600 },
    { name: "Mar", users: 900 },
    { name: "Apr", users: 1200 },
    { name: "May", users: 1500 },
    { name: "Jun", users: 1800 },
    { name: "Jul", users: 2400 },
];

const revenueData = [
    { name: "Jan", revenue: 2400 },
    { name: "Feb", revenue: 1398 },
    { name: "Mar", revenue: 9800 },
    { name: "Apr", revenue: 3908 },
    { name: "May", revenue: 4800 },
    { name: "Jun", revenue: 3800 },
    { name: "Jul", revenue: 4300 },
];

const deviceUsageData = [
    { name: "Mobile", value: 65 },
    { name: "Desktop", value: 30 },
    { name: "Tablet", value: 5 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">
                    Platform usage statistics and revenue metrics.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={userGrowthData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                        <CardDescription>Monthly revenue overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={revenueData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                        formatter={(value) => [`$${value}`, "Revenue"]}
                                    />
                                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Small Stats Cards or Other Metrics Could Go Here */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2%</div>
                        <p className="text-xs text-muted-foreground">+0.4% from last month</p>
                        <div className="mt-4 h-[4px] w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[65%]" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$42.50</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                        <div className="mt-4 h-[4px] w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[45%]" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4%</div>
                        <p className="text-xs text-muted-foreground">-0.1% from last month</p>
                        <div className="mt-4 h-[4px] w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[15%]" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

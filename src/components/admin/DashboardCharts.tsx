
'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#facc15', '#0f172a', '#3b82f6', '#10b981'];

export interface ChartData {
    name: string;
    sales?: number;
    value?: number;
}

export default function DashboardCharts({
    salesTrend = [],
    categoryDistribution = []
}: {
    salesTrend?: ChartData[],
    categoryDistribution?: ChartData[]
}) {
    // Fallback data if empty
    const displaySales = salesTrend.length > 0 ? salesTrend : [
        { name: 'Loading...', sales: 0 }
    ];

    const displayCategory = categoryDistribution.length > 0 ? categoryDistribution : [
        { name: 'No Data', value: 1 }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* Sales Trend Line Chart */}
            <div className="md:col-span-2 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tighter">Sales Performance</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={displaySales}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#facc15"
                                strokeWidth={4}
                                dot={{ fill: '#facc15', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tighter">Inventory Mix</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={displayCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {displayCategory.map((entry: ChartData, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

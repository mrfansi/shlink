"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

interface DailyStat {
  date: string;
  clicks: number;
}

interface AnalyticsChartsProps {
  dailyStats: DailyStat[];
  deviceStats: { name: string; value: number }[];
  countryStats: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsCharts({ dailyStats, deviceStats, countryStats }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Clicks Over Time */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar dataKey="clicks" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                 <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                 >
                    {deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip />
                 <Legend />
              </PieChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Countries (Simple List for now to save space, or another chart) */}
       <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryStats.slice(0, 5).map((stat, i) => (
              <div key={stat.name} className="flex items-center">
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stat.name}</span>
                    <span className="text-muted-foreground">{stat.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(stat.value / Math.max(...countryStats.map(s => s.value))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {countryStats.length === 0 && <div className="text-sm text-muted-foreground">No data yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

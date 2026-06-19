"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Users } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("reports/analytics/")
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hospital Analytics & Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ገቢን የሚያሳይ የባር ቻርት */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center gap-2"><TrendingUp className="text-emerald-500"/> Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* የታካሚዎችን ስርጭት የሚያሳይ ፓይ ቻርት */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center gap-2"><Users className="text-blue-500"/> Patient Demographics (Gender)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.gender_demographics} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label>
                  {data?.gender_demographics?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, TrendingUp, Users, DollarSign, Activity, AlertCircle } from "lucide-react";

const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#10b981'];

// Grade 6 Type definitions for executive operational intelligence metrics
interface RevenueTrend {
  month: string;
  amount: number;
}

interface GenderDemographic {
  gender: string;
  count: number;
}

interface AnalyticsPayload {
  revenue_trend: RevenueTrend[];
  gender_demographics: GenderDemographic[];
  total_patients_count?: number;
  total_revenue_accumulated?: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Bug Fix: Client-side mount flag prevents SSR layout hydration mismatch drops from Recharts engines
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    API.get("reports/analytics/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics harvest pipeline exception:", err);
        setError("Failed to compile analytical registry logs. Verify server connections.");
        setLoading(false); // Bug Fix: Lower loading block to prevent terminal loop infinite spin traps
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="animate-spin text-blue-600 h-8 w-8 mx-auto" />
          <p className="text-xs text-gray-400 font-medium tracking-wide">Compiling clinical metrics registry files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-xl max-w-xl mx-auto mt-12 flex gap-3 items-start text-rose-700 text-sm font-medium">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Analytics Interruption Detected</h3>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic data tallies or assign robust safe state structural defaults
  const totalRevenue = data?.revenue_trend?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalPatients = data?.gender_demographics?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hospital Analytics & Reports</h1>
        <p className="text-xs text-gray-500 mt-1">Review organizational metrics, financial distributions, and demographic balances.</p>
      </div>

      {/* Grade 6 Feature: Executive Summary Highlight KPI Blocks Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Gross Capital Yield</span>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 font-mono">{totalRevenue.toLocaleString()} ETB</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Active Managed Charts</span>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 font-mono">{totalPatients} Patients</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 bg-white rounded-xl sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">System Stability Core</span>
              <h3 className="text-xl font-bold tracking-tight text-green-600 flex items-center gap-1.5 text-sm font-semibold">Operational Online</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Activity className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Data Rendering Grid Matrix Block */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ገቢን የሚያሳይ የባር ቻርት */}
          <Card className="shadow-sm border-gray-100 bg-white rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-50/60 pb-3 bg-gray-50/20">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-500 h-4 w-4" /> Monthly Revenue Trend
              </CardTitle>
              <CardDescription className="text-[11px] text-gray-400">Aggregated hospital income distribution across recent reporting cycles.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-6 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenue_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* የታካሚዎችን ስርጭት የሚያሳይ ፓይ ቻርት */}
          <Card className="shadow-sm border-gray-100 bg-white rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-50/60 pb-3 bg-gray-50/20">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-500 h-4 w-4" /> Patient Demographics (Gender)
              </CardTitle>
              <CardDescription className="text-[11px] text-gray-400">Proportional classification of admission logs filtered by raw biological metrics.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4 flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie 
                    data={data?.gender_demographics} 
                    dataKey="count" 
                    nameKey={(d) => d.gender === "M" ? "Male" : "Female"} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={75} 
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={11}
                    fontWeight="600"
                  >
                    {data?.gender_demographics?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
                  <Legend verticalAlign="bottom" height={24} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}





/*

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
        /* ገቢን የሚያሳይ የባር ቻርት */
  /*      <Card>
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

        /* የታካሚዎችን ስርጭት የሚያሳይ ፓይ ቻርት */
     /*   <Card>
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




*/












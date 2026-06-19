"use client";

import Link from 'next/link';
// የትኛው ገጽ ላይ እንዳለን ለማወቅ usePathname ያገለግላል
import { usePathname } from 'next/navigation';
// ከ lucide-react ላይ የሚያማምሩ አይኮኖችን አምጥተናል
import { LayoutDashboard, Users, Calendar, DollarSign, Activity } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // ሜኑዎቹ ከአይኮን ስማቸው ጋር እዚህ ተዋቅረዋል
  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/dashboard/patients', icon: Users },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Billing', href: '/dashboard/billing', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col justify-between hidden md:flex">
      <div>
        {/* የሎጎ እና የፖርታሉ ስም ማስቀመጫ */}
        <div className="flex items-center space-x-2 px-2 py-4 mb-6">
          <Activity className="h-8 w-8 text-blue-500" />
          <span className="text-white font-bold text-xl tracking-wider">HMS Pro</span>
        </div>
        
        {/* የሊንኮች ዝርዝር */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // በአሁኑ ሰዓት ያለንበት ገጽ ከሊንኩ ጋር እኩል መሆኑን ማረጋገጫ
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                {/* የአይኮን ማሳያ */}
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* የበታችኛው የቨርዥን ማሳያ */}
      <div className="text-xs text-slate-500 text-center py-2">v1.0.0 MVP</div>
    </aside>
  );
}
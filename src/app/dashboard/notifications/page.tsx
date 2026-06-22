"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, Check, Inbox, Loader2, RefreshCw, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Grade 6 Type definitions for rock-solid system alerts data tracking contracts
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");

  const loadNotifications = () => {
    setLoading(true);
    API.get("notifications/")
      .then((res) => {
        // Grade 6 fix: Extract array blocks cleanly out of paginated database results wrappers (.results)
        setNotifications(res.data.results || res.data || []);
        setLoading(false)
      })
      .catch((err) => {
        console.error("Notification load failure:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const toggleNotificationStatus = async (id: number, currentReadState: boolean) => {
    try {
      // Toggle state payload delivery to backend endpoint
      await API.patch(`notifications/${id}/`, { is_read: !currentReadState });
      
      // Grade 6 fix: Functional array map state modifier safely protects history mutations
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: !currentReadState } : n))
      );
    } catch (err) {
      console.error("Failed to alter alert status profile:", err);
    }
  };

  // Filter local dataset array blocks based on the current active UI tab selection
  const displayedNotifications = notifications.filter((n) => 
    activeTab === "unread" ? !n.is_read : n.is_read
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-500 h-6 w-6" /> Notification Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Stay updated on real-time patient admissions, laboratory results, and billing adjustments.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={loadNotifications} disabled={loading} className="h-8 w-8 text-gray-500 hover:bg-gray-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Grade 6 Feature: Interactive tab dashboard filtering matrix */}
      <div className="flex border-b border-gray-100 gap-4 text-sm font-medium">
        <button 
          onClick={() => setActiveTab("unread")} 
          className={`pb-2.5 relative font-semibold transition-colors ${activeTab === "unread" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          Inbox Alerts
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white hover:bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 border-none rounded-full">
              {unreadCount}
            </Badge>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("read")} 
          className={`pb-2.5 relative font-semibold transition-colors ${activeTab === "read" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          Archived History
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
        ) : displayedNotifications.length === 0 ? (
          // Grade 6 fix: Clean empty inbox feedback placeholder layout
          <div className="text-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Inbox className="mx-auto h-10 w-10 text-gray-300 stroke-[1.5]" />
            <h3 className="mt-3 text-sm font-semibold text-gray-900">Queue path empty</h3>
            <p className="mt-1 text-xs text-gray-400">No logs categorized under this status index filter folder.</p>
          </div>
        ) : (
          displayedNotifications.map((n) => (
            <div key={n.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex justify-between items-center gap-4 hover:border-gray-200 transition-all">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg mt-0.5 ${n.is_read ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-500"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className={`text-sm truncate ${n.is_read ? "font-medium text-gray-500" : "font-semibold text-gray-900"}`}>{n.title}</h4>
                  <p className={`text-xs mt-0.5 ${n.is_read ? "text-gray-400" : "text-gray-600"}`}>{n.message}</p>
                </div>
              </div>

              {/* Grade 6 Dynamic Action Module: Let users read/archive and un-archive seamlessly */}
              {activeTab === "unread" ? (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => toggleNotificationStatus(n.id, n.is_read)} 
                  className="text-green-600 hover:bg-green-50 hover:text-green-700 h-8 w-8 rounded-full shrink-0"
                  title="Mark as Read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => toggleNotificationStatus(n.id, n.is_read)} 
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-8 w-8 rounded-full shrink-0"
                  title="Mark as Unread"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}





/*

"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("notifications/").then((res) => setNotifications(res.data)).catch(console.error);
  }, []);

  const markAsRead = (id: number) => {
    API.patch(`notifications/${id}/`, { is_read: true })
      .then(() => setNotifications(notifications.filter((n: any) => n.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Notification Center</h1>
      <div className="space-y-2">
        {notifications.map((n: any) => (
          <div key={n.id} className="p-4 bg-white rounded-lg border shadow-sm flex justify-between items-center">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{n.title}</h4>
                <p className="text-xs text-gray-500">{n.message}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} className="text-green-600"><Check className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

*/
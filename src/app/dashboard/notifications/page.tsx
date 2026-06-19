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
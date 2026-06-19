"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    API.get("appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case "Pending": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "Cancelled": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appointments Schedule</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">Book Appointment</Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((app: any) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" /> {app.patient_name || `Patient #${app.patient}`}
                </TableCell>
                <TableCell>{app.doctor_name || `Dr. #${app.doctor}`}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-gray-600">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3"/> {app.appointment_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {app.appointment_time}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{app.reason}</TableCell>
                <TableCell>{getStatusBadge(app.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import API from "@/lib/api";
import { AppointmentSchema } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Loader2, User } from "lucide-react";
import * as z from "zod";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: { status: "Pending", reason: "" },
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      API.get("appointments/"),
      API.get("patients/?page_size=100"),
      API.get("doctors/"),
    ])
      .then(([apptRes, patientRes, doctorRes]) => {
        setAppointments(apptRes.data);
        setPatients(patientRes.data.results || patientRes.data || []);
        setDoctors(doctorRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: z.infer<typeof AppointmentSchema>) => {
    setSaving(true);
    setError(null);
    try {
      const time = data.appointment_time.length === 5 ? `${data.appointment_time}:00` : data.appointment_time;
      await API.post("appointments/", {
        patient: Number(data.patient),
        doctor: Number(data.doctor),
        appointment_date: data.appointment_date,
        appointment_time: time,
        reason: data.reason || "",
        status: data.status,
      });
      reset();
      setOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed": return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "Pending": return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Cancelled": return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appointments Schedule</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            {doctors.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                No doctors in the system. Run <code className="text-xs">python manage.py seed_demo_data</code> in the backend first.
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Patient</label>
                <select {...register("patient")} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                {errors.patient && <p className="text-xs text-red-500">{errors.patient.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Doctor</label>
                <select {...register("doctor")} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">Select doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.user?.first_name} {d.user?.last_name} — {d.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctor && <p className="text-xs text-red-500">{errors.doctor.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" {...register("appointment_date")} className="mt-1" />
                  {errors.appointment_date && <p className="text-xs text-red-500">{errors.appointment_date.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" {...register("appointment_time")} className="mt-1" />
                  {errors.appointment_time && <p className="text-xs text-red-500">{errors.appointment_time.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Input {...register("reason")} placeholder="e.g. General checkup" className="mt-1" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={saving || doctors.length === 0} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : appointments.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No appointments yet. Add a patient, then book an appointment.</p>
        ) : (
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
              {appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" /> {app.patient_name || `Patient #${app.patient}`}
                  </TableCell>
                  <TableCell>{app.doctor_name || `Dr. #${app.doctor}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-gray-600">
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {app.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {app.appointment_time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{app.reason || "—"}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

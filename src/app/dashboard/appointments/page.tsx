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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, Clock, Loader2, User, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import * as z from "zod";

// Grade 6 Type definitions for rock-solid code validation contracts
interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Doctor {
  id: number;
  doctor_name: string;
  specialization: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
      API.get("patients/?page_size=100"), // Temporary buffer limit capped for dashboard
      API.get("doctors/"),
    ])
      .then(([apptRes, patientRes, doctorRes]) => {
        # Grade 6 fix: Safely extract data arrays from backend pagination wrappers (.results)
        setAppointments(apptRes.data.results || apptRes.data || []);
        setPatients(patientRes.data.results || patientRes.data || []);
        setDoctors(doctorRes.data.results || doctorRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data load failure:", err);
        setError("Could not synchronise data fields from server endpoints.");
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
      // Grade 6 rule: Extract human-readable backend validation errors without stringifying raw brackets
      const backendError = err.response?.data?.non_field_errors?.[0] || 
                           err.response?.data?.detail || 
                           "Failed to book appointment. Check entry duplicates.";
      setError(backendError);
    } finally {
      setSaving(false);
    }
  };

  // Grade 6 feature: Send a quick PATCH payload request to instantly change states from table grid buttons
  const handleUpdateStatus = async (id: number, newStatus: "Confirmed" | "Cancelled") => {
    try {
      await API.patch(`appointments/${id}/`, { status: newStatus });
      loadData();
    } catch (err) {
      console.error("Failed to alter scheduling status:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Confirmed</Badge>;
      case "Pending": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Pending</Badge>;
      case "Cancelled": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments Schedule</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors">Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Book New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700">Patient Lookup</label>
                <select {...register("patient")} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Select patient profile...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient.message}</p>}
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700">Assigned Clinician</label>
                <select {...register("doctor")} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
                  <option value="">Select healthcare doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.doctor_name} — {d.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctor && <p className="text-xs text-red-500 mt-1">{errors.doctor.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Calendar Date</label>
                  <Input type="date" {...register("appointment_date")} className="mt-1" />
                  {errors.appointment_date && <p className="text-xs text-red-500 mt-1">{errors.appointment_date.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Session Time</label>
                  <Input type="time" {...register("appointment_time")} className="mt-1" />
                  {errors.appointment_time && <p className="text-xs text-red-500 mt-1">{errors.appointment_time.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Clinical Reason</label>
                <Input {...register("reason")} placeholder="e.g. Chronic checkup management" className="mt-1" />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Schedule Registration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No synchronized clinic appointments found in this view trace.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                <TableHead className="font-semibold text-gray-700">Clinical Indication</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="w-[60px]"></TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((app) => (
                <TableRow key={app.id} className="hover:bg-gray-50/40 transition-colors">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500"><User className="h-3.5 w-3.5" /></div>
                      <span>{app.patient_name || `ID: #${app.patient}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 font-medium">{app.doctor_name || `ID: #${app.doctor}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs font-medium text-gray-500 space-y-0.5">
                      <span className="flex items-center gap-1 text-gray-800"><CalendarIcon className="h-3 w-3 text-gray-400" /> {app.appointment_date}</span>
                      <span className="flex items-center gap-1 text-gray-400"><Clock className="h-3 w-3" /> {app.appointment_time.substring(0, 5)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">{app.reason || "—"}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {/* Grade 6 Interactive dropdown actions matrix to change live states */}
                    {app.status === "Pending" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"><MoreVertical className="h-4 w-4 text-gray-500" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "Confirmed")} className="text-green-600 cursor-pointer flex items-center gap-2 font-medium text-xs">
                            <CheckCircle className="h-3.5 w-3.5" /> Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "Cancelled")} className="text-red-600 cursor-pointer flex items-center gap-2 font-medium text-xs">
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}


/*
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
*/

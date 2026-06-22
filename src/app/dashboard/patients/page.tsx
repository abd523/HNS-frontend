"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import API from "@/lib/api";
import { PatientSchema } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Search, ChevronLeft, ChevronRight, UserRoundCheck } from "lucide-react";
import * as z from "zod";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: "M" | "F";
  phone_number: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof PatientSchema>>({
    resolver: zodResolver(PatientSchema),
    defaultValues: { gender: "M", address: "", email: "", medical_history: "" },
  });

  // Bug Fix: Set up a debouncer to prevent flooding the backend API with requests on every single keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page selection directly to head block index position upon adjustments
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadPatients = () => {
    setLoading(true);
    API.get(`patients/?search=${debouncedSearch}&page=${page}`)
      .then((res) => {
        setPatients(res.data.results || res.data || []);
        // Bug Fix: Use next-page verification token flags straight from pagination containers
        setHasNextPage(!!res.data.next);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Directory fetch fail:", err);
        setLoading(false);
      });
  };

  useEffect(() => { 
    loadPatients(); 
  }, [debouncedSearch, page]);

  const onSubmit = async (data: z.infer<typeof PatientSchema>) => {
    setSaving(true);
    setError(null);
    try {
      await API.post("patients/", {
        ...data,
        email: data.email || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || "",
        medical_history: data.medical_history || null,
      });
      reset();
      setOpen(false);
      setPage(1);
      loadPatients();
    } catch (err: any) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to add patient to database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <UserRoundCheck className="text-blue-600 h-6 w-6" /> Patient Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage core admission charts and outpatient information channels.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-medium shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">Register New Admission Chart</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <Input {...register("first_name")} className="mt-1 focus-visible:ring-blue-500" />
                  {errors.first_name && <p className="text-[11px] text-red-500 mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <Input {...register("last_name")} className="mt-1 focus-visible:ring-blue-500" />
                  {errors.last_name && <p className="text-[11px] text-red-500 mt-1">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Date of Birth</label>
                  <Input type="date" {...register("date_of_birth")} className="mt-1 focus-visible:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Gender</label>
                  <select {...register("gender")} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none shadow-sm h-10">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                <Input {...register("phone_number")} placeholder="0912345678" className="mt-1 focus-visible:ring-blue-500" />
                {errors.phone_number && <p className="text-[11px] text-red-500 mt-1">{errors.phone_number.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Email (Optional)</label>
                <Input type="email" {...register("email")} className="mt-1 focus-visible:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Residential Address</label>
                <Input {...register("address")} className="mt-1 focus-visible:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Primary Medical History</label>
                <Input {...register("medical_history")} placeholder="Allergies, chronic conditions..." className="mt-1 focus-visible:ring-blue-500" />
              </div>
              
              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-medium">{error}</div>}
              
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 font-medium text-white shadow-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Patient Registration Sheet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center max-w-sm bg-white rounded-xl border border-gray-200 px-3 py-0.5 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input placeholder="Search records by name or phone..." className="border-0 focus-visible:ring-0 shadow-none h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm font-medium">No patient records registered under this directory index.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Full Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Date of Birth</TableHead>
                <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                <TableHead className="font-semibold text-gray-700">Phone Connection</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right pr-6">Action Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50/40 transition-colors">
                  <TableCell className="font-semibold text-gray-900">{`${p.first_name} ${p.last_name}`}</TableCell>
                  <TableCell className="text-gray-600 font-medium text-xs">{p.date_of_birth || "—"}</TableCell>
                  <TableCell className="text-gray-600 text-xs font-medium">{p.gender === "M" ? "Male" : "Female"}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{p.phone_number}</TableCell>
                  <TableCell className="text-right pr-6">
                    {/* Clean prefetch compilation wiring via structural routing elements */}
                    <Link href={`/dashbord/patients/${p.id}`} passHref>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200 hover:bg-gray-50 font-medium text-gray-700">Open Chart</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Verification Boundary Check Pagination Buttons */}
      <div className="flex justify-end space-x-2 pt-1">
        <Button disabled={page === 1 || loading} onClick={() => setPage((p) => p - 1)} variant="outline" size="sm" className="h-8 text-xs font-medium gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>
        <Button disabled={!hasNextPage || loading} onClick={() => setPage((p) => p + 1)} variant="outline" size="sm" className="h-8 text-xs font-medium gap-1">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}



/*
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import API from "@/lib/api";
import { PatientSchema } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Search } from "lucide-react";
import * as z from "zod";

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof PatientSchema>>({
    resolver: zodResolver(PatientSchema),
    defaultValues: { gender: "M", address: "", email: "", medical_history: "" },
  });

  const loadPatients = () => {
    setLoading(true);
    API.get(`patients/?search=${search}&page=${page}`)
      .then((res) => {
        setPatients(res.data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { loadPatients(); }, [search, page]);

  const onSubmit = async (data: z.infer<typeof PatientSchema>) => {
    setSaving(true);
    setError(null);
    try {
      await API.post("patients/", {
        ...data,
        email: data.email || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || "",
        medical_history: data.medical_history || null,
      });
      reset();
      setOpen(false);
      setPage(1);
      loadPatients();
    } catch (err: any) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to add patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Directory</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input {...register("first_name")} className="mt-1" />
                  {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input {...register("last_name")} className="mt-1" />
                  {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input type="date" {...register("date_of_birth")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select {...register("gender")} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input {...register("phone_number")} placeholder="0912345678" className="mt-1" />
                {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email (optional)</label>
                <Input type="email" {...register("email")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input {...register("address")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Medical History</label>
                <Input {...register("medical_history")} className="mt-1" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Patient"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center max-w-sm bg-white rounded-md border px-3">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name or phone..." className="border-0 focus-visible:ring-0" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : patients.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No patients yet. Click &quot;Add Patient&quot; to register one.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{`${patient.first_name} ${patient.last_name}`}</TableCell>
                  <TableCell>{patient.date_of_birth || "—"}</TableCell>
                  <TableCell>{patient.gender === "M" ? "Male" : "Female"}</TableCell>
                  <TableCell>{patient.phone_number}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/patients/${patient.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline">Previous</Button>
        <Button onClick={() => setPage(page + 1)} variant="outline">Next</Button>
      </div>
    </div>
  );
}
*/
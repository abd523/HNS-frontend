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

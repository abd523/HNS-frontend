"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import API from "@/lib/api";
import { InvoiceSchema } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Loader2, Plus, CreditCard, CheckCircle2 } from "lucide-react";
import * as z from "zod";

// Grade 6 Type definitions for explicit financial validation contracts
interface Invoice {
  id: number;
  patient: number;
  patient_name: string;
  total_amount: string | number;
  status: "Paid" | "Unpaid";
  created_at: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grade 6 localization configuration: Central currency display variable (e.g., "ETB" or "$")
  const CURRENCY_LABEL = "ETB";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof InvoiceSchema>>({
    resolver: zodResolver(InvoiceSchema),
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      API.get("invoices/"), 
      API.get("patients/?page_size=100")
    ])
      .then(([invRes, patRes]) => {
        // Grade 6 fix: Extract array blocks cleanly out of paginated database results wrappers (.results)
        setInvoices(invRes.data.results || invRes.data || []);
        setPatients(patRes.data.results || patRes.data || []);
        setLoading(false);
      })
      .catch((err) => { 
        console.error("Billing tracking error:", err); 
        setLoading(false); 
      });
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkAsPaid = async (id: number) => {
    try {
      await API.patch(`invoices/${id}/`, { status: "Paid", paid_at: new Date().toISOString() });
      loadData();
    } catch (err) { 
      console.error("Payment collection execution failure:", err); 
    }
  };

  const onSubmit = async (data: z.infer<typeof InvoiceSchema>) => {
    setSaving(true);
    setError(null);
    try {
      await API.post("invoices/", {
        patient: Number(data.patient),
        // Grade 6 fix: Ensure raw text inputs are parsed into floats before delivery to the API endpoint
        total_amount: parseFloat(String(data.total_amount)),
        status: "Unpaid",
      });
      reset();
      setOpen(false);
      loadData();
    } catch (err: any) {
      const parsedError = err.response?.data?.total_amount?.[0] || 
                          err.response?.data?.detail || 
                          "Failed to compile and post new patient transactional ledger entry.";
      setError(parsedError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <CreditCard className="text-emerald-600 h-6 w-6" /> Billing & Invoices
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Generate New Patient Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700">Account Patient</label>
                <select {...register("patient")} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none">
                  <option value="">Select billing target chart...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Total Charged Amount ({CURRENCY_LABEL})</label>
                {/* Grade 6 fix: min="0.01" explicitly blocks negative submissions straight inside the browser UI view layer */}
                <Input type="number" step="0.01" min="0.01" {...register("total_amount")} placeholder="500.00" className="mt-1" />
                {errors.total_amount && <p className="text-xs text-red-500 mt-1">{errors.total_amount.message}</p>}
              </div>
              
              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md border border-red-100 font-medium">
                  {error}
                </div>
              )}
              
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Final Balance Ledger Sheet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin h-6 w-6 text-emerald-600" /></div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No historical financial statements registered in this tracker path trace.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Invoice ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                <TableHead className="font-semibold text-gray-700">Total Balance Due</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right pr-6">Action Execution Gateway</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50/40 transition-colors">
                  <TableCell className="font-mono text-xs text-gray-500 font-semibold">#INV-{inv.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{inv.patient_name || `Patient Account ID: #${inv.patient}`}</TableCell>
                  <TableCell className="font-bold text-gray-900">
                    {/* Grade 6 fix: Dynamic presentation wrapper adjusting currency formats cleanly */}
                    {Number(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY_LABEL}
                  </TableCell>
                  <TableCell>
                    <Badge className={inv.status === "Paid" 
                      ? "bg-green-100 text-green-800 border-none shadow-none hover:bg-green-100" 
                      : "bg-rose-100 text-rose-800 border-none shadow-none hover:bg-rose-100"}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {inv.status === "Unpaid" ? (
                      <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs shadow-sm transition-all" onClick={() => handleMarkAsPaid(inv.id)}>
                        Collect Settled Payment
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Transaction Finalized
                      </span>
                    )}
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
import { InvoiceSchema } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Loader2, Plus } from "lucide-react";
import * as z from "zod";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof InvoiceSchema>>({
    resolver: zodResolver(InvoiceSchema),
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([API.get("invoices/"), API.get("patients/?page_size=100")])
      .then(([invRes, patRes]) => {
        setInvoices(invRes.data);
        setPatients(patRes.data.results || patRes.data || []);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkAsPaid = async (id: number) => {
    try {
      await API.patch(`invoices/${id}/`, { status: "Paid", paid_at: new Date().toISOString() });
      loadData();
    } catch (err) { console.error(err); }
  };

  const onSubmit = async (data: z.infer<typeof InvoiceSchema>) => {
    setSaving(true);
    setError(null);
    try {
      await API.post("invoices/", {
        patient: Number(data.patient),
        total_amount: data.total_amount,
        status: "Unpaid",
      });
      reset();
      setOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="text-emerald-600" /> Billing & Invoices
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Invoice</DialogTitle>
            </DialogHeader>
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
                <label className="text-sm font-medium">Total Amount ($)</label>
                <Input type="number" step="0.01" {...register("total_amount")} placeholder="500.00" className="mt-1" />
                {errors.total_amount && <p className="text-xs text-red-500">{errors.total_amount.message}</p>}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : invoices.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No invoices yet. Create one for a patient.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono">#INV-{inv.id}</TableCell>
                  <TableCell>{inv.patient_name || `Patient #${inv.patient}`}</TableCell>
                  <TableCell className="font-bold">${inv.total_amount}</TableCell>
                  <TableCell>
                    <Badge className={inv.status === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.status === "Unpaid" ? (
                      <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleMarkAsPaid(inv.id)}>
                        Collect Payment
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500 font-medium">Settled</span>
                    )}
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
*/
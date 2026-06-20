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

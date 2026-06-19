"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    API.get("invoices/").then((res) => setInvoices(res.data)).catch(console.error);
  }, []);

  const handleMarkAsPaid = async (id: number) => {
    try {
      await API.patch(`invoices/${id}/`, { status: "Paid", paid_at: new Date().toISOString() });
      window.location.reload();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="text-emerald-600" /> Billing & Invoices</h1>
      <div className="bg-white rounded-xl border shadow-sm">
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
            {invoices.map((inv: any) => (
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
                    <Button size="sm" variant="success" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleMarkAsPaid(inv.id)}>
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
      </div>
    </div>
  );
}
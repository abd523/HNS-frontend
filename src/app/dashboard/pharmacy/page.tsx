"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    API.get("medicines/").then((res) => setMedicines(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="text-blue-600" /> Pharmacy Inventory</h1>
      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Qty</TableHead>
              <TableHead>Price Per Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((med: any) => (
              <TableRow key={med.id}>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.category}</TableCell>
                <TableCell>
                  {med.quantity_in_stock <= 10 ? (
                    <Badge className="bg-red-100 text-red-800">Low Stock ({med.quantity_in_stock})</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">{med.quantity_in_stock} Units</Badge>
                  )}
                </TableCell>
                <TableCell>${med.price_per_unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
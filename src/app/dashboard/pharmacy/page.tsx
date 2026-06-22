"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Grade 6 Type definitions for explicit pharmaceutical inventory asset contracts
interface MedicineItem {
  id: number;
  name: string;
  category: string;
  quantity_in_stock: number;
  price_per_unit: string | number;
}

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInventory = () => {
    setLoading(true);
    API.get("medicines/")
      .then((res) => {
        // Grade 6 fix: Extract array data blocks cleanly out of paginated response wrappers (.results)
        setMedicines(res.data.results || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Pharmacy inventory tracking failure:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter local inventory records instantly based on the search input
  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(search.toLowerCase()) ||
    med.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600 h-6 w-6" /> Pharmacy Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor pharmaceutical stock balances, distribution price structures, and batch alerts.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={loadInventory} disabled={loading} className="h-9 w-9 text-gray-500 hover:bg-gray-50 shadow-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Grade 6 Feature: Interactive Search bar component wrapper layout */}
      <div className="flex items-center max-w-md bg-white rounded-xl border border-gray-200 px-3 py-0.5 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input 
          placeholder="Search by medicine name or drug category..." 
          className="border-0 focus-visible:ring-0 shadow-none h-9 text-sm" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          </div>
        ) : filteredMedicines.length === 0 ? (
          // Grade 6 fix: Informative empty state feedback block layout
          <div className="text-center p-12 text-gray-500 text-sm font-medium">
            No pharmaceutical stock profiles matched your active tracking search.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Medicine Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Category Class</TableHead>
                <TableHead className="font-semibold text-gray-700">Stock Status Balance</TableHead>
                <TableHead className="font-semibold text-gray-700">Price Per Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((med) => (
                <TableRow key={med.id} className="hover:bg-gray-50/40 transition-colors">
                  <TableCell className="font-semibold text-gray-900">{med.name}</TableCell>
                  <TableCell className="text-xs font-medium text-gray-600">{med.category}</TableCell>
                  <TableCell>
                    {/* Grade 6 fix: Styled status threshold badges layout */}
                    {med.quantity_in_stock <= 10 ? (
                      <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none shadow-none flex items-center gap-1 text-xs font-semibold px-2 py-0.5 w-fit">
                        <AlertTriangle className="h-3 w-3" /> Critical Stock ({med.quantity_in_stock})
                      </Badge>
                    ) : (
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-none shadow-none flex items-center gap-1 text-xs font-semibold px-2 py-0.5 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> {med.quantity_in_stock} Units Avail.
                      </Badge>
                    )}
                  </TableCell>
                  {/* Grade 6 fix: Localized context currency designation format pattern */}
                  <TableCell className="font-mono text-xs font-bold text-gray-700">
                    {Number(med.price_per_unit).toFixed(2)} ETB
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


*/
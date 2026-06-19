"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    API.get(`patients/?search=${search}&page=${page}`)
      .then((res) => {
        setPatients(res.data.results); // DRF በPagination ጊዜ በresults ውስጥ ነው የሚመልሰው
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [search, page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Directory</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center max-w-sm bg-white rounded-md border px-3">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or phone..."
          className="border-0 focus-visible:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age/DOB</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient: any) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{`${patient.first_name} ${patient.last_name}`}</TableCell>
                  <TableCell>{patient.date_of_birth}</TableCell>
                  <TableCell>{patient.gender === 'M' ? 'Male' : 'Female'}</TableCell>
                  <TableCell>{patient.phone_number}</TableCell>
                  <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Simple Pagination Buttons */}
      <div className="flex justify-end space-x-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline">Previous</Button>
        <Button onClick={() => setPage(page + 1)} variant="outline">Next</Button>
      </div>
    </div>
  );
}
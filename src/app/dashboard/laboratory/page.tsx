"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function LabPage() {
  const [labRequests, setLabRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [resultText, setResultText] = useState("");

  useEffect(() => {
    API.get("lab-requests/").then((res) => setLabRequests(res.data)).catch(console.error);
  }, []);

  const handleUploadResult = async () => {
    try {
      await API.patch(`lab-requests/${selectedRequest.id}/`, {
        result_details: resultText,
        status: "Completed"
      });
      // ዝርዝሩን በዳግም ጥሪ ማደስ (Refresh)
      window.location.reload();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laboratory Queue & Results</h1>

      <div className="bg-white rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labRequests.map((req: any) => (
              <TableRow key={req.id}>
                <TableCell>{req.patient_name || `Patient #${req.patient}`}</TableCell>
                <TableCell className="font-semibold text-blue-600">{req.test_name}</TableCell>
                <TableCell>
                  <Badge className={req.status === "Completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {req.status === "Pending" ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedRequest(req)}>Enter Result</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Test Result ({req.test_name})</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input placeholder="Enter findings (e.g., WBC: 4,500/mcL)" value={resultText} onChange={(e) => setResultText(e.target.value)} />
                          <Button onClick={handleUploadResult} className="w-full bg-blue-600">Submit</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Result Loaded</span>
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
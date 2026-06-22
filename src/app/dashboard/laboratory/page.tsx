"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlaskConical, Loader2, CheckCircle2, ClipboardList, Eye } from "lucide-react";

// Grade 6 Type definitions for rock-solid diagnostic data tracking contracts
interface LabRequest {
  id: number;
  patient: number;
  patient_name: string;
  test: number;
  test_name: string;
  status: "Pending" | "Completed";
  result_details: string;
  created_at: string;
}

export default function LabPage() {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [resultText, setResultText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const loadLabRequests = () => {
    setLoading(true);
    API.get("lab-requests/")
      .then((res) => {
        // Grade 6 fix: Extract arrays cleanly from paginated response structures (.results)
        setLabRequests(res.data.results || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lab fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLabRequests();
  }, []);

  const handleOpenWriteModal = (req: LabRequest) => {
    setSelectedRequest(req);
    setResultText("");
    setIsWriteOpen(true);
  };

  const handleOpenViewModal = (req: LabRequest) => {
    setSelectedRequest(req);
    setIsViewOpen(true);
  };

  const handleUploadResult = async () => {
    if (!selectedRequest || !resultText.trim()) return;
    setSubmitLoading(true);
    try {
      await API.patch(`lab-requests/${selectedRequest.id}/`, {
        result_details: resultText,
        status: "Completed"
      });
      setIsWriteOpen(false);
      setSelectedRequest(null);
      setResultText("");
      // Grade 6 fix: In-memory dynamic list reload instead of slamming window.location.reload()
      loadLabRequests(); 
    } catch (err) { 
      console.error("Failed to post diagnostics:", err); 
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <FlaskConical className="text-blue-600 h-6 w-6" /> Laboratory Queue & Results
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor active physician diagnostic orders and document metric findings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          </div>
        ) : labRequests.length === 0 ? (
          <div className="text-center p-12 text-gray-500 text-sm">
            No dynamic laboratory triage requests mapped to this queue folder.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                <TableHead className="font-semibold text-gray-700">Test Requested</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right pr-6">Action Gateway</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-gray-50/40 transition-colors">
                  <TableCell className="font-medium text-gray-900">
                    {req.patient_name || `Patient Account Reference: #${req.patient}`}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600 text-sm">
                    {req.test_name || "Diagnostic Analysis Panel"}
                  </TableCell>
                  <TableCell>
                    <Badge className={req.status === "Completed" 
                      ? "bg-green-50 text-green-700 border-none shadow-none hover:bg-green-50 font-semibold" 
                      : "bg-amber-50 text-amber-700 border-none shadow-none hover:bg-amber-50 font-semibold"}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {req.status === "Pending" ? (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-medium text-xs shadow-sm" onClick={() => handleOpenWriteModal(req)}>
                        Enter Findings
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs font-medium border-gray-200 hover:bg-gray-50 text-gray-600 gap-1 inline-flex items-center" onClick={() => handleOpenViewModal(req)}>
                        <Eye className="h-3.5 w-3.5" /> View Metrics
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Grade 6 fix: Modals moved cleanly completely out of loops to ensure accurate context render bindings */}
      
      {/* WRITE MODAL */}
      <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Log Diagnostic Findings: <span className="text-blue-600 font-bold">{selectedRequest?.test_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Metric Analysis Details</label>
              {/* Grade 6 fix: Swapped narrow inputs to a text area box for cleaner chart entry spacing */}
              <Textarea 
                placeholder="Type comprehensive analysis findings (e.g., Hemoglobin: 14.2 g/dL, Platelets: 250,000/mcL)..." 
                value={resultText} 
                onChange={(e) => setResultText(e.target.value)} 
                className="min-h-[120px] text-sm focus-visible:ring-blue-500 resize-none"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUploadResult} disabled={submitLoading || !resultText.trim()} className="w-full bg-blue-600 hover:bg-blue-700 font-medium text-white shadow-sm">
                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit & Close Lab File"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* READ MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="text-gray-400 h-5 w-5" /> Lab Results Ledger File
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 gap-y-1.5">
              <span className="text-gray-500 font-medium">Patient Target</span>
              <span className="text-gray-900 font-bold text-right truncate">{selectedRequest?.patient_name}</span>
              <span className="text-gray-500 font-medium">Diagnostic Panel</span>
              <span className="text-blue-600 font-bold text-right truncate">{selectedRequest?.test_name}</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Documented Findings</label>
              <div className="p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-lg whitespace-pre-wrap min-h-[100px] border border-gray-800 shadow-inner">
                {selectedRequest?.result_details || "No metrics compiled."}
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)} className="text-xs font-medium border-gray-200">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" /> Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



/*
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

*/
"use client";

import { useState, useEffect, use } from "react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Loader2, CheckCircle2, User, HeartPulse } from "lucide-react";

interface MedicationField {
  name: string;
  dosage: string;
  duration: string;
}

interface PatientProfile {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  phone_number: string;
  medical_history: string | null;
}

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Bug Fix: Safely unwrap async route params to guarantee dynamic tracking data stability
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [medications, setMedications] = useState<MedicationField[]>([
    { name: "", dosage: "", duration: "" }
  ]);

  // Load the target patient profile so the clinician can verify the identity card at a glance
  useEffect(() => {
    setProfileLoading(true);
    API.get(`patients/${patientId}/`)
      .then((res) => {
        setPatient(res.data);
        setProfileLoading(false);
      })
      .catch((err) => {
        console.error("Failed patient metadata acquisition:", err);
        setProfileLoading(false);
      });
  }, [patientId]);

  const addMedicationField = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  };

  const removeMedicationField = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof MedicationField, value: string) => {
    setMedications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveEMR = async () => {
    if (!diagnosis.trim()) return;
    setSaving(true);
    setSuccess(false);

    // Feature Fix: Clean up and omit empty prescription rows before sending to backend database JSON fields
    const validPrescriptions = medications.filter(med => med.name.trim() !== "");

    const payload = {
      patient: Number(patientId),
      diagnosis: diagnosis,
      doctor_notes: notes,
      medications: validPrescriptions
    };

    try {
      // Clean target payload delivery step implementation
      await API.post("medical-records/", payload);
      setSuccess(true);
      setDiagnosis("");
      setNotes("");
      setMedications([{ name: "", dosage: "", duration: "" }]);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("EMR commit operational failure:", err);
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="flex justify-center items-center p-24"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Patient Identity Header Validation Matrix block */}
      {patient && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{`Patient: ${patient.first_name} ${patient.last_name}`}</h2>
              <p className="text-xs text-gray-500 font-medium">Chart File Reference Key: #PT-{patient.id}</p>
            </div>
          </div>
          <div className="text-xs border-l border-gray-100 pl-6 space-y-1">
            <div className="text-gray-500 font-medium">Biological Line: <span className="text-gray-800 font-bold ml-1">{patient.gender === "M" ? "Male" : "Female"}</span></div>
            <div className="text-gray-500 font-medium">Mobile Anchor: <span className="text-gray-800 font-mono font-bold ml-1">{patient.phone_number}</span></div>
          </div>
          {patient.medical_history && (
            <div className="text-xs border-l border-gray-100 pl-6 flex-1 min-w-[200px]">
              <div className="text-gray-500 font-semibold flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Clinical Flags Registry:</div>
              <p className="text-gray-700 font-medium mt-0.5 truncate max-w-sm">{patient.medical_history}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* የግራው ክፍል - Consultation Entry */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600 h-5 w-5" /> Consultation & EMR Entry
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Observation Diagnosis Target</label>
              <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Acute Tonsillitis" className="mt-1 focus-visible:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Detailed Physician Consultation Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write clinical examination logs, symptoms trace indicators..." className="mt-1 focus-visible:ring-blue-500 text-sm resize-none" rows={4} />
            </div>
          </div>

          {/* Dynamic Medicine Script Assembly Area */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">Formulate Treatment Prescriptions</h3>
              <Button onClick={addMedicationField} variant="outline" size="sm" className="text-xs font-semibold text-blue-600 border-blue-100 hover:bg-blue-50 h-8">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Formulation Item
              </Button>
            </div>

            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="flex gap-3 items-end bg-gray-50/60 p-3 rounded-xl border border-gray-100 transition-all">
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[11px] font-semibold text-gray-500">Chemical Title / Name</label>
                    <Input value={med.name} onChange={(e) => handleMedicationChange(index, "name", e.target.value)} placeholder="Amoxicillin" className="bg-white mt-1 h-9 text-sm focus-visible:ring-blue-500" />
                  </div>
                  <div className="w-28">
                    <label className="text-[11px] font-semibold text-gray-500">Dosage Strategy</label>
                    <Input value={med.dosage} onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)} placeholder="1x3" className="bg-white mt-1 h-9 text-sm focus-visible:ring-blue-500" />
                  </div>
                  <div className="w-28">
                    <label className="text-[11px] font-semibold text-gray-500">Therapy Duration</label>
                    <Input value={med.duration} onChange={(e) => handleMedicationChange(index, "duration", e.target.value)} placeholder="7 days" className="bg-white mt-1 h-9 text-sm focus-visible:ring-blue-500" />
                  </div>
                  {medications.length > 1 && (
                    <Button onClick={() => removeMedicationField(index)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button onClick={handleSaveEMR} disabled={saving || !diagnosis.trim()} className="w-full bg-blue-600 hover:bg-blue-700 font-medium text-white shadow-sm transition-all h-10">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Diagnostic Record & Generate Prescription"}
            </Button>
            {success && (
              <div className="text-xs text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100 font-semibold inline-flex items-center gap-1.5 w-full justify-center animate-fade-in">
                <CheckCircle2 className="h-4 w-4" /> Medical encounter record successfully dispatched and committed into core ledger storage.
              </div>
            )}
          </div>
        </div>

        {/* የቀኝ ክፍል - Medical Timeline History Concept */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 h-fit">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight border-b border-gray-50 pb-2">Medical Timeline Summary</h3>
          <div className="relative border-l border-gray-100 ml-3.5 space-y-6 pt-1">
            <div className="relative ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-50 rounded-full -left-[31px] ring-4 ring-white text-xs">🩺</span>
              <h4 className="font-semibold text-xs text-gray-900">Hypertension Follow-up Check</h4>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">June 10, 2026 — Dr. Dawit</p>
            </div>
            <div className="relative ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-emerald-50 rounded-full -left-[31px] ring-4 ring-white text-xs">🧪</span>
              <h4 className="font-semibold text-xs text-gray-900">CBC Complete Blood Panel Profile</h4>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">May 15, 2026 — Lab Tech Analyst</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





/** 
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText } from "lucide-react";

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  // Dynamic Medicine State
  const [medications, setMedications] = useState([{ name: "", dosage: "", duration: "" }]);

  const addMedicationField = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  };

  const removeMedicationField = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSaveEMR = async () => {
    const payload = {
      patient: params.id,
      diagnosis,
      doctor_notes: notes,
      medications: medications // ይህ ወደ Prescription JSONField ይሄዳል
    };
    console.log("Saving EMR & Prescription: ", payload);
    // API.post("medical-records/", payload) ...
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      /* የግራው ክፍል - የሕክምና ታሪክ መመዝገቢያ */
   /*   <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Consultation & EMR Entry
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Diagnosis</label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Acute Tonsillitis" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Doctor's Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write clinical notes here..." className="mt-1" rows={4} />
          </div>
        </div>

        /* Dynamic Medicine Entry Section */
  /*      <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800">Prescribe Medications</h3>
            <Button onClick={addMedicationField} variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-1" /> Add Medicine
            </Button>
          </div>

          {medications.map((med, index) => (
            <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Medicine Name</label>
                <Input value={med.name} onChange={(e) => handleMedicationChange(index, "name", e.target.value)} placeholder="Amoxicillin" className="bg-white" />
              </div>
              <div className="w-32">
                <label className="text-xs text-gray-500">Dosage</label>
                <Input value={med.dosage} onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)} placeholder="1x3" className="bg-white" />
              </div>
              <div className="w-32">
                <label className="text-xs text-gray-500">Duration</label>
                <Input value={med.duration} onChange={(e) => handleMedicationChange(index, "duration", e.target.value)} placeholder="7 days" className="bg-white" />
              </div>
              {medications.length > 1 && (
                <Button onClick={() => removeMedicationField(index)} variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleSaveEMR} className="w-full bg-blue-600 hover:bg-blue-700">Save Record & Print Prescription</Button>
      </div>  

      /* የቀኝ ክፍል - Medical Timeline Concept */
  /*    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Medical Timeline</h3>
        <div className="relative border-l border-gray-200 ml-3 space-y-6">
          <div className="mb-4 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">🩺</span>
            <h4 className="font-semibold text-sm">Hypertension Follow-up</h4>
            <p className="text-xs text-gray-400">June 10, 2026 - Dr. Dawit</p>
          </div>
          <div className="mb-4 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">🧪</span>
            <h4 className="font-semibold text-sm">CBC Blood Test Routine</h4>
            <p className="text-xs text-gray-400">May 15, 2026 - Lab Tech</p>
          </div>
        </div>
      </div>
    </div>
  );
}

*/
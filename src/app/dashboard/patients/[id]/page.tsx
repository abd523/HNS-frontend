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
      {/* የግራው ክፍል - የሕክምና ታሪክ መመዝገቢያ */}
      <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border shadow-sm">
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

        {/* Dynamic Medicine Entry Section */}
        <div className="border-t pt-4 space-y-4">
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

      {/* የቀኝ ክፍል - Medical Timeline Concept */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
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
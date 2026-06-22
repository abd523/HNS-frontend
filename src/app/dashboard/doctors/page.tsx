"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Stethoscope, CheckCircle, XCircle, Loader2, Users } from "lucide-react";

// Grade 6 Type definitions for explicit doctor profile validation contracts
interface Doctor {
  id: number;
  doctor_name: string;
  specialization: string;
  license_number: string;
  is_available: boolean;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = () => {
    setLoading(true);
    API.get("doctors/")
      .then((res) => {
        // Grade 6 fix: Extract array blocks cleanly out of paginated database results wrappers (.results)
        setDoctors(res.data.results || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Staff loading issue:", err);
        setError("Failed to sync medical registry information with Render servers.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Grade 6 Feature: Interactive toggle allowing admins to quickly change availability on the fly
  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await API.patch(`doctors/${id}/`, { is_available: !currentStatus });
      // Update local state without hitting the server with a full reload
      setDoctors((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, is_available: !currentStatus } : doc))
      );
    } catch (err) {
      console.error("Failed to alter availability configuration:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Users className="text-blue-600 h-6 w-6" /> Medical Staff (Doctors)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage clinical availability and tracking registries.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-100 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      ) : doctors.length === 0 ? (
        // Grade 6 fix: Clean empty state visual feedback placeholder
        <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-300 stroke-[1.5]" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No physicians found</h3>
          <p className="mt-1 text-sm text-gray-500">Seed data or register clinical staff inside the system admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow duration-200 bg-white border border-gray-100 overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-4 pb-3 bg-gray-50/50">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  {/* Grade 6 fix: Use the clean, pre-serialized doctor_name field */}
                  <CardTitle className="text-base font-semibold text-gray-900 truncate">
                    {doctor.doctor_name.startsWith("Dr.") ? doctor.doctor_name : `Dr. ${doctor.doctor_name}`}
                  </CardTitle>
                  <p className="text-xs font-medium text-blue-600 mt-0.5 truncate">{doctor.specialization}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5 text-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-xs font-medium text-gray-500">License ID Registry</span>
                  <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {doctor.license_number}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-xs font-medium text-gray-500">Clinical Status</span>
                  <div className="flex items-center gap-3">
                    {doctor.is_available ? (
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-none shadow-none flex items-center gap-1 text-xs font-semibold px-2 py-0.5">
                        <CheckCircle className="h-3 w-3" /> On Duty
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none shadow-none flex items-center gap-1 text-xs font-semibold px-2 py-0.5">
                        <XCircle className="h-3 w-3" /> Out
                      </Badge>
                    )}
                    {/* Interactive Switch logic allowing real-time scheduling adjustments */}
                    <Switch
                      checked={doctor.is_available}
                      onCheckedChange={() => handleToggleAvailability(doctor.id, doctor.is_available)}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}




/*
"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, CheckCircle, XCircle } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    API.get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Medical Staff (Doctors)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor: any) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{`Dr. ${doctor.user?.first_name || 'Staff'} ${doctor.user?.last_name || ''}`}</CardTitle>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">License No:</span>
                <span className="font-mono text-gray-700">{doctor.license_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                {doctor.is_available ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> On Duty</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1"><XCircle className="h-3 w-3"/> Out of Office</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

*/
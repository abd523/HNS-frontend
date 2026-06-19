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
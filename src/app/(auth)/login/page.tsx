"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
// 1. አስፈላጊ የሆኑትን Imports እዚህ ላይ ጨምረናል
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. useRouter Hook እዚህ ጋር ስራ ላይ ውሏል
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  // 3. የነበረውን onSubmit በኤፒአይ ጥሪ ቀይረነዋል
  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setLoading(true);
    setError(null);
    try {
      // ወደ ባክኤንድ የጥሪ ሙከራ ማድረግ
      const response = await API.post("auth/login/", data);
      const { access, refresh } = response.data;

      // ቶክኖችን በሎካል ስቶሬጅ ማስቀመጥ
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // በተሳካ ሁኔታ ከገባ በኋላ ወደ ዳሽቦርድ መውሰድ
      router.push("/dashboard");
    } catch (err: any) {
      // ስህተት ካለ መልእክቱን ማሳየት
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">HMS Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <Input {...register("username")} type="text" className="mt-1" placeholder="john_doe" />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input {...register("password")} type="password" className="mt-1" placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full flex justify-center items-center" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
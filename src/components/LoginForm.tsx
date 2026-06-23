// components/Navbar.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (isPending) return <div>Loading portal...</div>;

  return (
    <nav className="flex justify-between p-4 bg-slate-900 text-white">
      <span>Pulse OS Center</span>
      {session ? (
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user.name} ({session.user.role})</span>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-sm">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={() => router.push("/login")}>Login</button>
      )}
    </nav>
  );
}
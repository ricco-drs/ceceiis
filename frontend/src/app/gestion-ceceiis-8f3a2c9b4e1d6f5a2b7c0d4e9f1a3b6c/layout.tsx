"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Lock, LogOut, ShieldCheck, KeyRound, Loader2, List, BarChart2, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN } from "@/lib/routes";

const ADMIN_EMAIL = "admin@ceceiis.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError("Contraseña incorrecta.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center font-sans">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-[6px] border-slate-100 border-t-[#2B78C5] rounded-full animate-spin"></div>
          <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-16 h-16 object-contain relative z-10" />
        </div>
        <p className="mt-8 text-xs font-black text-[#0F172A] uppercase tracking-[0.4em] animate-pulse">
          Cargando Panel
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        {/* Header with centered logo */}
        <header className="bg-white border-b-[10px] border-[#0F172A]">
          <div className="w-full flex items-center justify-center py-4">
            <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-[140px] sm:w-[160px] h-auto object-contain" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden">
              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-300 rounded-md text-[#0F172A] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F172A] transition-all font-mono"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold py-3 px-4 rounded-md flex items-center gap-3 animate-shake">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-md transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Ingresar"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.2s ease-in-out 0s 2;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200 flex flex-col">
      {/* Official Admin Header */}
      <header className="bg-white border-b-[10px] border-[#0F172A] sticky top-0 z-50 shadow-sm">
        <div className="w-full flex flex-col lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex items-center gap-4 pl-4 sm:pl-8 h-full py-2">
            <div className="flex flex-col items-center justify-center py-2">
              <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-[120px] sm:w-[140px] h-auto object-contain" />
            </div>
            <div className="flex flex-col justify-center pl-2 h-10">
              <span className="text-[#0F172A] font-black text-[13px] leading-tight uppercase">Elecciones</span>
              <span className="text-[#0F172A] font-black text-[13px] leading-tight uppercase">Generales</span>
              <div className="mt-0.5 border border-blue-300 rounded px-1.5 py-0.5 w-fit bg-blue-50/50">
                <span className="text-[9px] text-[#2B78C5] font-bold tracking-tight block uppercase">Panel de Administración</span>
              </div>
            </div>
          </div>

          <nav className="flex items-stretch justify-end flex-1">
            {/* Admin Tabs */}
            <Link
              href={ADMIN.listas}
              className={`flex items-center justify-center gap-2.5 px-10 py-2.5 transition-colors border-l ${pathname.includes('/listas') ? "bg-[#2B78C5] text-white border-[#2B78C5]" : "bg-white text-[#0F172A] hover:bg-slate-50 border-slate-200"}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">Listas</span>
            </Link>

            <Link
              href={ADMIN.conteo}
              className={`flex items-center justify-center gap-2.5 px-10 py-2.5 transition-colors border-l ${pathname.includes('/conteo') ? "bg-[#2B78C5] text-white border-[#2B78C5]" : "bg-white text-[#0F172A] hover:bg-slate-50 border-slate-200"}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">Conteo</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2.5 px-8 py-2.5 bg-white text-[#0F172A] hover:bg-red-50 hover:text-red-600 transition-colors border-l border-slate-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto pt-10 px-4 sm:px-8 pb-10">
        {children}
      </main>
    </div>
  );
}

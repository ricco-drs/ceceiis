"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { electionLists as fallbackLists } from "@/mock/data";
import { fetchElectionLists } from "@/lib/firebase-service";
import { Users as UsersIcon, FileText as FileTextIcon, ChevronLeft as ChevronLeftIcon, Loader2 as LoaderIcon } from "lucide-react";
import Link from "next/link";
import type { AdminList } from "@/types/admin";
import { driveImageUrl } from "@/lib/drive-utils";

export default function ListaClient({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<AdminList | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const firestoreLists = await fetchElectionLists();
      const finalLists = firestoreLists.length > 0 ? firestoreLists : fallbackLists as unknown as AdminList[];
      const found = finalLists.find((l) => l.id === id);
      setList(found || null);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <LoaderIcon className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-bold uppercase tracking-widest">Cargando detalles...</p>
      </div>
    );
  }

  if (!list) {
    notFound();
    return null;
  }

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-200 min-h-screen flex flex-col">
      <header className="bg-white border-b-[10px] border-[#0F172A] sticky top-0 z-50">
        <div className="w-full flex flex-col lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex items-center gap-4 pl-4 sm:pl-8 h-full">
            <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex flex-col items-center justify-center py-2">
              <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-[140px] sm:w-[160px] h-auto object-contain" />
            </div>
            <div className="flex flex-col justify-center pl-2 h-10">
              <span className="text-[#0F172A] font-black text-[13px] leading-tight uppercase">Elecciones</span>
              <span className="text-[#0F172A] font-black text-[13px] leading-tight uppercase">Generales</span>
              <div className="mt-0.5 border border-blue-300 rounded-none px-1.5 py-0.5 w-fit bg-blue-50/50">
                <span className="text-[9px] text-[#2B78C5] font-bold tracking-tight block uppercase">FIIS - UNI 2026</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 sm:px-8 py-2 lg:py-0 border-t lg:border-t-0 lg:border-l border-slate-200">
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-white border border-slate-100 p-1">
              <img src={list.logo} alt={list.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#0F172A] text-sm hidden sm:block truncate max-w-[200px] leading-tight">{list.name}</span>
              <span className="text-[9px] font-bold text-[#2B78C5] uppercase tracking-tighter hidden sm:block">
                {list.members.find(m => m.role === "Presidente")?.name || "Sin candidato"}
              </span>
            </div>
            <a
              href="/plan-de-trabajo.pdf"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2B78C5] hover:bg-[#1e5d9e] text-white text-xs font-bold transition-colors ml-auto lg:ml-2"
            >
              <FileTextIcon className="w-4 h-4" />
              Plan de Trabajo
            </a>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-8 py-6 bg-white flex-1">
        <div className="flex items-center gap-3 mb-4 pl-2">
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white border border-slate-100 p-1 shadow-sm">
            <img src={list.logo} alt={list.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Agrupación Estudiantil</p>
            <h1 className="text-[22px] text-[#0F172A] tracking-tight font-black leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
              {list.name}
            </h1>
            <p className="text-[11px] font-bold text-[#2B78C5] uppercase tracking-wide">
              Postulante a la Presidencia: {list.members.find(m => m.role === "Presidente")?.name || "Sin candidato"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5 mb-6">
          <h2 className="text-xl font-black text-[#0F172A] leading-tight mb-4 pb-2 border-b border-slate-200">Presentación</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {list.presentation || "Sin presentación disponible."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5">
          <div className="mb-8">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Lista de candidatos</p>
          </div>

          {[
            {
              label: "Presidencia",
              roles: ["Presidente", "Vicepresidente", "Segundo Vicepresidente"],
            },
            {
              label: "Coordinadores de Especialidad",
              roles: ["Coordinador Industrial", "Coordinador Sistemas", "Coordinador Software"],
            },
            {
              label: "Coordinadores de Actividades",
              roles: ["Coordinador de Deportes", "Coordinador de Cultura"],
            },
            {
              label: "Coordinadores de Comunicaciones",
              roles: ["Prensa", "Relaciones Publicas"],
            },
          ].map(({ label, roles }) => {
            const members = list.members.filter((m) => roles.includes(m.role));
            if (members.length === 0) return null;
            return (
              <div key={label} className="mb-10 last:mb-0">
                <h2 className="text-xl font-black text-[#0F172A] leading-tight mb-4 pb-2 border-b border-slate-200">{label}</h2>

                <div className="flex flex-wrap justify-center gap-4">
                  {members.map((member) => (
                    <article
                      key={`${list.id}-${member.role}`}
                      className="bg-white border border-slate-200 p-4 flex flex-col hover:border-[#2B78C5] transition-colors group w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
                    >
                      <div className="flex gap-3 items-start mb-4">
                        <div className="w-16 h-16 rounded-none bg-slate-100 border-2 border-slate-200 group-hover:border-[#2B78C5] overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors">
                          {member.photo ? (
                            <img src={driveImageUrl(member.photo)} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <UsersIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="text-base font-black text-[#0F172A] leading-tight break-words">{member.name || "Sin nombre"}</h3>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-100">
                        <div className="mb-3">
                          <h4 className="text-[10px] font-bold text-[#2B78C5] uppercase tracking-wider mb-1">Cargo Postulante</h4>
                          <p className="text-sm font-bold text-slate-800">{member.role}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Ciclo</span>
                            <span className="font-semibold">{member.cycle || "N/A"}</span>
                          </div>
                          <div className="w-px h-6 bg-slate-200"></div>
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Especialidad</span>
                            <span className="font-semibold">{member.specialty || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="w-full bg-[#083262] text-white py-8 px-4 sm:px-8 text-[13px] font-sans border-t border-slate-700">
        <div className="w-full flex flex-col md:flex-row justify-between gap-6 md:gap-4 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[#F5A623] font-semibold tracking-wide">Oficina Central</span>
            <span className="text-slate-200">El tercio estudiantil xd</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#F5A623] font-semibold tracking-wide">Escríbenos</span>
            <span className="text-slate-200">ccunicode@gmail.com</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#F5A623] font-semibold tracking-wide">Central Telefónica</span>
            <span className="text-slate-200 text-[11px]">900 830 958 - 917 732 568 - 926 776 359</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

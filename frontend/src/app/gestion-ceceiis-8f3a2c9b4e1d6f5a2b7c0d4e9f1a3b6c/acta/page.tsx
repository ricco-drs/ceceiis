"use client";

import { useState, useEffect } from "react";
import { getListas, getConteo, isEffectivelyLocked, setLocked } from "@/lib/admin-storage";
import type { AdminList, ConteoState } from "@/types/admin";
import Link from "next/link";
import { ArrowLeft, Printer, Lock, AlertTriangle } from "lucide-react";
import { ADMIN } from "@/lib/routes";

export default function ActaPage() {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useState<AdminList[]>([]);
  const [conteo, setConteo] = useState<ConteoState>({ electoresHabiles: "", votantes: "", votes: {} });
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [fechaDia, setFechaDia] = useState("");
  const [mesaN, setMesaN] = useState("");
  const [mesaFirmas, setMesaFirmas] = useState([
    { nombres: "", apellidos: "", dni: "" },
    { nombres: "", apellidos: "", dni: "" },
    { nombres: "", apellidos: "", dni: "" },
  ]);
  const [personeroFirmas, setPersoneroFirmas] = useState<{ nombres: string; apellidos: string; dni: string }[]>([]);
  const [locked, setLockedState] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loaded = getListas();
    setLists(loaded);
    setConteo(getConteo());
    setLockedState(isEffectivelyLocked());
    const now = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    const hoyStr = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
    setFechaInicio(now);
    setFechaFin(now);
    setFechaDia(hoyStr);
    setPersoneroFirmas(loaded.map(() => ({ nombres: "", apellidos: "", dni: "" })));
  }, []);

  if (!mounted) return null;

  const handleConfirmPrint = () => {
    setLocked();
    setLockedState(true);
    setShowConfirmModal(false);
    setTimeout(() => window.print(), 150);
  };

  const electoresNum = parseInt(conteo.electoresHabiles) || 0;
  const blanco = conteo.votes["blanco"] || 0;
  const nulo = conteo.votes["nulo"] || 0;
  const listVotes = lists.map((l) => ({ ...l, votes: conteo.votes[l.id] || 0 }));
  const totalEmitidos = listVotes.reduce((a, l) => a + l.votes, 0) + blanco + nulo;

  const cellCls = "border border-black px-2 py-1";
  const inputCls = `bg-transparent border-b border-black outline-none font-bold print:pointer-events-none ${locked ? "cursor-not-allowed opacity-70" : ""}`;

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Barra de control — solo pantalla */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white flex items-center justify-between px-6 py-3">
        <Link href={ADMIN.conteo} className="flex items-center gap-2 text-sm font-bold hover:text-blue-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al conteo
        </Link>
        <div className="flex items-center gap-3">
          {locked && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              Acta bloqueada
            </span>
          )}
          <button
            onClick={() => locked ? window.print() : setShowConfirmModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B78C5] hover:bg-[#1e5d9e] text-white text-sm font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Hoja del acta */}
      <div className="print:mt-0 mt-16 flex justify-center bg-slate-200 min-h-screen py-8 print:bg-[#fffdf5] print:py-0">
        <div
          className="bg-[#fffdf5] border border-slate-300 print:border-0 shadow-lg print:shadow-none w-[210mm] min-h-[297mm] p-8 print:p-10 text-black text-[11px] font-sans"
          style={{ fontFamily: "Arial, sans-serif", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
        >
          {/* Encabezado */}
          <div className="flex items-start justify-between mb-2 border-b-2 border-black pb-2">
            <div className="flex items-center gap-3">
              <img src="/images/ceceiis.png" alt="CECEIIS" className="h-16 object-contain" />
            </div>
            <div className="text-center flex-1 px-4">
              <p className="font-bold text-[13px] uppercase tracking-wide">Elecciones Generales FIIS - UNI 2026</p>
              <p className="font-black text-[22px] uppercase tracking-tight leading-tight">Acta Electoral</p>
              <div className="flex items-center justify-center gap-4 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wide">Total de Electores Hábiles</span>
                <span className="border-2 border-black px-3 py-0.5 text-[16px] font-black">{electoresNum || "___"}</span>
              </div>
            </div>
            <div className="text-right text-[10px]">
              <div className="border-2 border-black px-3 py-1 mb-1">
                <p className="text-[9px] font-bold uppercase tracking-wide">Mesa de Sufragio N°</p>
                <input
                  value={mesaN}
                  onChange={(e) => !locked && setMesaN(e.target.value)}
                  readOnly={locked}
                  className={`${inputCls} text-[18px] w-24 text-center`}
                  placeholder="______"
                />
              </div>
            </div>
          </div>

          {/* Datos de ubicación */}
          <div className="border border-black mb-3 text-[10px] px-2 py-1 text-center">
            <span className="font-bold uppercase tracking-wide block">Facultad</span>
            <span className="font-black">FIIS - UNI</span>
          </div>

          {/* Título sección */}
          <div className="flex items-center gap-3 mb-2">
            <div className="border-2 border-black w-7 h-7 flex items-center justify-center font-black text-[13px]">C</div>
            <span className="font-black text-[14px] uppercase tracking-wide">Acta de Escrutinio</span>
          </div>

          {/* Hora inicio */}
          <p className="mb-1 text-[11px]">
            Siendo las{" "}
            <input
              value={fechaInicio}
              onChange={(e) => !locked && setFechaInicio(e.target.value)}
              readOnly={locked}
              className={`${inputCls} w-16 text-center`}
            />{" "}
            del{" "}
            <input
              value={fechaDia}
              onChange={(e) => !locked && setFechaDia(e.target.value)}
              readOnly={locked}
              className={`${inputCls} w-44 text-center`}
            />, se inició el <span className="font-bold uppercase">Acto de Escrutinio</span>.
          </p>
          <p className="mb-3 text-[10px] italic">
            Escribir con números y letras legibles.
          </p>

          {/* Tabla de votos */}
          <table className="w-full border-collapse mb-3">
            <thead>
              <tr className="bg-[#d0d0d0]">
                <th className={`${cellCls} text-left font-black uppercase tracking-wide text-[10px]`}>
                  Organizaciones Políticas
                </th>
                <th className={`${cellCls} text-center font-black uppercase tracking-wide text-[10px] w-28`}>
                  Total de Votos
                </th>
              </tr>
            </thead>
            <tbody>
              {listVotes.map((list, i) => (
                <tr key={list.id} className={i % 2 === 1 ? "bg-[#e8e8e8]" : ""}>
                  <td className={cellCls}>
                    <div className="flex items-center gap-3 min-h-[36px]">
                      {list.logo ? (
                        <img src={list.logo} alt={list.name} className="h-8 w-8 object-contain flex-shrink-0" />
                      ) : (
                        <div className="h-8 w-8 bg-slate-200 flex-shrink-0" />
                      )}
                      <span className="font-bold uppercase text-[11px]">{list.name}</span>
                    </div>
                  </td>
                  <td className={`${cellCls} text-right`}>
                    <span className="text-[22px] font-black text-[#c0392b]">{list.votes || ""}</span>
                  </td>
                </tr>
              ))}
              <tr className="h-2"><td colSpan={2}></td></tr>
              <tr>
                <td className={`${cellCls} font-bold uppercase text-[11px] tracking-wide`}>Votos en Blanco</td>
                <td className={`${cellCls} text-right`}>
                  <span className="text-[22px] font-black text-[#c0392b]">{blanco || ""}</span>
                </td>
              </tr>
              <tr>
                <td className={`${cellCls} font-bold uppercase text-[11px] tracking-wide`}>Votos Nulos</td>
                <td className={`${cellCls} text-right`}>
                  <span className="text-[22px] font-black text-[#c0392b]">{nulo || ""}</span>
                </td>
              </tr>
              <tr className="bg-[#d0d0d0]">
                <td className={`${cellCls} font-black uppercase text-[11px] tracking-wide`}>Total de Votos Emitidos →</td>
                <td className={`${cellCls} text-right`}>
                  <span className="text-[22px] font-black">{totalEmitidos || ""}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Observaciones */}
          <div className="border border-black p-2 mb-3">
            <p className="font-black uppercase text-[10px] tracking-wide mb-1">Observaciones →</p>
            <textarea
              rows={3}
              readOnly={locked}
              className={`w-full bg-transparent outline-none resize-none text-[11px] leading-6 print:pointer-events-none ${locked ? "cursor-not-allowed opacity-70" : ""}`}
              placeholder="Escribir observaciones aquí..."
              style={{ borderBottom: "1px dotted black" }}
            />
          </div>

          {/* Hora fin */}
          <p className="mb-4 text-[11px]">
            Siendo las{" "}
            <input
              value={fechaFin}
              onChange={(e) => !locked && setFechaFin(e.target.value)}
              readOnly={locked}
              className={`${inputCls} w-16 text-center`}
            />{" "}
            finalizó el <span className="font-bold uppercase">Acto de Escrutinio</span>.
          </p>

          {/* Firmas miembros de mesa */}
          <p className="font-black uppercase text-[10px] tracking-wide mb-3 border-b border-black pb-1">
            Firma, Nombres, Apellidos y DNI de Miembros de Mesa (obligatorio)
          </p>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {(["Presidente de Mesa", "Primer Secretario", "Segundo Secretario"] as const).map((cargo, i) => (
              <div key={cargo} className="flex flex-col gap-1">
                <div className="h-14 border-b-2 border-black"></div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-center">{cargo}</p>
                <div className="flex flex-col gap-1 mt-1">
                  {(["nombres", "apellidos", "dni"] as const).map((field) => (
                    <div key={field} className="flex items-end gap-1 text-[9px]">
                      <span className="font-bold flex-shrink-0 capitalize">{field}:</span>
                      <input
                        value={mesaFirmas[i][field]}
                        readOnly={locked}
                        onChange={(e) => {
                          if (locked) return;
                          const updated = mesaFirmas.map((m, j) => j === i ? { ...m, [field]: e.target.value } : m);
                          setMesaFirmas(updated);
                        }}
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Firmas personeros */}
          <p className="font-black uppercase text-[10px] tracking-wide mb-3 border-b border-black pb-1">
            Firma y Datos de Personeros
          </p>
          <div className="grid grid-cols-3 gap-4">
            {listVotes.map((list, i) => (
              <div key={list.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  {list.logo ? (
                    <img src={list.logo} alt={list.name} className="h-5 w-5 object-contain" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-200" />
                  )}
                  <span className="text-[9px] font-black uppercase">{list.name}</span>
                </div>
                <div className="h-12 border-b-2 border-black"></div>
                <div className="flex flex-col gap-1 mt-1">
                  {(["nombres", "apellidos", "dni"] as const).map((field) => (
                    <div key={field} className="flex items-end gap-1 text-[9px]">
                      <span className="font-bold flex-shrink-0 capitalize">{field}:</span>
                      <input
                        value={personeroFirmas[i]?.[field] ?? ""}
                        readOnly={locked}
                        onChange={(e) => {
                          if (locked) return;
                          const updated = personeroFirmas.map((p, j) => j === i ? { ...p, [field]: e.target.value } : p);
                          setPersoneroFirmas(updated);
                        }}
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="print:hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F172A] leading-tight">¿Imprimir el acta?</h3>
                <p className="text-slate-500 text-sm mt-1">Esta acción es irreversible.</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm mb-6 bg-amber-50 border border-amber-200 px-4 py-3">
              Una vez impresa, <strong>ningún dato podrá ser modificado</strong>: ni los votos del conteo, ni los datos del acta, ni la información de las listas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-6 py-2 bg-[#0F172A] hover:bg-[#1e293b] text-white font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Sí, imprimir y bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

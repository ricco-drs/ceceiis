"use client";

import { useState, useEffect } from "react";
import { getListas, getConteo, saveConteo, isEffectivelyLocked } from "@/lib/admin-storage";
import { publishResults, fetchElectionLists, fetchElectionData } from "@/lib/firebase-service";
import type { AdminList, ConteoState } from "@/types/admin";
import type { ActSummary, ListResult } from "@/mock/data";
import { Plus, Printer, X, Lock, RotateCcw, Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN } from "@/lib/routes";

interface ModalState {
  open: boolean;
  targetId: string;
  targetName: string;
}

export default function ConteoPage() {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useState<AdminList[]>([]);
  const [state, setState] = useState<ConteoState>({ electoresHabiles: "", votantes: "", votes: {} });
  const [modal, setModal] = useState<ModalState>({ open: false, targetId: "", targetName: "" });
  const [locked, setLocked] = useState(false);
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const [storedLists, firestoreData] = await Promise.all([
        fetchElectionLists(),
        fetchElectionData()
      ]);

      // Use Firestore lists if available, fallback to local storage
      const finalLists = storedLists.length > 0 ? storedLists : getListas();
      setLists(finalLists);

      // If we have data in Firestore, use it. Otherwise fallback to LocalStorage
      if (firestoreData) {
        // Convert Firestore data back to ConteoState format
        const firestoreVotes: Record<string, number> = {};
        firestoreData.results.forEach(r => {
          firestoreVotes[r.id] = r.votes;
        });

        setState({
          electoresHabiles: firestoreData.summary.eligible.toString(),
          votantes: firestoreData.summary.total.toString(),
          votes: firestoreVotes
        });
      } else {
        setState(getConteo());
      }

      setLocked(isEffectivelyLocked());
      setLoading(false);
    };
    loadData();
  }, []);

  if (!mounted || loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-none border border-slate-100 shadow-sm">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-[4px] border-slate-100 border-t-[#2B78C5] rounded-full animate-spin"></div>
        <img src="/images/ceceiis.png" alt="Logo" className="w-12 h-12 object-contain relative z-10" />
      </div>
      <p className="mt-6 text-[10px] font-black text-[#0F172A] uppercase tracking-[0.3em] animate-pulse">
        Cargando Datos
      </p>
    </div>
  );

  const update = (patch: Partial<ConteoState>) => {
    if (locked) return;
    const next = { ...state, ...patch };
    setState(next);
    saveConteo(next);
  };

  const openModal = (id: string, name: string) => {
    if (locked) return;
    setModal({ open: true, targetId: id, targetName: name });
  };

  const confirmVote = async () => {
    const updatedVotes = { ...state.votes, [modal.targetId]: (state.votes[modal.targetId] || 0) + 1 };
    
    // Update local state
    const nextState = { ...state, votes: updatedVotes };
    setState(nextState);
    saveConteo(nextState);
    setModal({ open: false, targetId: "", targetName: "" });

    // AUTOMATIC SYNC TO WEB PRINCIPAL
    const totalCounted = Object.values(updatedVotes).reduce((a, b) => a + b, 0);
    const blancos = updatedVotes["blanco"] || 0;
    const nulos = updatedVotes["nulo"] || 0;
    const votosValidos = totalCounted - blancos - nulos;

    const summary: ActSummary = {
      counted: totalCounted,
      observed: 0,
      missing: votantesNum - totalCounted,
      total: votantesNum,
      eligible: electoresNum,
      percentage: votantesNum > 0 ? (totalCounted / votantesNum) * 100 : 0,
      lastUpdated: new Date().toISOString(),
    };

    const results: ListResult[] = lists.map(l => {
      const president = l.members.find(m => m.role === "Presidente");
      const listVotes = updatedVotes[l.id] || 0;
      return {
        id: l.id,
        name: l.name,
        presidentName: president?.name || "Sin candidato",
        acronym: l.id.split('-')[1]?.toUpperCase() || l.id.substring(0, 3).toUpperCase(),
        color: (l as any).color || "#2B78C5",
        votes: listVotes,
        percentage: votosValidos > 0 ? (listVotes / votosValidos) * 100 : 0,
        logo: l.logo,
        candidateImage: president?.photo || l.logo,
      };
    });

    await publishResults(summary, results);
  };

  const electoresNum = parseInt(state.electoresHabiles) || 0;
  const votantesNum = parseInt(state.votantes) || 0;
  const noVotantes = electoresNum - votantesNum;
  const totalContado = Object.values(state.votes).reduce((a, b) => a + b, 0);

  const participacionValida = electoresNum > 0 && votantesNum >= 0 && noVotantes >= 0;
  const conteoValido = votantesNum > 0 && totalContado === votantesNum;
  const puedeImprimir = participacionValida && conteoValido;

  const allTargets = [
    ...lists.map((l) => ({ id: l.id, name: l.name, logo: l.logo, fixed: false })),
    { id: "blanco", name: "Voto en Blanco", logo: "", fixed: true, label: "BL", color: "#64748B" },
    { id: "nulo", name: "Voto Nulo", logo: "", fixed: true, label: "NU", color: "#EF4444" },
  ];

  const inputCls = "border border-slate-200 px-3 py-2 text-3xl font-black text-[#0F172A] outline-none focus:border-[#2B78C5] w-full bg-white";

  return (
    <div className="flex flex-col gap-6">
      {locked && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-300 text-amber-800 text-sm font-bold">
          <Lock className="w-4 h-4 flex-shrink-0" />
          El acta fue impresa. No se pueden realizar más cambios en el conteo ni en los datos.
        </div>
      )}
      {/* Participación */}
      <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5">
        <h2 className="text-xl font-black text-[#0F172A] pb-2 border-b border-slate-200 mb-5">
          Participación Electoral
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Electores Hábiles</p>
            <input
              type="number"
              min={0}
              value={state.electoresHabiles}
              onChange={(e) => update({ electoresHabiles: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Votaron</p>
            <input
              type="number"
              min={0}
              value={state.votantes}
              onChange={(e) => update({ votantes: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">No Votaron</p>
            <div className="border border-slate-100 bg-slate-50 px-3 py-2 text-3xl font-black text-slate-400">
              {electoresNum > 0 ? (noVotantes >= 0 ? noVotantes : <span className="text-red-400 text-xl">Inválido</span>) : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={async () => {
              if (locked) return;
              const totalCounted = Object.values(state.votes).reduce((a, b) => a + b, 0);
              const blancos = state.votes["blanco"] || 0;
              const nulos = state.votes["nulo"] || 0;
              const votosValidos = totalCounted - blancos - nulos;
              const vNum = parseInt(state.votantes) || 0;

              const summary: ActSummary = {
                counted: totalCounted,
                observed: 0,
                missing: vNum - totalCounted,
                total: vNum,
                eligible: electoresNum,
                percentage: vNum > 0 ? (totalCounted / vNum) * 100 : 0,
                lastUpdated: new Date().toISOString(),
              };

              const results: ListResult[] = lists.map(l => {
                const president = l.members.find(m => m.role === "Presidente");
                const listVotes = state.votes[l.id] || 0;
                return {
                  id: l.id, name: l.name,
                  presidentName: president?.name || "Sin candidato",
                  acronym: l.id.split('-')[1]?.toUpperCase() || l.id.substring(0, 3).toUpperCase(),
                  color: (l as any).color || "#2B78C5",
                  votes: listVotes,
                  percentage: votosValidos > 0 ? (listVotes / votosValidos) * 100 : 0,
                  logo: l.logo,
                  candidateImage: president?.photo || l.logo,
                };
              });

              await publishResults(summary, results);
              setSynced(true);
              setTimeout(() => setSynced(false), 2000);
            }}
            disabled={locked}
            className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold transition-colors ${synced ? "bg-green-600" : "bg-[#2B78C5] hover:bg-[#1e5d9e] disabled:bg-slate-300"}`}
          >
            {synced ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {synced ? "Guardado" : "Guardar"}
          </button>
        </div>
      </div>

      {/* Conteo de votos */}
      <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-[#0F172A]">Conteo de Votos</h2>
            <div className={`px-3 py-1 text-xs font-bold transition-colors ${totalContado === votantesNum ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
              {totalContado} / {votantesNum} votos registrados
            </div>
          </div>
          {!locked && (
            <button
              onClick={async () => {
                if (!confirm("⚠️ ¿Estás seguro de reiniciar TODOS los votos a 0? Esta acción no se puede deshacer.")) return;
                const resetState: ConteoState = { electoresHabiles: state.electoresHabiles, votantes: state.votantes, votes: {} };
                setState(resetState);
                saveConteo(resetState);
                // Sync reset to Firebase
                const summary: ActSummary = {
                  counted: 0,
                  observed: 0,
                  missing: votantesNum,
                  total: votantesNum,
                  eligible: electoresNum,
                  percentage: 0,
                  lastUpdated: new Date().toISOString(),
                };
                const results: ListResult[] = lists.map(l => {
                  const president = l.members.find(m => m.role === "Presidente");
                  return {
                    id: l.id, name: l.name,
                    presidentName: president?.name || "Sin candidato",
                    acronym: l.id.split('-')[1]?.toUpperCase() || l.id.substring(0, 3).toUpperCase(),
                    color: (l as any).color || "#2B78C5",
                    votes: 0, percentage: 0,
                    logo: l.logo,
                    candidateImage: president?.photo || l.logo,
                  };
                });
                await publishResults(summary, results);
                alert("✅ Votos reiniciados a 0.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-wide transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Todo
            </button>
          )}
        </div>

        {lists.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            No hay listas inscritas. Ve a <strong>Listas</strong> para registrarlas primero.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTargets.map((target) => {
            const count = state.votes[target.id] || 0;
            const pct = votantesNum > 0 ? (count / votantesNum) * 100 : 0;
            const barColor = (target as any).color ?? "#2B78C5";
            return (
              <div key={target.id} className="border border-slate-200 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex-shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center"
                    style={(target as any).fixed ? { backgroundColor: (target as any).color } : { backgroundColor: "#f1f5f9" }}
                  >
                    {(target as any).fixed ? (
                      <span className="text-xs font-black text-white">{(target as any).label}</span>
                    ) : target.logo ? (
                      <img src={target.logo} alt={target.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-400">{target.name?.[0]}</span>
                    )}
                  </div>
                  <span className="font-black text-[#0F172A] text-sm leading-tight">{target.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-4xl font-black text-[#0F172A]">{count.toLocaleString("es-PE")}</span>
                  <button
                    onClick={() => openModal(target.id, target.name)}
                    disabled={locked}
                    className={`w-11 h-11 flex items-center justify-center text-white transition-colors flex-shrink-0 ${locked ? "bg-slate-300 cursor-not-allowed" : "bg-[#2B78C5] hover:bg-[#1e5d9e]"}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <div className="h-1.5 bg-slate-100 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{pct.toFixed(1)}% de los votantes</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón imprimir */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            disabled={!puedeImprimir}
            onClick={() => router.push(ADMIN.acta)}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors ${puedeImprimir ? "bg-[#0F172A] hover:bg-[#1e293b] text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            <Printer className="w-4 h-4" />
            Confirmar e Imprimir Acta
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setModal({ open: false, targetId: "", targetName: "" })}
        >
          <div
            className="bg-white p-6 max-w-sm w-full shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-black text-[#0F172A]">Confirmar voto</h3>
              <button
                onClick={() => setModal({ open: false, targetId: "", targetName: "" })}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              ¿Estás seguro de que deseas agregar <strong>1 voto</strong> a{" "}
              <strong className="text-[#0F172A]">{modal.targetName}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal({ open: false, targetId: "", targetName: "" })}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmVote}
                className="px-6 py-2 bg-[#2B78C5] hover:bg-[#1e5d9e] text-white font-bold text-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

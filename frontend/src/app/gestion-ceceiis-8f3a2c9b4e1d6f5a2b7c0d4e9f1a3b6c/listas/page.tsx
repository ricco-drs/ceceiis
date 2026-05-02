"use client";

import { useState, useEffect } from "react";
import { electionRoles, electionLists as defaultLists, mockSummary, mockResults } from "@/mock/data";
import { getListas, saveListas } from "@/lib/admin-storage";
import { saveElectionLists, fetchElectionLists, publishResults } from "@/lib/firebase-service";
import type { AdminList, AdminMember } from "@/types/admin";
import { Plus, Trash2, Save, ChevronRight, Check, Users, Loader2, Globe, ClipboardPaste } from "lucide-react";
import { driveImageUrl } from "@/lib/drive-utils";

const defaultMembers = (): AdminMember[] =>
  electionRoles.map((role) => ({ role, name: "", codigo: "", specialty: "", cycle: "", photo: "" }));

const newList = (): AdminList => ({
  id: Date.now().toString(),
  name: "",
  acronym: "",
  color: "#2B78C5",
  logo: "",
  presentation: "",
  members: defaultMembers(),
});

export default function AdminListasPage() {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useState<AdminList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminList>(newList());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const stored = await fetchElectionLists();
      // If Firestore is empty, fallback to local storage
      const finalLists = stored.length > 0 ? stored : getListas();
      setLists(finalLists);
      if (finalLists.length > 0) {
        setSelectedId(finalLists[0].id);
        setForm(finalLists[0]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (!mounted || loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-[4px] border-slate-100 border-t-[#2B78C5] rounded-full animate-spin"></div>
        <img src="/images/ceceiis.png" alt="Logo" className="w-12 h-12 object-contain relative z-10" />
      </div>
      <p className="mt-6 text-[10px] font-black text-[#0F172A] uppercase tracking-[0.3em] animate-pulse">
        Cargando Datos
      </p>
    </div>
  );

  const handleSave = async () => {
    setSaved(false);
    const isNew = !lists.find((l) => l.id === form.id);
    const updated = isNew ? [...lists, form] : lists.map((l) => (l.id === form.id ? form : l));
    
    // Sync both for safety
    setLists(updated);
    saveListas(updated);
    await saveElectionLists(updated);
    
    setSelectedId(form.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const updated = lists.filter((l) => l.id !== selectedId);
    setLists(updated);
    saveListas(updated);
    await saveElectionLists(updated);
    
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
      setForm(updated[0]);
    } else {
      setSelectedId(null);
      setForm(newList());
    }
  };

  const handleSelect = (list: AdminList) => {
    setSelectedId(list.id);
    setForm(list);
    setSaved(false);
  };

  const handleNewList = () => {
    const l = newList();
    setForm(l);
    setSelectedId(null);
    setSaved(false);
  };

  const handleSyncToFirebase = async () => {
    if (!confirm("¿Deseas subir los 3 partidos ficticios y los datos iniciales a Firebase? Esto sobrescribirá la configuración actual en la nube.")) return;
    
    setLoading(true);
    await saveElectionLists(defaultLists as unknown as AdminList[]);
    await publishResults(mockSummary, mockResults);
    
    // Reload local state
    setLists(defaultLists as unknown as AdminList[]);
    saveListas(defaultLists as unknown as AdminList[]);
    setSelectedId(defaultLists[0].id);
    setForm(defaultLists[0] as unknown as AdminList);
    
    setLoading(false);
    alert("Datos sincronizados con éxito. Revisa tu consola de Firebase.");
  };

  const updateMember = (i: number, field: keyof AdminMember, value: string) => {
    const members = [...form.members];
    members[i] = { ...members[i], [field]: value };
    setForm({ ...form, members });
  };

  const inputCls = "border border-slate-200 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2B78C5] w-full bg-white";
  const labelCls = "text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5 block";

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 sticky top-24">
        <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)]">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Inscritas</p>
              <h2 className="text-lg font-black text-[#0F172A] leading-tight">Listas</h2>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleSyncToFirebase}
                title="Sincronizar con Firebase"
                className="w-8 h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={handleNewList}
                className="w-8 h-8 flex items-center justify-center bg-[#2B78C5] hover:bg-[#1e5d9e] text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {lists.length === 0 && (
            <p className="p-4 text-[11px] text-slate-400 text-center">Sin listas. Pulsa + para crear una.</p>
          )}

          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleSelect(list)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 text-left transition-colors ${list.id === (selectedId ?? form.id) && selectedId ? "bg-blue-50 border-l-4 border-l-[#2B78C5]" : "hover:bg-slate-50"}`}
            >
              <div className="w-7 h-7 flex-shrink-0 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {list.logo ? (
                  <img src={list.logo} alt={list.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-black text-slate-400">{list.name?.[0] || "?"}</span>
                )}
              </div>
              <span className="text-sm font-bold text-[#0F172A] truncate flex-1">{list.name || "Sin nombre"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </aside>

      {/* Form */}
      <div className="flex-1 bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-6">
        {/* Form header */}
        <div className="flex items-start justify-between mb-6 pb-3 border-b border-slate-200">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
              {selectedId ? "Editando" : "Nueva lista"}
            </p>
            <h2 className="text-2xl font-black text-[#0F172A] leading-tight">
              {form.name || "Sin nombre"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedId && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors ${saved ? "bg-green-600 text-white" : "bg-[#2B78C5] hover:bg-[#1e5d9e] text-white"}`}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? "Guardado" : "Guardar"}
            </button>
          </div>
        </div>

        {/* Información general */}
        <div className="mb-8">
          <h3 className="text-xl font-black text-[#0F172A] pb-2 border-b border-slate-200 mb-5">
            Información General
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className={labelCls}>Nombre de la Lista</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Ej: Innovación Estudiantil"
              />
            </div>
            <div>
              <label className={labelCls}>Logotipo (URL de imagen)</label>
              <div className="flex items-center gap-3">
                <input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  className={inputCls}
                  placeholder="https://..."
                />
                <div className="w-10 h-10 flex-shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {form.logo ? (
                    <img src={form.logo} alt="preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold text-center leading-tight">LOGO</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Presentación</label>
            <textarea
              value={form.presentation}
              onChange={(e) => setForm({ ...form, presentation: e.target.value })}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Describe la propuesta y misión de la lista..."
            />
          </div>
        </div>

        {/* Candidatos */}
        <div>
          <h3 className="text-xl font-black text-[#0F172A] pb-2 border-b border-slate-200 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Candidatos
          </h3>

          <div className="flex flex-col gap-3">
            {form.members.map((member, i) => (
              <div key={member.role} className="border border-slate-200 p-4">
                <p className="text-[10px] font-bold text-[#2B78C5] uppercase tracking-wider mb-3">
                  {member.role}
                </p>
                <div className="grid gap-3 grid-cols-[1.5fr_1fr_1.2fr_0.7fr_2fr]">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input
                      value={member.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      className={inputCls}
                      placeholder="Apellidos y nombres"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Código</label>
                    <input
                      value={member.codigo}
                      onChange={(e) => updateMember(i, "codigo", e.target.value)}
                      className={inputCls}
                      placeholder="20XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Especialidad</label>
                    <input
                      value={member.specialty}
                      onChange={(e) => updateMember(i, "specialty", e.target.value)}
                      className={inputCls}
                      placeholder="Ing. Sistemas"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Ciclo</label>
                    <input
                      value={member.cycle}
                      onChange={(e) => updateMember(i, "cycle", e.target.value)}
                      className={inputCls}
                      placeholder="2026-1"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>URL Foto</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        value={member.photo || ""}
                        onChange={(e) => updateMember(i, "photo", e.target.value)}
                        className={`${inputCls} text-xs`}
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) updateMember(i, "photo", text.trim());
                          } catch {
                            const text = prompt("Pega la URL de la foto aquí:");
                            if (text) updateMember(i, "photo", text.trim());
                          }
                        }}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#2B78C5] hover:bg-[#1e5d9e] text-white transition-colors"
                        title="Pegar URL desde el portapapeles"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-8 h-8 flex-shrink-0 border border-slate-200 rounded-full overflow-hidden flex items-center justify-center bg-white">
                        {member.photo ? (
                          <img
                            src={driveImageUrl(member.photo)}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://img.icons8.com/color/96/user.png";
                            }}
                          />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

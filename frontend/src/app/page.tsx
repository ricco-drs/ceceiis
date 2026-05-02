"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
} from "recharts";
import { Users, CheckCircle2, Clock, PieChart, BarChart3, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { mockSummary as initialSummary, mockResults as initialResults, electionLists as initialElectionLists, participationData as initialParticipationData } from "@/mock/data";
import { fetchElectionData, fetchElectionLists } from "@/lib/firebase-service";
import { driveImageUrl } from "@/lib/drive-utils";
import type { ActSummary, ListResult, ElectionList } from "@/mock/data";

type TabKey = "resultados" | "participacion" | "listas";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("resultados");
  const [activeListId, setActiveListId] = useState(initialElectionLists[0]?.id ?? "");

  const [summary, setSummary] = useState<ActSummary>(initialSummary);
  const [results, setResults] = useState<ListResult[]>(initialResults);
  const [lists, setLists] = useState<ElectionList[]>(initialElectionLists);
  const [participation, setParticipation] = useState(initialParticipationData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Fetch dynamic data from Firebase
    const loadData = async () => {
      const [data, firestoreLists] = await Promise.all([
        fetchElectionData(),
        fetchElectionLists()
      ]);

      if (data) {
        setSummary(data.summary);
        
        // Enrich results with names and photos from the list configuration
        const enrichedResults = data.results.map(r => {
          const listInfo = firestoreLists.find(l => l.id === r.id);
          const president = listInfo?.members.find((m: any) => m.role === "Presidente");
          return {
            ...r,
            presidentName: r.presidentName || president?.name || "Sin candidato",
            candidateImage: driveImageUrl(president?.photo || r.candidateImage || r.logo)
          };
        }).sort((a, b) => b.votes - a.votes);
        
        setResults(enrichedResults);
        
        // Reconstruct participation data: People who showed up vs Those who didn't
        setParticipation([
          { name: "Votaron", value: data.summary.total, color: "#0F172A" },
          { name: "No votaron", value: Math.max(0, data.summary.eligible - data.summary.total), color: "#CBD5E1" }
        ]);
      }

      if (firestoreLists && firestoreLists.length > 0) {
        setLists(firestoreLists as any);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!activeListId && lists[0]) {
      setActiveListId(lists[0].id);
    }
  }, [activeListId, lists]);

  if (!mounted || loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-[6px] border-slate-100 border-t-[#2B78C5] rounded-full animate-spin"></div>
          <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-16 h-16 object-contain relative z-10" />
        </div>
        <p className="mt-8 text-xs font-black text-[#0F172A] uppercase tracking-[0.4em] animate-pulse">
          Cargando Resultados
        </p>
      </div>
    );
  }

  const CustomBarShape = (props: any) => {
    const { x, y, width, height, index, onMouseEnter, onMouseLeave, payload } = props;
    const radius = 22;
    const isWinner = index === 0;
    const isHovered = hoveredBar === payload.acronym;
    const barColor = isHovered ? "#2B78C5" : "#7CB4E2";

    return (
      <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ cursor: 'pointer' }}>
        <rect x={x} y={y} width={width} height={height} fill={barColor} rx={4} ry={4} />
        <circle cx={x + width / 2} cy={y} r={radius + 2} fill="#ffffff" />
        <circle cx={x + width / 2} cy={y} r={radius} fill="#e2e8f0" />
        <defs>
          <clipPath id={`clip-${index}`}>
            <circle cx={x + width / 2} cy={y} r={radius} />
          </clipPath>
        </defs>
        <image
          href={payload.candidateImage}
          x={x + width / 2 - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          clipPath={`url(#clip-${index})`}
          preserveAspectRatio="xMidYMid slice"
        />

        {isHovered && (
          <foreignObject 
            x={x + width / 2 - 125} 
            y={y - 75} 
            width={250} 
            height={60}
            style={{ overflow: 'visible', pointerEvents: 'none' }}
          >
            <div className="flex flex-col items-center w-full h-full drop-shadow-md">
              <div className="bg-[#2B78C5] text-white px-4 py-2.5 text-center flex flex-col leading-tight whitespace-nowrap rounded-sm">
                <span className="text-[14px] font-black tracking-tight uppercase">{payload.presidentName}</span>
                <div className="h-px bg-white/20 w-full my-1" />
                <span className="text-[12px] font-bold tracking-wide uppercase">Cantidad de votos: {payload.votes.toLocaleString('es-PE')}</span>
                <span className="text-[10px] font-bold opacity-80 uppercase">{payload.percentage.toFixed(3)}% Votos válidos</span>
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#2B78C5]"></div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const result = results.find(r => r.acronym === payload.value);
    const color = result ? result.color : '#000';
    if (!result) return null;
    return (
      <g transform={`translate(${x - 20},${y + 5})`}>
        <rect width="40" height="40" fill="white" rx="4" />
        <image
          href={result.logo}
          x="2"
          y="2"
          width="36"
          height="36"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  };

  const activeList = lists.find((list) => list.id === activeListId) ?? lists[0];

  const participationValue = summary.eligible > 0 ? (summary.total / summary.eligible) * 100 : 0;
  const countingProgress = summary.total > 0 ? (summary.counted / summary.total) * 100 : 0;
  const participationChartData = participation;

  const renderTabContent = () => {
    if (activeTab === "participacion") {
      return (
        <div className="grid gap-6">
          <section className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Participación electoral</p>
                <h2 className="text-2xl font-black text-[#0F172A] leading-tight">Porcentaje que fue a votar</h2>
              </div>
              <div className="text-[11px] font-bold text-[#2B78C5]">
                Total: {(summary.eligible ?? 0).toLocaleString()} habilitados
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr] items-center">
              <div className="relative mx-auto h-[220px] w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={participationChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={100}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {participationChartData.map((entry, index) => (
                        <Cell key={`slice-${entry.name}`} fill={index === 0 ? "#0F172A" : "#CBD5E1"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => (typeof value === "number" ? value.toLocaleString("es-PE") : String(value ?? ""))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Participación</span>
                  <span className="text-[42px] font-black text-[#0F172A] leading-none">{participationValue.toFixed(1)}%</span>
                  <span className="text-[11px] font-semibold text-slate-500">Votaron {(summary.total ?? 0).toLocaleString()} de {(summary.eligible ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>Votaron</span>
                    <span className="text-[#0F172A]">{(summary.total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${participationValue}%` }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>No votaron</span>
                    <span className="text-slate-900">{((summary.eligible ?? 0) - (summary.total ?? 0)).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-400" style={{ width: `${100 - participationValue}%` }} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Personas que votaron</p>
                    <p className="mt-2 text-3xl font-black text-[#0F172A]">{summary.total ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">No votaron</p>
                    <p className="mt-2 text-3xl font-black text-[#0F172A]">{(summary.eligible ?? 0) - (summary.total ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Total Padrón</p>
                    <p className="mt-2 text-3xl font-black text-[#0F172A]">{summary.eligible ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>


        </div>
      );
    }

    if (activeTab === "listas") {
      return (
        <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] p-5">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Listas inscritas</p>
              <h2 className="text-2xl font-black text-[#0F172A] leading-tight">Agrupaciones Estudiantiles</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/listas/${list.id}`}
                target="_blank"
                className="group flex items-center gap-4 rounded border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-white border border-slate-100 p-1">
                  <img src={list.logo} alt={list.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-[#0F172A] text-lg leading-tight">{list.name}</h3>
                  <p className="text-[11px] font-bold text-[#2B78C5] uppercase tracking-wide">
                    {list.members.find(m => m.role === "Presidente")?.name || "Sin candidato"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white border border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.08)] w-full mb-6">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Votos contabilizados (Avance del conteo)</div>
              <div className="flex items-end gap-3 -mt-1">
                <div className="text-[44px] font-light text-[#0F172A] tracking-tighter leading-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {countingProgress.toFixed(3)} <span className="text-[28px]">%</span>
                </div>
                <div className="flex flex-col pb-1">
                  <span className="text-[13px] font-bold text-[#2B78C5]">Contabilizados: {(summary.counted ?? 0).toLocaleString()}</span>
                  <span className="text-[11px] text-[#7CB4E2] font-semibold">
                    Total de votos por contar: {(summary.total ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="h-[8px] w-full bg-blue-100 flex overflow-hidden mb-1">
              <div className="h-full bg-[#0F172A]" style={{ width: `${countingProgress}%` }}></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-slate-500 mt-1">
              <div className="font-semibold tracking-wide">ACTUALIZADO AL {new Date(summary.lastUpdated).toLocaleDateString('es-PE')} A LAS {new Date(summary.lastUpdated).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              <div className="flex gap-4 mt-2 md:mt-0 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#0F172A]"></div>
                  <span className="text-slate-600 font-medium">Contabilizados ({ (summary.counted ?? 0).toLocaleString()})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-slate-400 bg-white"></div>
                  <span className="text-slate-600 font-medium">Por contar ({(summary.missing ?? 0).toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full relative px-2">
          <div className="h-[400px] w-full outline-none focus:outline-none relative">
            <div className="absolute left-[35px] top-[20px] bottom-[35px] w-[1px] bg-[#CBD5E1] pointer-events-none z-10"></div>

            <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
              <BarChart
                data={results}
                style={{ outline: 'none' }}
                margin={{ top: 30, right: 10, left: 10, bottom: 60 }}
                barSize={120}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#CBD5E1" />
                <XAxis
                  dataKey="acronym"
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomXAxisTick />}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                  tickSize={2}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                  width={25}
                  tickMargin={5}
                  domain={[0, (dataMax: number) => {
                    const max = Math.max(dataMax, 1);
                    // Round up to a nice number
                    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                    return Math.ceil(max * 1.3 / magnitude) * magnitude || 10;
                  }]}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Bar
                  dataKey="votes"
                  shape={<CustomBarShape />}
                  isAnimationActive={false}
                >
                  {results.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      onMouseEnter={() => setHoveredBar(entry.acronym)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b-[10px] border-[#0F172A] sticky top-0 z-50">
        <div className="w-full flex flex-col lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex items-center gap-4 pl-4 sm:pl-8 h-full">
            <div className="flex flex-col items-center justify-center py-2">
              <img src="/images/ceceiis.png" alt="Logo CEIIS" className="w-[140px] sm:w-[160px] h-auto object-contain" />
            </div>
            <div className="flex flex-col justify-center pl-2 h-10">
              <span className="text-[#0F172A] font-black text-[13px] leading-tight">Elecciones</span>
              <span className="text-[#0F172A] font-black text-[13px] leading-tight">Generales</span>
              <div className="mt-0.5 border border-blue-300 rounded px-1.5 py-0.5 w-fit bg-blue-50/50">
                <span className="text-[9px] text-[#2B78C5] font-bold tracking-tight block">FIIS - UNI 2026</span>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-3 lg:flex lg:items-stretch lg:justify-end lg:flex-1">
            <button
              type="button"
              onClick={() => setActiveTab("resultados")}
              className={`flex items-center justify-center gap-2.5 px-4 py-2.5 lg:h-full transition-colors border-t lg:border-t-0 lg:border-l ${activeTab === "resultados" ? "bg-[#2B78C5] text-white border-[#2B78C5]" : "bg-white text-[#0F172A] hover:bg-slate-50 border-slate-200"}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-bold text-sm">Resultados</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("participacion")}
              className={`flex items-center justify-center gap-2.5 px-4 py-2.5 lg:h-full transition-colors border-t lg:border-t-0 lg:border-l ${activeTab === "participacion" ? "bg-[#2B78C5] text-white border-[#2B78C5]" : "bg-white text-[#0F172A] hover:bg-slate-50 border-slate-200"}`}
            >
              <PieChart className="w-5 h-5" />
              <span className="font-bold text-sm">Participación</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("listas")}
              className={`flex items-center justify-center gap-2.5 px-4 py-2.5 lg:h-full transition-colors border-t lg:border-t-0 lg:border-l ${activeTab === "listas" ? "bg-[#2B78C5] text-white border-[#2B78C5]" : "bg-white text-[#0F172A] hover:bg-slate-50 border-slate-200"}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm">Listas</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="w-full px-4 sm:px-8 py-6 bg-white">
        <div className="flex items-center gap-3 mb-4 pl-2">
          <img src="/images/ceiis.jpg" alt="Escudo" className="w-16 h-16 rounded-full object-cover" />
          <h1 className="text-[22px] text-[#0F172A] tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
            Elecciones de la Junta Directiva del CEIIS
          </h1>
        </div>

        {renderTabContent()}
      </main>

      <footer className="w-full bg-[#083262] text-white py-8 px-4 sm:px-8 text-[13px] font-sans border-t border-slate-700">
        <div className="w-full flex flex-col md:flex-row justify-between gap-6 md:gap-4">

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
            <span className="text-slate-200">900 830 958 - 917 732 568 - 926 776 359</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#F5A623] font-semibold tracking-wide">Redes Sociales</span>
            <div className="flex gap-2 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#083262"></polygon></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 0h1.98c.144 2.596 1.537 3.84 3.903 3.96v2.159c-1.127-.043-2.122-.44-2.903-1.096V12.7c0 3.39-2.73 6.13-6.13 6.13-3.39 0-6.13-2.74-6.13-6.13 0-3.39 2.74-6.13 6.13-6.13 1.05 0 2.05.27 2.93.75v2.43c-.87-.6-1.89-.95-2.93-.95-2.28 0-4.13 1.85-4.13 4.13 0 2.28 1.85 4.13 4.13 4.13 2.28 0 4.13-1.85 4.13-4.13V0z"></path></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.621.54.3.72.96.42 1.5-.3.541-.96.72-1.56.36z"></path></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

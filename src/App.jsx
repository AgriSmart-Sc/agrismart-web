import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  LayoutDashboard, Users, Wallet, Plane, Calendar, Download, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Droplets, Wrench, ChevronDown, Leaf,
  Gauge, Battery, MapPin, Sprout, X,
} from "lucide-react";
import { supabase } from "./supabase";

/* ---------------------------------------------------------------------- */
/* TOKENS                                                                  */
/* ---------------------------------------------------------------------- */
const C = {
  ink: "#1B2A20",
  canvas: "#F2F3EC",
  surface: "#FFFFFF",
  primary: "#1F4D36",
  primaryLight: "#2F6B4B",
  primaryPale: "#E4ECE5",
  accent: "#D9A441",
  accentSoft: "#F3E6C4",
  sky: "#3E7CB1",
  skySoft: "#DCE9F1",
  alert: "#B4482D",
  alertSoft: "#F3DAD0",
  border: "#DEDACA",
  muted: "#69735F",
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
  .as-root { font-family: 'Inter', sans-serif; color: ${C.ink}; background: ${C.canvas}; min-height: 100vh; }
  .as-display { font-family: 'Space Grotesk', sans-serif; }
  .as-mono { font-family: 'IBM Plex Mono', monospace; }
  .as-root * { box-sizing: border-box; }
  .as-scrollx::-webkit-scrollbar { height: 6px; }
  .as-scrollx::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  .as-tab { transition: all .15s ease; }
  .as-tab:hover { background: ${C.primaryPale}; }
  .as-row:hover { background: #FAFAF3; }
  .as-block { transition: transform .15s ease; }
  .as-block:hover { transform: scale(1.12); }
  .as-btn { transition: all .15s ease; cursor: pointer; }
  .as-btn:hover { opacity: .88; }
  .as-fadein { animation: asFade .25s ease; }
  @keyframes asFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .as-fadein, .as-block, .as-tab, .as-btn { animation: none !important; transition: none !important; } }
`;

/* ---------------------------------------------------------------------- */
/* MOCK DATA                                                               */
/* ---------------------------------------------------------------------- */
const CLIENTES = [
  { id: "c1", nombre: "Agropecuaria Santa Fe", cultivo: "Arroz", zona: "Yapacaní", ha: 700, realizado: 512, facturado: 46080, pagado: 32000, precio: 90 },
  { id: "c2", nombre: "Hacienda El Palmar", cultivo: "Soya", zona: "Pailón", ha: 450, realizado: 450, facturado: 40500, pagado: 40500, precio: 90 },
  { id: "c3", nombre: "Finca San Miguel", cultivo: "Arroz", zona: "Cuatro Cañadas", ha: 300, realizado: 120, facturado: 10200, pagado: 3000, precio: 85 },
  { id: "c4", nombre: "Agroindustrial Yapacaní", cultivo: "Maíz", zona: "Yapacaní", ha: 550, realizado: 300, facturado: 30000, pagado: 18000, precio: 100 },
];

const AGING = [
  { rango: "Al día", monto: 34000 },
  { rango: "1–15 d", monto: 18500 },
  { rango: "16–30 d", monto: 9200 },
  { rango: "31–60 d", monto: 6100 },
  { rango: "+60 d", monto: 3800 },
];

const HA_MES = [
  { mes: "Mar", ha: 1240 }, { mes: "Abr", ha: 1480 }, { mes: "May", ha: 1620 },
  { mes: "Jun", ha: 1510 }, { mes: "Jul", ha: 1780 }, { mes: "Ago", ha: 1840 },
];

const TRABAJOS_HOY = [
  { id: "AGR-2026-00041", cliente: "Agropecuaria Santa Fe", lote: "Lote 2", ha: 58, piloto: "R. Vaca", dron: "T70P-01", estado: "en_proceso" },
  { id: "AGR-2026-00042", cliente: "Agroindustrial Yapacaní", lote: "Lote 1", ha: 40, piloto: "R. Vaca", dron: "T70P-01", estado: "programado" },
  { id: "AGR-2026-00039", cliente: "Finca San Miguel", lote: "Lote 1", ha: 47, piloto: "R. Vaca", dron: "T70P-01", estado: "finalizado" },
];

const DRONES = [
  { codigo: "T70P-01", modelo: "DJI Agras T70P", ha: 2340, horas: 118, bateriasCiclos: 214, proximoMant: 160, estado: "operativo" },
];

const PROPIEDADES_CLIENTE = {
  c1: {
    propiedad: "Propiedad San Juan",
    lotes: [
      { nombre: "Lote 1", ha: 250, cultivo: "Arroz", avance: 100 },
      { nombre: "Lote 2", ha: 180, cultivo: "Arroz", avance: 64 },
      { nombre: "Lote 3", ha: 130, cultivo: "Arroz", avance: 30 },
      { nombre: "Lote 4", ha: 140, cultivo: "Arroz", avance: 0 },
    ],
  },
};

const TRABAJOS_CLIENTE = {
  c1: [
    { fecha: "2026-08-14", lote: "Lote 2", ha: 58, producto: "Fungicida", dosis: "10 L/ha", estado: "finalizado" },
    { fecha: "2026-08-12", lote: "Lote 2", ha: 62, producto: "Fungicida", dosis: "10 L/ha", estado: "finalizado" },
    { fecha: "2026-08-09", lote: "Lote 3", ha: 39, producto: "Insecticida", dosis: "8 L/ha", estado: "finalizado" },
    { fecha: "2026-08-05", lote: "Lote 1", ha: 250, producto: "Fungicida", dosis: "10 L/ha", estado: "finalizado" },
  ],
  c2: [
    { fecha: "2026-08-10", lote: "Lote 1", ha: 450, producto: "Herbicida", dosis: "6 L/ha", estado: "finalizado" },
  ],
  c3: [
    { fecha: "2026-08-11", lote: "Lote 1", ha: 47, producto: "Fungicida", dosis: "10 L/ha", estado: "finalizado" },
    { fecha: "2026-08-13", lote: "Lote 2", ha: 73, producto: "Fungicida", dosis: "10 L/ha", estado: "en_proceso" },
  ],
  c4: [
    { fecha: "2026-08-08", lote: "Lote 2", ha: 300, producto: "Herbicida", dosis: "7 L/ha", estado: "finalizado" },
  ],
};

const ESTADO_LABEL = {
  programado: { label: "Programado", bg: C.skySoft, fg: C.sky },
  en_proceso: { label: "En proceso", bg: C.accentSoft, fg: "#8A6414" },
  finalizado: { label: "Finalizado", bg: C.primaryPale, fg: C.primary },
};

const fmtBs = (n) => `Bs ${n.toLocaleString("es-BO")}`;
const fmtHa = (n) => `${n.toLocaleString("es-BO")} ha`;

/* ---------------------------------------------------------------------- */
/* SHARED UI                                                               */
/* ---------------------------------------------------------------------- */
function Badge({ estado }) {
  const s = ESTADO_LABEL[estado];
  return (
    <span
      className="as-mono"
      style={{
        background: s.bg, color: s.fg, fontSize: 11, fontWeight: 600,
        padding: "3px 9px", borderRadius: 20, letterSpacing: .3, whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className="as-fadein"
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: "18px 20px", flex: "1 1 200px", minWidth: 190,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: accent || C.primaryPale,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={accent ? "#fff" : C.primary} />
        </div>
        <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>{label}</span>
      </div>
      <div className="as-display as-mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h3 className="as-display" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{children}</h3>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SIGNATURE ELEMENT — MOSAICO DE LOTES                                    */
/* ---------------------------------------------------------------------- */
function LoteMosaic({ lote }) {
  const total = 10;
  const filled = Math.round((lote.avance / 100) * total);
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 14, minWidth: 168,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{lote.nombre}</span>
        <span className="as-mono" style={{ fontSize: 11, color: C.muted }}>{fmtHa(lote.ha)}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3, marginBottom: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="as-block"
            style={{
              aspectRatio: "1", borderRadius: 3,
              background: i < filled ? C.accent : "transparent",
              border: i < filled ? "none" : `1.5px solid ${C.border}`,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
        <span style={{ color: C.muted }}>{lote.cultivo}</span>
        <span className="as-mono" style={{ fontWeight: 600, color: lote.avance === 100 ? C.primary : C.ink }}>{lote.avance}%</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ADMIN — RESUMEN                                                         */
/* ---------------------------------------------------------------------- */
function AdminResumen() {
  const ranking = [...CLIENTES].sort((a, b) => b.ha - a.ha);
  return (
    <div className="as-fadein">
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26 }}>
        <KpiCard icon={Sprout} label="Hectáreas hoy" value="145 ha" sub="3 trabajos en curso" />
        <KpiCard icon={TrendingUp} label="Hectáreas del mes" value="1.840 ha" sub="Meta mensual: 2.500 ha" accent={C.primary} />
        <KpiCard icon={Wallet} label="Facturado (agosto)" value={fmtBs(165600)} sub={`Cobrado ${fmtBs(126800)}`} />
        <KpiCard icon={Users} label="Clientes activos" value="14" sub="4 campañas en curso" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 26 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <SectionTitle>Hectáreas aplicadas por mes</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HA_MES}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v) => [fmtHa(v), "Hectáreas"]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="ha" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3, fill: C.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <SectionTitle>Trabajos de hoy</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRABAJOS_HOY.map((t) => (
              <div key={t.id} className="as-row" style={{ padding: "8px 6px", borderRadius: 8, borderBottom: `1px solid ${C.canvas}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{t.cliente}</span>
                  <Badge estado={t.estado} />
                </div>
                <div className="as-mono" style={{ fontSize: 11.5, color: C.muted }}>
                  {t.lote} · {fmtHa(t.ha)} · {t.dron}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <SectionTitle>Ranking de clientes por hectáreas</SectionTitle>
        <div className="as-scrollx" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 11.5, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>
                <th style={{ padding: "0 8px 10px" }}>Cliente</th>
                <th style={{ padding: "0 8px 10px" }}>Ha</th>
                <th style={{ padding: "0 8px 10px" }}>Facturado</th>
                <th style={{ padding: "0 8px 10px" }}>Pagado</th>
                <th style={{ padding: "0 8px 10px" }}>Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((c) => (
                <tr key={c.id} className="as-row" style={{ borderTop: `1px solid ${C.canvas}` }}>
                  <td style={{ padding: "10px 8px", fontWeight: 600, fontSize: 13 }}>{c.nombre}</td>
                  <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13 }}>{fmtHa(c.ha)}</td>
                  <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13 }}>{fmtBs(c.facturado)}</td>
                  <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13 }}>{fmtBs(c.pagado)}</td>
                  <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13, color: c.facturado - c.pagado > 0 ? C.alert : C.primary, fontWeight: 600 }}>
                    {fmtBs(c.facturado - c.pagado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ADMIN — COBRANZA                                                        */
/* ---------------------------------------------------------------------- */
function AdminCobranza() {
  const totalPendiente = AGING.reduce((a, b) => a + b.monto, 0);
  return (
    <div className="as-fadein">
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26 }}>
        <KpiCard icon={Wallet} label="Total por cobrar" value={fmtBs(totalPendiente)} accent={C.alert} />
        <KpiCard icon={AlertTriangle} label="Vencido +30 días" value={fmtBs(9900)} sub="2 clientes" />
        <KpiCard icon={CheckCircle2} label="Al día" value={fmtBs(34000)} />
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <SectionTitle>Antigüedad de saldos</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={AGING}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="rango" tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => [fmtBs(v), "Saldo"]} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
              {AGING.map((_, i) => (
                <Cell key={i} fill={i >= 3 ? C.alert : i >= 1 ? C.accent : C.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <SectionTitle>Detalle por cliente</SectionTitle>
        <div className="as-scrollx" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 11.5, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>
                <th style={{ padding: "0 8px 10px" }}>Cliente</th>
                <th style={{ padding: "0 8px 10px" }}>Facturado</th>
                <th style={{ padding: "0 8px 10px" }}>Pagado</th>
                <th style={{ padding: "0 8px 10px" }}>Saldo</th>
                <th style={{ padding: "0 8px 10px" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTES.map((c) => {
                const saldo = c.facturado - c.pagado;
                const alDia = saldo === 0;
                return (
                  <tr key={c.id} className="as-row" style={{ borderTop: `1px solid ${C.canvas}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, fontSize: 13 }}>{c.nombre}</td>
                    <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13 }}>{fmtBs(c.facturado)}</td>
                    <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13 }}>{fmtBs(c.pagado)}</td>
                    <td className="as-mono" style={{ padding: "10px 8px", fontSize: 13, fontWeight: 600 }}>{fmtBs(saldo)}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span className="as-mono" style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                        background: alDia ? C.primaryPale : C.alertSoft, color: alDia ? C.primary : C.alert,
                      }}>
                        {alDia ? "Al día" : "Con saldo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ADMIN — DRONES                                                          */
/* ---------------------------------------------------------------------- */
function AdminDrones() {
  return (
    <div className="as-fadein">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {DRONES.map((d) => (
          <div key={d.codigo} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: 22, flex: "1 1 300px", maxWidth: 380,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div className="as-display" style={{ fontWeight: 700, fontSize: 17 }}>{d.codigo}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{d.modelo}</div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 5, background: C.primaryPale,
                color: C.primary, fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.primary }} /> Operativo
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <Stat icon={Sprout} label="Ha acumuladas" value={fmtHa(d.ha)} />
              <Stat icon={Clock} label="Horas de vuelo" value={`${d.horas} h`} />
              <Stat icon={Battery} label="Ciclos de batería" value={d.bateriasCiclos} />
              <Stat icon={Wrench} label="Próx. mantenimiento" value={`${d.proximoMant} ha`} />
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Rentabilidad estimada (mes)</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div><span className="as-mono" style={{ fontWeight: 700, fontSize: 15 }}>{fmtBs(165600)}</span><div style={{ fontSize: 11, color: C.muted }}>Facturación</div></div>
              <div><span className="as-mono" style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>{fmtBs(97200)}</span><div style={{ fontSize: 11, color: C.muted }}>Utilidad</div></div>
            </div>
          </div>
        ))}
        <div style={{
          border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: 22,
          flex: "1 1 300px", maxWidth: 380, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", color: C.muted, gap: 8,
        }}>
          <Plane size={20} />
          <span style={{ fontSize: 12.5, textAlign: "center" }}>Agregar próximo dron<br />(ej. T100) para comparar rentabilidad</span>
        </div>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={15} color={C.muted} />
      <div>
        <div className="as-mono" style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
        <div style={{ fontSize: 10.5, color: C.muted }}>{label}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ADMIN SHELL                                                             */
/* ---------------------------------------------------------------------- */
const ADMIN_TABS = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "cobranza", label: "Cobranza", icon: Wallet },
  { id: "clientes", label: "Clientes", icon: LayoutDashboard },
  { id: "drones", label: "Drones", icon: Plane },
];

function AdminApp() {
  const [tab, setTab] = useState("resumen");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 2 }}>
        {ADMIN_TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="as-tab"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
                border: "none", background: active ? C.surface : "transparent",
                borderRadius: "10px 10px 0 0", cursor: "pointer",
                borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
                fontWeight: 600, fontSize: 13, color: active ? C.primary : C.muted,
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "resumen" && <AdminResumen />}
      {tab === "cobranza" && <AdminCobranza />}
      {tab === "clientes" && <AdminClientes />}
      {tab === "drones" && <AdminDrones />}
    </div>
  );
}
function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const cargarClientes = async () => {
      setCargando(true);

      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, empresa, telefono, correo, activo")
        .order("nombre", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Error cargando clientes:", error);
        setError(error.message);
        setClientes([]);
      } else {
        setError(null);
        setClientes(data || []);
      }

      setCargando(false);
    };

    cargarClientes();

    return () => {
      mounted = false;
    };
  }, []);

  if (cargando) {
    return <div style={{ padding: 24 }}>Cargando clientes...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        Error al cargar clientes: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
            Clientes
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {clientes.length} clientes registrados
          </div>
        </div>
      </div>

      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden"
      }}>
        {clientes.map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: "14px 16px",
              borderTop: i ? `1px solid ${C.border}` : "none"
            }}
          >
            <div style={{ fontWeight: 700, color: C.ink }}>
              {c.nombre}
            </div>

            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
              {c.empresa || "Sin empresa"}
              {c.telefono ? ` · ${c.telefono}` : ""}
              {c.correo ? ` · ${c.correo}` : ""}
            </div>

            <div style={{
              fontSize: 11.5,
              marginTop: 5,
              color: c.activo ? C.primary : C.muted
            }}>
              {c.activo ? "Activo" : "Inactivo"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
              }
/* ---------------------------------------------------------------------- */
/* PORTAL DEL CLIENTE                                                      */
/* ---------------------------------------------------------------------- */
function ClientApp() {
  const [toast, setToast] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [cargandoCliente, setCargandoCliente] = useState(true);

  const propiedad = null;
  const [trabajos, setTrabajos] = useState([]);
const [pagos, setPagos] = useState([]);

  useEffect(() => {
    let mounted = true;

    const cargarCliente = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setCargandoCliente(false);
        return;
      }

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("cliente_id")
        .eq("usuario_id", user.id)
        .eq("rol", "cliente")
        .eq("activo", true)
        .maybeSingle();

      if (!perfil?.cliente_id) {
        if (mounted) {
          setCliente(null);
          setCargandoCliente(false);
        }
        return;
      }

      const { data: clienteReal, error: clienteError } = await supabase
  .from("clientes")
  .select("id, nombre, empresa")
  .eq("id", perfil.cliente_id)
  .maybeSingle();

const { data: trabajosReal, error: trabajosError } = await supabase
  .from("trabajos")
  .select(`
    id,
    cliente_id,
    drone_id,
    fecha,
    propiedad,
    lote,
    cultivo,
    hectareas,
    tarifa_ha,
    monto_total,
    estado
  `)
  .eq("cliente_id", perfil.cliente_id)
  .order("fecha", { ascending: false });

const { data: pagosReal, error: pagosError } = await supabase
  .from("pagos")
  .select(`
    id,
    cliente_id,
    trabajo_id,
    fecha,
    monto,
    metodo,
    referencia,
    observaciones
  `)
  .eq("cliente_id", perfil.cliente_id)
  .order("fecha", { ascending: false });

if (!mounted) return;

if (clienteError || trabajosError || pagosError) {
  console.error("Error cargando portal:", {
    clienteError,
    trabajosError,
    pagosError
  });

  setCliente(null);
  setTrabajos([]);
  setPagos([]);
  setCargandoCliente(false);
  return;
}

const listaTrabajos = trabajosReal || [];
const listaPagos = pagosReal || [];

setTrabajos(listaTrabajos);
setPagos(listaPagos);

const hectareasTotales = listaTrabajos.reduce(
  (total, t) => total + Number(t.hectareas || 0),
  0
);

const hectareasRealizadas = listaTrabajos
  .filter(
    (t) => String(t.estado || "").toLowerCase() === "finalizado"
  )
  .reduce(
    (total, t) => total + Number(t.hectareas || 0),
    0
  );

const totalFacturado = listaTrabajos.reduce(
  (total, t) => total + Number(t.monto_total || 0),
  0
);

const totalPagado = listaPagos.reduce(
  (total, p) => total + Number(p.monto || 0),
  0
);

const ultimoTrabajo = listaTrabajos[0];

if (clienteReal) {
  setCliente({
    ...clienteReal,
    cultivo: ultimoTrabajo?.cultivo || "Sin campaña",
    ha: hectareasTotales,
    realizado: hectareasRealizadas,
    facturado: totalFacturado,
    pagado: totalPagado,
    precio: Number(ultimoTrabajo?.tarifa_ha || 0),
  });
}

setCargandoCliente(false);
    };

    cargarCliente();

    return () => {
      mounted = false;
    };
  }, []);

  if (cargandoCliente) {
    return <div style={{ padding: 30 }}>Cargando cliente...</div>;
  }

  if (!cliente) {
    return <div style={{ padding: 30 }}>Cliente no disponible</div>;
  }

  const pct =
    cliente.ha > 0
      ? Math.round((cliente.realizado / cliente.ha) * 100)
      : 0;

  const saldo = cliente.facturado - cliente.pagado;


  const descargar = (id) => {
    setToast(`Reporte ${id} listo para descargar (demostración)`);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="as-fadein" style={{ position: "relative" }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: C.ink, color: "#fff", padding: "10px 18px", borderRadius: 10,
          fontSize: 13, display: "flex", alignItems: "center", gap: 10, zIndex: 50,
          boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        }}>
          {toast}
          <X size={14} style={{ cursor: "pointer" }} onClick={() => setToast(null)} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 2 }}>Bienvenido</div>
          <div className="as-display" style={{ fontWeight: 700, fontSize: 20 }}>{cliente.nombre}</div>
        </div>
     </div>

      {/* Campaign hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, borderRadius: 16,
        padding: 24, color: "#fff", marginBottom: 24, display: "flex", flexWrap: "wrap",
        gap: 24, alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: .85, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Campaña actual · {cliente.cultivo}</div>
          <div className="as-display as-mono" style={{ fontSize: 34, fontWeight: 700 }}>{pct}%</div>
          <div style={{ fontSize: 12.5, opacity: .9 }}>{fmtHa(cliente.realizado)} de {fmtHa(cliente.ha)} contratadas</div>
        </div>
        <div style={{ flex: "1 1 220px", maxWidth: 340 }}>
          <div style={{ height: 10, background: "rgba(255,255,255,.25)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: C.accent, borderRadius: 99, transition: "width .4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginTop: 6, opacity: .9 }}>
            <span>{fmtHa(cliente.ha - cliente.realizado)} pendientes</span>
            <span>{fmtBs(cliente.precio)}/ha</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div>
          {propiedad && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle right={<span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {propiedad.propiedad}</span>}>
                Mapa de lotes
              </SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {propiedad.lotes.map((l) => <LoteMosaic key={l.nombre} lote={l} />)}
              </div>
            </div>
          )}

          <div>
            <SectionTitle>Historial de trabajos</SectionTitle>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              {trabajos.map((t, i) => (
                <div key={i} className="as-row" style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "13px 16px", borderTop: i ? `1px solid ${C.canvas}` : "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                      {t.lote} <Badge estado={t.estado} />
                    </div>
                    <div className="as-mono" style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                      {t.fecha} · {t.cultivo} · {t.propiedad}
                    </div>
                  </div>
                  <div className="as-mono" style={{ fontWeight: 700, fontSize: 14 }}>{fmtHa(t.hectareas)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Estado de cuenta</SectionTitle>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <Row label="Total facturado" value={fmtBs(cliente.facturado)} />
            <Row label="Total pagado" value={fmtBs(cliente.pagado)} />
            <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
            <Row label="Saldo pendiente" value={fmtBs(saldo)} bold color={saldo > 0 ? C.alert : C.primary} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trabajos.filter((t) => t.estado === "finalizado").slice(0, 3).map((t, i) => (
              <div key={i} className="as-btn as-row" onClick={() => descargar(`${t.lote} · ${t.fecha}`)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "10px 14px", fontSize: 12.5,
              }}>
                <span>Reporte — {t.lote} ({t.fecha})</span>
                <Download size={14} color={C.primary} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Row({ label, value, bold, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13.5 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span className="as-mono" style={{ fontWeight: bold ? 700 : 600, color: color || C.ink }}>{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ROOT                                                                     */
/* ---------------------------------------------------------------------- */
export default function AgriSmartPrototype() {
  const [role, setRole] = useState(null);
const [session, setSession] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [authError, setAuthError] = useState("");
const [authSubmitting, setAuthSubmitting] = useState(false);
  
useEffect(() => {
  let mounted = true;

  const cargarUsuario = async (currentSession) => {
    if (!mounted) return;

    setSession(currentSession);

    if (!currentSession) {
      setRole(null);
      setAuthLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("usuario_id", currentSession.user.id)
      .single();

    if (!mounted) return;

    if (error || !data?.activo) {
      setRole(null);
    } else {
      setRole(data.rol);
    }

    setAuthLoading(false);
  };

  supabase.auth.getSession().then(({ data }) => {
    cargarUsuario(data.session);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, newSession) => {
    cargarUsuario(newSession);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);const iniciarSesion = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthSubmitting(true);

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    setAuthError("Correo o contraseña incorrectos.");
  }

  setAuthSubmitting(false);
};

if (authLoading) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: C.canvas,
      color: C.primary,
      fontFamily: "Arial, sans-serif"
    }}>
      Cargando AGRISMART...
    </div>
  );
}

if (!session) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: C.canvas,
      padding: 24
    }}>
      <style>{STYLE}</style>

      <form
        onSubmit={iniciarSesion}
        style={{
          width: "100%",
          maxWidth: 420,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 12px 40px rgba(0,0,0,.08)"
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: C.primary,
            display: "grid",
            placeItems: "center"
          }}>
            <Leaf size={22} color="#fff" />
          </div>

          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>
              AgriSmart
            </div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>
              AGRICULTURA INTELIGENTE
            </div>
          </div>
        </div>

        <h2 style={{ margin: "0 0 6px", color: C.ink }}>
          Iniciar sesión
        </h2>

        <p style={{ margin: "0 0 22px", color: C.muted, fontSize: 14 }}>
          Acceso privado para administradores y clientes.
        </p>

        <input
          type="email"
          required
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 14px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            marginBottom: 12,
            fontSize: 15
          }}
        />

        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 14px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            marginBottom: 12,
            fontSize: 15
          }}
        />

        {authError && (
          <div style={{
            color: "#B4482D",
            background: "#F3DAD0",
            padding: 10,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 12
          }}>
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={authSubmitting}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 10,
            padding: "13px 16px",
            background: C.primary,
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer"
          }}
        >
          {authSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

if (!role) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: C.canvas,
      padding: 24
    }}>
      <div style={{ textAlign: "center" }}>
        <h2>Usuario sin acceso activo</h2>
        <button onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
              }
  return (
    <div className="as-root">
      <style>{STYLE}</style>

      <header style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: C.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={17} color="#fff" />
          </div>
          <div>
            <div className="as-display" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>AgriSmart</div>
            <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: .3 }}>AGRICULTURA INTELIGENTE</div>
          </div>
        </div>
<button
  onClick={() => supabase.auth.signOut()}
  style={{
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.primary,
    borderRadius: 9,
    padding: "8px 14px",
    fontWeight: 600,
    cursor: "pointer"
  }}
>
  Cerrar sesión
</button>
        
        
      </header>


        
      

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 24px 60px" }}>
        {role === "admin" ? <AdminApp /> : <ClientApp />}
      </main>
    </div>
  );
}

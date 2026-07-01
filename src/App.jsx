import React, { useState } from "react";
import { Plus, Trash2, Calculator, Clock, AlertTriangle, Info, Image as ImageIcon, FileSpreadsheet } from "lucide-react";

const NAVY = "#1F4E79";
const NAVY_DARK = "#173A5C";
const INK = "#1C2530";
const PAPER = "#F6F7F5";
const LINE = "#D8DEE4";
const MUTED = "#7C8894";
const AMBER_BG = "#FBF3E7";
const AMBER_BORDER = "#EAD9BC";
const AMBER_TEXT = "#8A5A20";
const CARD_BORDER = "#E2E6EA";

const SERIF = "'Source Serif 4', Georgia, serif";
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace";
const SANS = "'Inter', system-ui, sans-serif";

const CATEGORIES = [
  { id: "exposicao", label: "Exposição / início", color: "#64748B" },
  { id: "deteccao", label: "Detecção / notificação", color: "#2563EB" },
  { id: "laboratorio", label: "Confirmação laboratorial", color: "#7C3AED" },
  { id: "controle", label: "Medida de controle", color: "#16A34A" },
  { id: "obito", label: "Óbito", color: "#991B1B" },
  { id: "reavaliacao", label: "Reavaliação de risco", color: "#D97706" },
  { id: "comunicacao", label: "Comunicação", color: "#0891B2" },
  { id: "outro", label: "Outro", color: "#6B7280" },
];

function formatNum(n, decimals = 2) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatDatePtBr(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function toNum(s) {
  const n = parseFloat(String(s).replace(",", "."));
  return isFinite(n) ? n : null;
}

function wrapCanvasText(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (let i = 0; i < words.length; i++) {
    const test = current ? current + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last + "…").width <= maxWidth + 20) lines[maxLines - 1] = last;
  }
  return lines;
}

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadTimelinePNG(events) {
  if (!events || events.length === 0) return;
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const timestamps = sorted.map((e) => new Date(e.date + "T00:00:00").getTime());
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);
  const range = max - min;
  const totalDays = range / 86400000;
  const n = sorted.length;

  const scale = 2;
  const width = Math.max(860, n * 160);
  const height = 380;
  const padX = 56;
  const lineY = 196;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // fundo
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // cabeçalho
  ctx.textAlign = "start";
  ctx.fillStyle = "#1F4E79";
  ctx.font = "600 20px Georgia, serif";
  ctx.fillText("Linha do tempo do evento", padX, 40);
  ctx.fillStyle = "#7C8894";
  ctx.font = "400 12px Menlo, Consolas, monospace";
  ctx.fillText(
    `${n} marco${n !== 1 ? "s" : ""} \u00B7 ${Math.round(totalDays)} dia${totalDays !== 1 ? "s" : ""} de duração total`,
    padX, 60
  );

  // linha base
  ctx.strokeStyle = "#D8DEE4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, lineY);
  ctx.lineTo(width - padX, lineY);
  ctx.stroke();

  const usableWidth = width - padX * 2;
  const BAR_H = 3;
  const GAP_LINE_BAR = 14;
  const GAP_BAR_DATE = 16;
  const GAP_DATE_LABEL = 15;
  const LABEL_LINE_H = 14;

  sorted.forEach((e, i) => {
    const pct = range === 0 ? (n <= 1 ? 0.5 : i / (n - 1)) : (timestamps[i] - min) / range;
    const x = padX + pct * usableWidth;
    const color = (CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[7]).color;
    const above = i % 2 === 0;

    ctx.textAlign = "center";
    ctx.font = "500 12px -apple-system, Arial, sans-serif";
    const labelLines = wrapCanvasText(ctx, e.label, 132, 3);

    if (above) {
      const barBottomY = lineY - GAP_LINE_BAR;
      const barTopY = barBottomY - BAR_H;
      const dateBaselineY = barTopY - GAP_BAR_DATE;
      const labelLastBaselineY = dateBaselineY - GAP_DATE_LABEL;

      ctx.fillStyle = "#1C2530";
      ctx.font = "500 12px -apple-system, Arial, sans-serif";
      for (let li = labelLines.length - 1; li >= 0; li--) {
        const baselineY = labelLastBaselineY - (labelLines.length - 1 - li) * LABEL_LINE_H;
        ctx.fillText(labelLines[li], x, baselineY);
      }
      ctx.fillStyle = "#7C8894";
      ctx.font = "400 11px Menlo, Consolas, monospace";
      ctx.fillText(formatDatePtBr(e.date), x, dateBaselineY);
      ctx.fillStyle = color;
      ctx.fillRect(x - 11, barTopY, 22, BAR_H);
    } else {
      const barTopY = lineY + GAP_LINE_BAR;
      const dateBaselineY = barTopY + BAR_H + GAP_BAR_DATE - 6;
      ctx.fillStyle = "#7C8894";
      ctx.font = "400 11px Menlo, Consolas, monospace";
      ctx.fillText(formatDatePtBr(e.date), x, dateBaselineY);

      ctx.fillStyle = "#1C2530";
      ctx.font = "500 12px -apple-system, Arial, sans-serif";
      let baselineY = dateBaselineY + GAP_DATE_LABEL - 4;
      labelLines.forEach((line) => {
        ctx.fillText(line, x, baselineY);
        baselineY += LABEL_LINE_H;
      });

      ctx.fillStyle = color;
      ctx.fillRect(x - 11, barTopY, 22, BAR_H);
    }

    // ponto por cima de tudo
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, lineY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
  });

  ctx.textAlign = "start";
  ctx.fillStyle = "#B7C0C8";
  ctx.font = "400 10px -apple-system, Arial, sans-serif";
  ctx.fillText("Elaborado por Fernanda Haltenburg · Ferramenta de apoio à Avaliação Rápida de Risco em Saúde Pública", padX, height - 16);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const first = sorted[0].date, last = sorted[sorted.length - 1].date;
    triggerDownload(url, `linha-do-tempo_${first}_a_${last}.png`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function downloadTimelineCSV(events) {
  if (!events || events.length === 0) return;
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const header = ["Data", "Marco", "Categoria"];
  const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = sorted.map((e) => {
    const catLabel = (CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[7]).label;
    return [escape(formatDatePtBr(e.date)), escape(e.label), escape(catLabel)].join(";");
  });
  const csvContent = "\uFEFF" + [header.map(escape).join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const first = sorted[0].date, last = sorted[sorted.length - 1].date;
  triggerDownload(url, `linha-do-tempo-dados_${first}_a_${last}.csv`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- pequenos componentes reutilizáveis ----------

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: "#4B5660" }}>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
        style={{ borderColor: LINE, fontFamily: MONO, color: INK }}
        onFocus={(e) => (e.target.style.borderColor = NAVY)}
        onBlur={(e) => (e.target.style.borderColor = LINE)}
      />
    </label>
  );
}

function ResultBox({ label, value, decimals = 2, suffix = "" }) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-baseline justify-between gap-3"
      style={{ background: AMBER_BG, border: `1px solid ${AMBER_BORDER}` }}
    >
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: AMBER_TEXT }}>{label}</span>
      <span className="text-2xl font-semibold whitespace-nowrap" style={{ fontFamily: MONO, color: AMBER_TEXT }}>
        {formatNum(value, decimals)}{value !== null && suffix}
      </span>
    </div>
  );
}

function Callout({ tone = "info", children }) {
  const isWarn = tone === "warn";
  const bg = isWarn ? "#FFF4E5" : "#EAF1F7";
  const border = isWarn ? "#F3D19E" : "#C9DCEC";
  const text = isWarn ? "#8A5A20" : "#1F4E79";
  const Icon = isWarn ? AlertTriangle : Info;
  return (
    <div className="rounded-lg px-3 py-2.5 flex gap-2 items-start" style={{ background: bg, border: `1px solid ${border}` }}>
      <Icon size={14} style={{ color: text, marginTop: 2, flexShrink: 0 }} />
      <p className="text-xs leading-relaxed" style={{ color: text }}>{children}</p>
    </div>
  );
}

function CardShell({ title, formula, tag, children, wide }) {
  return (
    <div
      className={"rounded-2xl bg-white border p-5 flex flex-col gap-4" + (wide ? " sm:col-span-2 lg:col-span-3" : "")}
      style={{ borderColor: CARD_BORDER }}
    >
      <div>
        {tag && (
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: MUTED }}>{tag}</p>
        )}
        <h3 className="text-base font-semibold" style={{ fontFamily: SERIF, color: NAVY }}>{title}</h3>
        <p className="text-xs mt-1" style={{ fontFamily: MONO, color: MUTED }}>{formula}</p>
      </div>
      {children}
    </div>
  );
}

// ---------- definição das calculadoras genéricas (2-3 campos) ----------

const CALCULATORS = [
  {
    id: "attack",
    title: "Taxa de Ataque",
    tag: "Medida de frequência",
    formula: "(Casos novos ÷ População exposta) × 100",
    unit: "%",
    decimals: 2,
    fields: [
      { key: "casos", label: "Casos novos", placeholder: "ex.: 42" },
      { key: "pop", label: "População exposta", placeholder: "ex.: 1.200" },
    ],
    compute: (v) => {
      const casos = toNum(v.casos), pop = toNum(v.pop);
      if (casos === null || pop === null || pop <= 0) return null;
      return (casos / pop) * 100;
    },
    note: "Proporção da população exposta que adoeceu em um período determinado. Útil em surtos com população de risco bem definida (evento único, coorte fechada).",
  },
  {
    id: "incidencia",
    title: "Coeficiente de Incidência",
    tag: "Medida de frequência",
    formula: "(Casos novos ÷ População em risco) × Base",
    unit: "",
    decimals: 2,
    fields: [
      { key: "casos", label: "Casos novos", placeholder: "ex.: 12" },
      { key: "pop", label: "População em risco", placeholder: "ex.: 8.500" },
      { key: "base", label: "Base (ex.: 10.000)", placeholder: "10000" },
    ],
    compute: (v) => {
      const casos = toNum(v.casos), pop = toNum(v.pop), base = toNum(v.base);
      if (casos === null || pop === null || base === null || pop <= 0) return null;
      return (casos / pop) * base;
    },
    note: "Compara a magnitude do evento entre áreas ou períodos com populações de tamanhos diferentes. Ajuste a base conforme a convenção local (1.000, 10.000 ou 100.000 habitantes).",
  },
  {
    id: "prevalencia",
    title: "Coeficiente de Prevalência",
    tag: "Medida de frequência",
    formula: "(Casos existentes ÷ População total) × Base",
    unit: "",
    decimals: 2,
    fields: [
      { key: "casos", label: "Casos existentes (novos + antigos)", placeholder: "ex.: 34" },
      { key: "pop", label: "População total", placeholder: "ex.: 8.500" },
      { key: "base", label: "Base (ex.: 10.000)", placeholder: "10000" },
    ],
    compute: (v) => {
      const casos = toNum(v.casos), pop = toNum(v.pop), base = toNum(v.base);
      if (casos === null || pop === null || base === null || pop <= 0) return null;
      return (casos / pop) * base;
    },
    note: "Retrata a carga total do agravo em um ponto ou período. Útil no contexto de condições persistentes ou de longa duração de sintomas.",
  },
  {
    id: "cfr",
    title: "Coeficiente de Letalidade (CFR)",
    tag: "Medida de gravidade",
    formula: "(Óbitos ÷ Casos confirmados) × 100",
    unit: "%",
    decimals: 2,
    fields: [
      { key: "obitos", label: "Óbitos", placeholder: "ex.: 3" },
      { key: "casos", label: "Casos confirmados", placeholder: "ex.: 58" },
    ],
    compute: (v) => {
      const obitos = toNum(v.obitos), casos = toNum(v.casos);
      if (obitos === null || casos === null || casos <= 0) return null;
      return (obitos / casos) * 100;
    },
    note: "Gravidade do evento. Compõe a justificativa de consequência na etapa de caracterização do risco. Atenção à subnotificação de casos leves, que pode superestimar o CFR.",
  },
  {
    id: "r0-secundarios",
    title: "R0 — Casos Secundários",
    tag: "Número reprodutivo",
    formula: "Casos secundários ÷ Casos primários (índice)",
    unit: "",
    decimals: 2,
    fields: [
      { key: "secundarios", label: "Nº de casos secundários", placeholder: "ex.: 14" },
      { key: "primarios", label: "Nº de casos primários (índice)", placeholder: "ex.: 5" },
    ],
    compute: (v) => {
      const sec = toNum(v.secundarios), prim = toNum(v.primarios);
      if (sec === null || prim === null || prim <= 0) return null;
      return sec / prim;
    },
    note: "Estimativa de campo por rastreamento de contatos: quantos casos cada caso índice efetivamente gerou. Mais confiável nas fases iniciais do surto, antes da saturação de suscetíveis.",
    warn: "Requer identificação clara de quem infectou quem (cadeias de transmissão rastreáveis, ex.: doenças com incubação bem definida).",
  },
  {
    id: "r0-tamanhofinal",
    title: "R0 — Taxa de Ataque Final",
    tag: "Número reprodutivo · população fechada",
    formula: "R0 = −ln(1 − AR) ÷ AR",
    unit: "",
    decimals: 2,
    fields: [
      { key: "ar", label: "Taxa de ataque final (%)", placeholder: "ex.: 35" },
    ],
    compute: (v) => {
      const arPct = toNum(v.ar);
      if (arPct === null) return null;
      const ar = arPct / 100;
      if (ar <= 0 || ar >= 1) return null;
      return -Math.log(1 - ar) / ar;
    },
    note: "Baseada na equação do tamanho final da epidemia (Kermack–McKendrick). Pode reaproveitar o valor calculado na Calculadora de Taxa de Ataque, se aplicável.",
    warn: "Assume população fechada, mistura homogênea, epidemia de onda única e toda a população inicialmente suscetível. Não é adequada para populações abertas, múltiplas ondas, ou com medidas de controle já em curso.",
  },
  {
    id: "cobertura",
    title: "Cobertura Vacinal / Imunização",
    tag: "Cobertura",
    formula: "(População vacinada ÷ População-alvo) × 100",
    unit: "%",
    decimals: 2,
    fields: [
      { key: "vacinada", label: "População vacinada", placeholder: "ex.: 4.100" },
      { key: "alvo", label: "População-alvo", placeholder: "ex.: 5.000" },
    ],
    compute: (v) => {
      const vac = toNum(v.vacinada), alvo = toNum(v.alvo);
      if (vac === null || alvo === null || alvo <= 0) return null;
      return (vac / alvo) * 100;
    },
    note: "Subsidia a avaliação de suscetibilidade da população e a definição de estratégias de controle, como campanhas de vacinação de bloqueio.",
  },
  {
    id: "generica",
    title: "Calculadora Genérica",
    tag: "Genérica",
    formula: "(Numerador ÷ Denominador) × Multiplicador",
    unit: "",
    decimals: 2,
    fields: [
      { key: "num", label: "Numerador", placeholder: "ex.: 7" },
      { key: "den", label: "Denominador", placeholder: "ex.: 50" },
      { key: "mult", label: "Multiplicador", placeholder: "1" },
    ],
    compute: (v) => {
      const num = toNum(v.num), den = toNum(v.den), mult = toNum(v.mult);
      if (num === null || den === null || mult === null || den === 0) return null;
      return (num / den) * mult;
    },
    note: "Modelo livre para qualquer razão, proporção ou coeficiente não contemplado nas calculadoras anteriores (ex.: proporção de hospitalizados, taxa de positividade laboratorial).",
  },
];

function GenericCalcCard({ def }) {
  const initial = {};
  def.fields.forEach((f) => { initial[f.key] = f.key === "base" ? "10000" : f.key === "mult" ? "1" : ""; });
  const [values, setValues] = useState(initial);
  const result = def.compute(values);
  return (
    <CardShell title={def.title} formula={def.formula} tag={def.tag}>
      <div className="flex flex-col gap-3">
        {def.fields.map((f) => (
          <NumberField
            key={f.key}
            label={f.label}
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(val) => setValues((v) => ({ ...v, [f.key]: val }))}
          />
        ))}
      </div>
      <ResultBox label="Resultado" value={result} decimals={def.decimals} suffix={def.unit} />
      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{def.note}</p>
      {def.warn && <Callout tone="warn">{def.warn}</Callout>}
    </CardShell>
  );
}

function RiskRatioCard() {
  const [v, setV] = useState({ casosExp: "", popExp: "", casosNao: "", popNao: "" });
  const casosExp = toNum(v.casosExp), popExp = toNum(v.popExp);
  const casosNao = toNum(v.casosNao), popNao = toNum(v.popNao);
  const incExp = casosExp !== null && popExp !== null && popExp > 0 ? casosExp / popExp : null;
  const incNao = casosNao !== null && popNao !== null && popNao > 0 ? casosNao / popNao : null;
  const rr = incExp !== null && incNao !== null && incNao > 0 ? incExp / incNao : null;

  return (
    <CardShell
      title="Razão de Risco (Risco Relativo)"
      formula="Incidência no grupo exposto ÷ Incidência no grupo não exposto"
      tag="Medida de associação"
      wide
    >
      <Callout tone="info">
        <strong>Quando usar:</strong> dados de coorte — ex.: investigação de surto com população fechada e bem definida
        (evento, instituição, coorte) — com denominador (população) conhecido em ambos os grupos e desfecho medido como
        incidência (casos novos). Não recomendada para estudos caso-controle (use Razão de Chances/OR) nem quando não se
        conhece a população total exposta e não exposta, apenas os casos.
      </Callout>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg p-3" style={{ background: PAPER }}>
          <p className="text-xs font-semibold mb-2" style={{ color: NAVY }}>Grupo exposto</p>
          <div className="flex flex-col gap-3">
            <NumberField label="Casos" placeholder="ex.: 18" value={v.casosExp} onChange={(val) => setV((s) => ({ ...s, casosExp: val }))} />
            <NumberField label="População" placeholder="ex.: 300" value={v.popExp} onChange={(val) => setV((s) => ({ ...s, popExp: val }))} />
          </div>
          <p className="mt-2 text-xs" style={{ color: "#4B5660" }}>
            Incidência: <strong style={{ fontFamily: MONO }}>{formatNum(incExp, 3)}</strong>
          </p>
        </div>
        <div className="rounded-lg p-3" style={{ background: PAPER }}>
          <p className="text-xs font-semibold mb-2" style={{ color: NAVY }}>Grupo não exposto</p>
          <div className="flex flex-col gap-3">
            <NumberField label="Casos" placeholder="ex.: 4" value={v.casosNao} onChange={(val) => setV((s) => ({ ...s, casosNao: val }))} />
            <NumberField label="População" placeholder="ex.: 400" value={v.popNao} onChange={(val) => setV((s) => ({ ...s, popNao: val }))} />
          </div>
          <p className="mt-2 text-xs" style={{ color: "#4B5660" }}>
            Incidência: <strong style={{ fontFamily: MONO }}>{formatNum(incNao, 3)}</strong>
          </p>
        </div>
      </div>
      <ResultBox label="Razão de Risco (RR)" value={rr} decimals={2} />
      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
        RR &gt; 1 indica maior risco no grupo exposto; RR próximo de 1 sugere ausência de associação; RR &lt; 1 sugere efeito protetor da exposição.
      </p>
    </CardShell>
  );
}

function Calculators() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg p-2" style={{ background: "#EAF1F7" }}>
          <Calculator size={18} color={NAVY} />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#4B5660" }}>
          Preencha os campos com dados já conhecidos (casos, óbitos, população). Os resultados são calculados automaticamente
          e podem ser transcritos para as seções de avaliação de exposição e caracterização do risco da ficha.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CALCULATORS.map((def) => <GenericCalcCard key={def.id} def={def} />)}
        <RiskRatioCard />
      </div>
    </div>
  );
}

// ---------- Linha do tempo ----------

function AddEventForm({ form, setForm, onAdd }) {
  return (
    <div className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
      <h3 className="text-base font-semibold mb-4" style={{ fontFamily: SERIF, color: NAVY }}>Adicionar marco</h3>
      <div className="grid sm:grid-cols-[160px_1fr_220px_auto] gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: "#4B5660" }}>Data</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-md border px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: LINE, fontFamily: MONO, color: INK }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: "#4B5660" }}>Descrição do marco</span>
          <input
            type="text"
            placeholder="ex.: Confirmação laboratorial do 1º caso"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }}
            className="rounded-md border px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: LINE, color: INK }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: "#4B5660" }}>Categoria</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="rounded-md border px-3 py-2 text-sm focus:outline-none bg-white"
            style={{ borderColor: LINE, color: INK }}
          >
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition"
          style={{ background: NAVY }}
          onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
        {CATEGORIES.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#4B5660" }}>
            <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div
      className="rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-2 py-14 px-6"
      style={{ borderColor: LINE }}
    >
      <Clock size={22} color={MUTED} />
      <p className="text-sm font-medium" style={{ color: "#4B5660" }}>Nenhum marco registrado ainda</p>
      <p className="text-xs max-w-sm" style={{ color: MUTED }}>
        Adicione pelo menos dois marcos (ex.: início dos sintomas, notificação, confirmação laboratorial, medidas de
        controle) para visualizar a linha do tempo do evento.
      </p>
    </div>
  );
}

function TimelineChart({ events }) {
  if (events.length === 0) return <EmptyTimeline />;

  const timestamps = events.map((e) => new Date(e.date + "T00:00:00").getTime());
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);
  const range = max - min;
  const n = events.length;
  const trackWidth = Math.max(680, n * 150);
  const totalDays = range / 86400000;

  function pctFor(t, i) {
    if (range === 0) return n <= 1 ? 50 : (i / (n - 1)) * 100;
    return ((t - min) / range) * 100;
  }

  return (
    <div className="rounded-2xl bg-white border p-6" style={{ borderColor: CARD_BORDER }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: NAVY }}>Linha do tempo do evento</h3>
          <p className="text-xs mt-0.5" style={{ fontFamily: MONO, color: MUTED }}>
            {n} marco{n !== 1 ? "s" : ""} · {formatNum(totalDays, 0)} dia{totalDays !== 1 ? "s" : ""} de duração total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadTimelinePNG(events)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold border transition"
            style={{ borderColor: NAVY, color: NAVY, background: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF1F7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
          >
            <ImageIcon size={14} /> Baixar imagem (PNG)
          </button>
          <button
            onClick={() => downloadTimelineCSV(events)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold border transition"
            style={{ borderColor: NAVY, color: NAVY, background: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF1F7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
          >
            <FileSpreadsheet size={14} /> Baixar dados (CSV)
          </button>
        </div>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="relative" style={{ minWidth: trackWidth + "px", height: "210px" }}>
          <div className="absolute" style={{ left: "24px", right: "24px", top: "50%", height: "1px", background: LINE }} />
          {events.map((e, i) => {
            const pct = pctFor(timestamps[i], i);
            const above = i % 2 === 0;
            const color = (CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[7]).color;
            return (
              <div key={e.id} className="absolute top-0 bottom-0" style={{ left: `${pct}%`, width: 0 }}>
                <div
                  className="absolute rounded-full"
                  style={{
                    top: "50%", left: 0, width: 14, height: 14,
                    marginTop: -7, marginLeft: -7,
                    background: color, border: "3px solid #FFFFFF",
                    boxShadow: "0 1px 4px rgba(28,37,48,0.25)",
                  }}
                />
                <div
                  className="absolute text-center"
                  style={{
                    left: 0, width: 130, marginLeft: -65,
                    top: above ? undefined : "calc(50% + 16px)",
                    bottom: above ? "calc(50% + 16px)" : undefined,
                  }}
                >
                  <div className="mx-auto mb-1 rounded-full" style={{ height: 3, width: 22, background: color }} />
                  <p className="text-[11px] leading-tight" style={{ fontFamily: MONO, color: MUTED }}>{formatDatePtBr(e.date)}</p>
                  <p className="text-xs font-medium leading-snug mt-0.5" style={{ color: INK }}>{e.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventList({ events, onRemove }) {
  if (events.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: CARD_BORDER }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: PAPER }}>
            <th className="text-left font-semibold px-4 py-2.5" style={{ color: "#4B5660", fontSize: 12 }}>Data</th>
            <th className="text-left font-semibold px-4 py-2.5" style={{ color: "#4B5660", fontSize: 12 }}>Marco</th>
            <th className="text-left font-semibold px-4 py-2.5" style={{ color: "#4B5660", fontSize: 12 }}>Categoria</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => {
            const cat = CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[7];
            return (
              <tr key={e.id} style={{ borderTop: `1px solid ${LINE}`, background: i % 2 ? "#FBFBFA" : "#FFFFFF" }}>
                <td className="px-4 py-2.5" style={{ fontFamily: MONO, color: "#4B5660" }}>{formatDatePtBr(e.date)}</td>
                <td className="px-4 py-2.5" style={{ color: INK }}>{e.label}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#4B5660" }}>
                    <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: cat.color }} />
                    {cat.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => onRemove(e.id)}
                    className="rounded-md p-1.5 transition"
                    style={{ color: "#A23B3B" }}
                    aria-label="Remover marco"
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "#FBEAEA")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TimelineTool() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ date: "", label: "", category: "deteccao" });

  function addEvent() {
    if (!form.date || !form.label.trim()) return;
    setEvents((evs) => [...evs, { id: Date.now() + Math.random(), date: form.date, label: form.label.trim(), category: form.category }]);
    setForm({ date: "", label: "", category: form.category });
  }
  function removeEvent(id) {
    setEvents((evs) => evs.filter((e) => e.id !== id));
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6">
      <AddEventForm form={form} setForm={setForm} onAdd={addEvent} />
      <TimelineChart events={sorted} />
      <EventList events={sorted} onRemove={removeEvent} />
    </div>
  );
}

// ---------- shell principal ----------

export default function RiskAssessmentTool() {
  const [tab, setTab] = useState("calc");

  return (
    <div className="min-h-screen" style={{ background: PAPER, fontFamily: SANS, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.6; }
      `}</style>

      <header style={{ background: NAVY }} className="text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: "#9FC0DD" }}>
            Vigilância em Saúde Pública · Avaliação Rápida de Risco
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold" style={{ fontFamily: SERIF }}>
            Calculadoras &amp; Linha do Tempo
          </h1>
          <p className="mt-1 text-base sm:text-lg" style={{ color: "#C9DCEC" }}>
            Ferramenta de apoio à Ficha de Avaliação Rápida de Risco em Saúde Pública
          </p>

          <nav className="mt-6 inline-flex rounded-lg p-1 gap-1" style={{ background: "rgba(255,255,255,0.14)" }}>
            <button
              onClick={() => setTab("calc")}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition"
              style={tab === "calc" ? { background: "#FFFFFF", color: NAVY } : { color: "#E4EEF6" }}
            >
              <Calculator size={15} /> Calculadoras
            </button>
            <button
              onClick={() => setTab("timeline")}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition"
              style={tab === "timeline" ? { background: "#FFFFFF", color: NAVY } : { color: "#E4EEF6" }}
            >
              <Clock size={15} /> Linha do Tempo
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === "calc" ? <Calculators /> : <TimelineTool />}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <p className="text-xs" style={{ color: MUTED }}>
          Elaborado por Fernanda Haltenburg.
        </p>
        <p className="text-xs mt-1" style={{ color: MUTED }}>
          Metodologia de referência: World Health Organization. Rapid Risk Assessment of Acute Public Health Events.
          WHO/HSE/GAR/ARO/2012.1. Genebra: WHO, 2012.
        </p>
      </footer>
    </div>
  );
}

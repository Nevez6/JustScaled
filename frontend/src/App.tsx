import { useEffect, useMemo, useState } from "react";

type ApiHealth = { ok: boolean; name: string };

type SlotDraft = {
  id: string;
  sector: string;
  shift: string;
  role: string;
  min: number;
  max: number;
};

type RequestItem = {
  id: string;
  employee: string;
  sector: string;
  shift: string;
  role: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        tone === "neutral" && "border-white/10 text-white/80 bg-white/5",
        tone === "good" && "border-white/10 text-white bg-white/10",
        tone === "bad" && "border-white/10 text-white bg-white/10",
        tone === "warn" && "border-white/10 text-white bg-white/10"
      )}
    >
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle && <div className="text-xs text-white/60">{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition border",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        variant === "primary" &&
          "bg-white text-black border-white hover:bg-white/90",
        variant === "ghost" &&
          "bg-transparent text-white border-white/10 hover:bg-white/10",
        variant === "danger" &&
          "bg-transparent text-white border-white/10 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/15"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">{children}</tbody>
      </table>
    </div>
  );
}

function formatMonthLabel(yyyyMm: string) {
  // yyyy-mm -> "Fev/2026"
  const [y, m] = yyyyMm.split("-").map((x) => Number(x));
  if (!y || !m) return yyyyMm;
  const dt = new Date(y, m - 1, 1);
  const month = dt.toLocaleString("pt-BR", { month: "short" });
  return `${month.replace(".", "")}/${y}`;
}

export default function App() {
  const [active, setActive] = useState<
    "dashboard" | "periodos" | "slots" | "solicitacoes" | "cobertura" | "publicar"
  >("dashboard");

  const [api, setApi] = useState<{
    status: "idle" | "loading" | "online" | "offline";
    data?: ApiHealth;
  }>({ status: "idle" });

  // Período
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    return `${yyyy}-${mm}`;
  });

  // Gerador de slots (placeholders)
  const [sector, setSector] = useState("Recepção");
  const [shift, setShift] = useState("Noite");
  const [role, setRole] = useState("Atendente");
  const [min, setMin] = useState("2");
  const [max, setMax] = useState("4");
  const [slots, setSlots] = useState<SlotDraft[]>([]);

  // Solicitações (fake)
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: "REQ-001",
      employee: "Ana Silva",
      sector: "Recepção",
      shift: "Noite",
      role: "Atendente",
      hours: 8,
      status: "pending",
    },
    {
      id: "REQ-002",
      employee: "Bruno Costa",
      sector: "A&B",
      shift: "Manhã",
      role: "Garçom",
      hours: 6,
      status: "pending",
    },
    {
      id: "REQ-003",
      employee: "Carla Lima",
      sector: "Governança",
      shift: "Tarde",
      role: "Camareira",
      hours: 8,
      status: "approved",
    },
  ]);

  const selectedMonthLabel = useMemo(() => formatMonthLabel(period), [period]);

  useEffect(() => {
    const run = async () => {
      setApi({ status: "loading" });
      try {
        const res = await fetch("http://localhost:3000/health");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = (await res.json()) as ApiHealth;
        setApi({ status: "online", data });
      } catch {
        setApi({ status: "offline" });
      }
    };
    run();
  }, []);

  const addSlot = () => {
    const newSlot: SlotDraft = {
      id: `SLOT-${String(slots.length + 1).padStart(3, "0")}`,
      sector,
      shift,
      role,
      min: Number(min || 0),
      max: Number(max || 0),
    };
    setSlots((s) => [newSlot, ...s]);
  };

  const removeSlot = (id: string) => {
    setSlots((s) => s.filter((x) => x.id !== id));
  };

  const approve = (id: string) => {
    setRequests((r) =>
      r.map((x) => (x.id === id ? { ...x, status: "approved" } : x))
    );
  };

  const reject = (id: string) => {
    setRequests((r) =>
      r.map((x) => (x.id === id ? { ...x, status: "rejected" } : x))
    );
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const coverage = useMemo(() => {
    // cobertura fake: usa slots criados e conta aprovados por combinação (setor/turno/cargo)
    const approved = requests.filter((r) => r.status === "approved");
    return slots.map((s) => {
      const count = approved.filter(
        (a) =>
          a.sector === s.sector && a.shift === s.shift && a.role === s.role
      ).length;
      return { ...s, approved: count };
    });
  }, [slots, requests]);

  const canPublish = coverage.every((c) => c.approved >= c.min) && coverage.length > 0;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col gap-1 border-r border-white/10 bg-black/30 p-4 md:flex">
          <div className="mb-4">
            <div className="text-lg font-semibold">JustScaled</div>
            <div className="text-xs text-white/60">Painel do RH</div>
          </div>

          {[
            ["dashboard", "Visão Geral"],
            ["periodos", "Criar Período"],
            ["slots", "Gerar Slots"],
            ["solicitacoes", "Fila de Solicitações"],
            ["cobertura", "Painel de Cobertura"],
            ["publicar", "Publicar Escala"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActive(key as any)}
              className={cx(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                active === key ? "bg-white text-black" : "hover:bg-white/10"
              )}
            >
              <span>{label}</span>
              {key === "solicitacoes" && pendingCount > 0 && (
                <span className="rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          <div className="mt-auto pt-4 text-xs text-white/50">
            {api.status === "online" ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>API online ({api.data?.name})</span>
              </div>
            ) : api.status === "loading" ? (
              <span>Verificando API…</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/30" />
                <span>API offline (verifique backend)</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur px-4 py-3">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Gerente de RH</div>
                <div className="text-xs text-white/60">
                  Período selecionado: <span className="text-white">{selectedMonthLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Pill tone={api.status === "online" ? "good" : "warn"}>
                  {api.status === "online" ? "API ONLINE" : "API OFFLINE"}
                </Pill>
                <Button variant="ghost" onClick={() => setActive("dashboard")}>
                  Home
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-12">
            {/* Visão geral */}
            {active === "dashboard" && (
              <>
                <div className="md:col-span-8">
                  <Card
                    title="Resumo do mês"
                    subtitle="Painel rápido do período atual (placeholder)"
                    right={<Pill>{selectedMonthLabel}</Pill>}
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-white/60">Slots criados</div>
                        <div className="text-2xl font-semibold">{slots.length}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-white/60">Solicitações pendentes</div>
                        <div className="text-2xl font-semibold">{pendingCount}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs text-white/60">Pronto para publicar</div>
                        <div className="text-2xl font-semibold">
                          {canPublish ? "SIM" : "NÃO"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => setActive("periodos")}>Criar período</Button>
                      <Button variant="ghost" onClick={() => setActive("slots")}>
                        Gerar slots
                      </Button>
                      <Button variant="ghost" onClick={() => setActive("solicitacoes")}>
                        Ver fila
                      </Button>
                      <Button variant="ghost" onClick={() => setActive("cobertura")}>
                        Cobertura
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setActive("publicar")}
                        title="Publicar bloqueia se algum slot estiver abaixo do mínimo"
                      >
                        Publicar
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="md:col-span-4">
                  <Card title="Status da API" subtitle="Integração backend (GET /health)">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/60">Endpoint</div>
                      <div className="mt-1 font-mono text-xs text-white/80">
                        http://localhost:3000/health
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">
                          {api.status === "online"
                            ? "Online ✅"
                            : api.status === "loading"
                            ? "Verificando…"
                            : "Offline ⚠️"}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={async () => {
                            setApi({ status: "loading" });
                            try {
                              const res = await fetch("http://localhost:3000/health");
                              if (!res.ok) throw new Error();
                              const data = (await res.json()) as ApiHealth;
                              setApi({ status: "online", data });
                            } catch {
                              setApi({ status: "offline" });
                            }
                          }}
                        >
                          Re-testar
                        </Button>
                      </div>

                      <div className="mt-3 text-xs text-white/60">Resposta</div>
                      <pre className="mt-1 overflow-auto rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white/80">
{api.status === "online"
  ? JSON.stringify(api.data, null, 2)
  : api.status === "loading"
  ? "{ ... }"
  : "{ error: \"offline\" }"}
                      </pre>
                    </div>
                  </Card>
                </div>

                <div className="md:col-span-12">
                  <Card
                    title="Atalhos (MVP)"
                    subtitle="Fluxo que você descreveu: período → slots → aprovar → cobertura → publicar"
                  >
                    <div className="grid gap-3 md:grid-cols-5">
                      {[
                        ["Criar período", "Seleciona mês e cria base da escala"],
                        ["Gerar slots", "Define min/max por setor/turno/função"],
                        ["Fila", "Aprovar/recusar rápido + ver conflitos"],
                        ["Cobertura", "Aprovados vs min/max por slot"],
                        ["Publicar", "Bloqueia se algum slot < min"],
                      ].map(([t, d]) => (
                        <div
                          key={t}
                          className="rounded-xl border border-white/10 bg-black/20 p-3"
                        >
                          <div className="text-sm font-semibold">{t}</div>
                          <div className="text-xs text-white/60">{d}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Criar período */}
            {active === "periodos" && (
              <div className="md:col-span-12">
                <Card title="Criar período (mês)" subtitle="Escolha o mês-base para gerar a escala">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <div className="mb-1 text-xs text-white/60">Mês</div>
                      <Input
                        type="month"
                        value={period}
                        onChange={setPeriod}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end gap-2">
                      <Button
                        onClick={() => alert(`Período criado (placeholder): ${selectedMonthLabel}`)}
                      >
                        Criar período
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setActive("slots")}
                      >
                        Próximo: Gerar slots →
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                    Aqui você pode futuramente:
                    <ul className="mt-2 list-disc pl-5 text-xs text-white/60">
                      <li>Salvar o período no banco (ex: 2026-02)</li>
                      <li>Gerar “padrão do mês” e editar casos específicos</li>
                      <li>Definir regras por semana/final de semana</li>
                    </ul>
                  </div>
                </Card>
              </div>
            )}

            {/* Gerar slots */}
            {active === "slots" && (
              <div className="md:col-span-12">
                <Card
                  title="Gerar slots"
                  subtitle="Por setor / turno / função, com min/max (placeholder)"
                  right={<Pill>{selectedMonthLabel}</Pill>}
                >
                  <div className="grid gap-3 md:grid-cols-5">
                    <div>
                      <div className="mb-1 text-xs text-white/60">Setor</div>
                      <Select
                        value={sector}
                        onChange={setSector}
                        options={[
                          { value: "Recepção", label: "Recepção" },
                          { value: "A&B", label: "A&B" },
                          { value: "Governança", label: "Governança" },
                          { value: "Manutenção", label: "Manutenção" },
                        ]}
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/60">Turno</div>
                      <Select
                        value={shift}
                        onChange={setShift}
                        options={[
                          { value: "Manhã", label: "Manhã" },
                          { value: "Tarde", label: "Tarde" },
                          { value: "Noite", label: "Noite" },
                        ]}
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/60">Função</div>
                      <Select
                        value={role}
                        onChange={setRole}
                        options={[
                          { value: "Atendente", label: "Atendente" },
                          { value: "Garçom", label: "Garçom" },
                          { value: "Camareira", label: "Camareira" },
                          { value: "Técnico", label: "Técnico" },
                        ]}
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/60">Min</div>
                      <Input value={min} onChange={setMin} placeholder="min" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/60">Max</div>
                      <Input value={max} onChange={setMax} placeholder="max" />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={addSlot}>Adicionar slot</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // gera padrão fake
                        setSlots([
                          {
                            id: "SLOT-001",
                            sector: "Recepção",
                            shift: "Manhã",
                            role: "Atendente",
                            min: 2,
                            max: 4,
                          },
                          {
                            id: "SLOT-002",
                            sector: "Recepção",
                            shift: "Noite",
                            role: "Atendente",
                            min: 2,
                            max: 3,
                          },
                          {
                            id: "SLOT-003",
                            sector: "Governança",
                            shift: "Tarde",
                            role: "Camareira",
                            min: 3,
                            max: 6,
                          },
                        ]);
                      }}
                      title="Gera um padrão do mês (placeholder)"
                    >
                      Gerar padrão do mês
                    </Button>
                    <Button variant="ghost" onClick={() => setSlots([])}>
                      Limpar
                    </Button>
                    <Button variant="ghost" onClick={() => setActive("solicitacoes")}>
                      Próximo: Fila →
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Table headers={["ID", "Setor", "Turno", "Função", "Min", "Max", "Ações"]}>
                      {slots.length === 0 ? (
                        <tr>
                          <td className="px-3 py-3 text-white/60" colSpan={7}>
                            Nenhum slot criado ainda.
                          </td>
                        </tr>
                      ) : (
                        slots.map((s) => (
                          <tr key={s.id} className="text-white/80">
                            <td className="px-3 py-2 font-mono text-xs">{s.id}</td>
                            <td className="px-3 py-2">{s.sector}</td>
                            <td className="px-3 py-2">{s.shift}</td>
                            <td className="px-3 py-2">{s.role}</td>
                            <td className="px-3 py-2">{s.min}</td>
                            <td className="px-3 py-2">{s.max}</td>
                            <td className="px-3 py-2">
                              <Button variant="ghost" onClick={() => removeSlot(s.id)}>
                                Remover
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {/* Fila de solicitações */}
            {active === "solicitacoes" && (
              <div className="md:col-span-12">
                <Card
                  title="Fila de solicitações"
                  subtitle="Aprovar/recusar rápido + ver conflitos (placeholder)"
                  right={<Pill>{pendingCount} pendentes</Pill>}
                >
                  <div className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
                    Conflitos (placeholder): aqui você mostraria alertas de horas máximas,
                    sobreposição e slot cheio.
                  </div>

                  <Table headers={["ID", "Funcionário", "Setor", "Turno", "Função", "Horas", "Status", "Ações"]}>
                    {requests.map((r) => (
                      <tr key={r.id} className="text-white/80">
                        <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                        <td className="px-3 py-2">{r.employee}</td>
                        <td className="px-3 py-2">{r.sector}</td>
                        <td className="px-3 py-2">{r.shift}</td>
                        <td className="px-3 py-2">{r.role}</td>
                        <td className="px-3 py-2">{r.hours}</td>
                        <td className="px-3 py-2">
                          <Pill
                            tone={
                              r.status === "approved"
                                ? "good"
                                : r.status === "rejected"
                                ? "bad"
                                : "warn"
                            }
                          >
                            {r.status}
                          </Pill>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              disabled={r.status !== "pending"}
                              onClick={() => approve(r.id)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={r.status !== "pending"}
                              onClick={() => reject(r.id)}
                            >
                              Recusar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Table>

                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" onClick={() => setActive("cobertura")}>
                      Próximo: Cobertura →
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Painel de cobertura */}
            {active === "cobertura" && (
              <div className="md:col-span-12">
                <Card
                  title="Painel de cobertura"
                  subtitle="Para cada slot: aprovados / min / max (placeholder)"
                >
                  <Table headers={["Slot", "Setor", "Turno", "Função", "Aprovados", "Min", "Max", "Status"]}>
                    {coverage.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-white/60" colSpan={8}>
                          Crie slots para ver a cobertura.
                        </td>
                      </tr>
                    ) : (
                      coverage.map((c) => {
                        const ok = c.approved >= c.min;
                        return (
                          <tr key={c.id} className="text-white/80">
                            <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                            <td className="px-3 py-2">{c.sector}</td>
                            <td className="px-3 py-2">{c.shift}</td>
                            <td className="px-3 py-2">{c.role}</td>
                            <td className="px-3 py-2">{c.approved}</td>
                            <td className="px-3 py-2">{c.min}</td>
                            <td className="px-3 py-2">{c.max}</td>
                            <td className="px-3 py-2">
                              <Pill tone={ok ? "good" : "warn"}>
                                {ok ? "OK" : "ABAIXO DO MIN"}
                              </Pill>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </Table>

                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" onClick={() => setActive("publicar")}>
                      Próximo: Publicar →
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Publicar */}
            {active === "publicar" && (
              <div className="md:col-span-12">
                <Card
                  title="Publicar escala"
                  subtitle="Bloqueia se algum slot < min (placeholder)"
                  right={<Pill tone={canPublish ? "good" : "warn"}>{canPublish ? "LIBERADO" : "BLOQUEADO"}</Pill>}
                >
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                    Regras (MVP):
                    <ul className="mt-2 list-disc pl-5 text-xs text-white/60">
                      <li>Se existir slot com aprovados &lt; min → bloquear publicação</li>
                      <li>Ao publicar, a escala do mês vira “fixa” (travada)</li>
                      <li>Depois, só mudanças com novo ciclo/aprovação</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => alert("Escala publicada (placeholder) ✅")}
                      disabled={!canPublish}
                      title={!canPublish ? "Crie slots e aprove até bater o mínimo" : undefined}
                    >
                      Publicar
                    </Button>
                    <Button variant="ghost" onClick={() => setActive("slots")}>
                      Voltar para slots
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/30 px-4 py-3">
            <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-white/50">
              <span>JustScaled • MVP UI</span>
              <span>Frontend: :5173 • Backend: :3000</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
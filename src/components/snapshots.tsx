import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  CircleCheck,
  Clock,
  Download,
  FileUp,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

/* ============================================================
   PRODUCT SNAPSHOT COMPONENTS — display-only mockups.
   All data hardcoded (Somali demo context, "Nuurka Academy").
   Palette per brief: Deep Blue #1D3557 · Green #2EC4B6 ·
   Red #E63946 · Amber #FFB703 · Apple-clean surfaces.
   ============================================================ */

const BLUE = "#1D3557";
const GREEN = "#2EC4B6";
const RED = "#E63946";
const AMBER = "#FFB703";

function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="w-full max-w-[390px]">
      <div className="rounded-[40px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.35)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#f5f5f7]">
          <div className="absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="pt-2">{children}</div>
        </div>
      </div>
      {label && <p className="mt-3 text-center text-xs font-medium text-slate-400">{label}</p>}
    </div>
  );
}

function Avatar({ initials, bg = BLUE }: { initials: string; bg?: string }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
      style={{ background: bg }}
    >
      {initials}
    </span>
  );
}

function WaBtn({ label = "" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
      style={{ background: GREEN }}
    >
      <MessageCircle className="size-3" />
      {label || "WhatsApp"}
    </span>
  );
}

function StatCard({
  value,
  label,
  sub,
  bg,
  dark = true,
}: {
  value: string;
  label: string;
  sub: string;
  bg: string;
  dark?: boolean;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <p className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>{value}</p>
      <p className={`text-[9px] font-semibold ${dark ? "text-white/90" : "text-slate-600"}`}>{label}</p>
      <p className={`text-[8px] ${dark ? "text-white/70" : "text-slate-400"}`}>{sub}</p>
    </div>
  );
}

const MONTHS = [
  ["Jan", 34], ["Feb", 42], ["Mar", 50], ["Apr", 58], ["May", 66], ["Jun", 86],
] as const;

function MiniBarChart({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold text-slate-800">Fee Collection — Last 6 Months</p>
      <div className={compact ? "mt-2 flex h-16 items-end gap-1.5" : "mt-2 flex h-20 items-end gap-2"}>
        {MONTHS.map(([m, h], i) => (
          <div key={m} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm"
              style={{ height: `${h}%`, background: i === MONTHS.length - 1 ? BLUE : "#d7e3f2" }}
            />
            <span className="text-[7px] font-medium text-slate-400">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RECENT = [
  { i: "FH", name: "Faadumo Hassan", meta: "Grade 2 · EVC Plus", amt: "$30", when: "Today, 9:42am" },
  { i: "CW", name: "Cabdi Warsame", meta: "Grade 1 · Cash", amt: "$30", when: "Today, 8:15am" },
  { i: "HM", name: "Hodan Maxamed", meta: "Grade 3 · Zaad", amt: "$35", when: "Yesterday" },
];

const OVERDUE = [
  { name: "Yasin Ibraahim", cls: "Grade 2", amt: "$30" },
  { name: "Nasteexo Cali", cls: "Grade 1", amt: "$30" },
];

/** Shared dashboard screen used by Snapshot 1 and the hero mockup. */
function DashboardScreen() {
  return (
    <div className="pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white px-4 pb-2 pt-7">
        <p className="text-sm font-bold" style={{ color: BLUE }}>Nuurka Academy</p>
        <span className="relative">
          <Bell className="size-4 text-slate-500" />
          <span
            className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full text-[8px] font-bold text-white"
            style={{ background: RED }}
          >
            3
          </span>
        </span>
      </div>
      {/* Greeting */}
      <div className="bg-white px-4 pb-3">
        <p className="text-[13px] font-semibold text-slate-900">Subax wanaagsan, Xasan</p>
        <p className="text-[10px] text-slate-400">Good morning, Xasan · Sabti, Okt 14, 2026</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 px-3 pt-3">
        <StatCard value="$2,340" label="Collected This Month" sub="47 payments" bg={BLUE} />
        <StatCard value="78 / 100" label="Students Paid" sub="This month" bg={GREEN} />
        <StatCard value="22 Students" label="Overdue" sub="Haven't paid yet" bg={RED} />
        <StatCard value="100" label="Total Students" sub="4 classes" bg="#e8e8ed" dark={false} />
      </div>
      <div className="mt-2.5 px-3">
        <MiniBarChart compact />
      </div>
      {/* Recent payments */}
      <div className="mx-3 mt-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-bold text-slate-800">Recent Payments</p>
        {RECENT.map((r) => (
          <div key={r.name} className="flex items-center gap-2 border-t border-slate-100 py-2 first:border-0 first:pt-1.5">
            <Avatar initials={r.i} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-slate-900">{r.name}</p>
              <p className="text-[8px] text-slate-400">{r.meta} · {r.when}</p>
            </div>
            <span className="text-[11px] font-bold" style={{ color: GREEN }}>{r.amt}</span>
          </div>
        ))}
        <p className="pt-1 text-right text-[9px] font-semibold" style={{ color: BLUE }}>View all payments →</p>
      </div>
      {/* Overdue */}
      <div className="mx-3 mt-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold text-slate-800">Students With Unpaid Fees</p>
          <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ background: RED }}>22</span>
        </div>
        {OVERDUE.map((o) => (
          <div key={o.name} className="flex items-center gap-2 border-t border-slate-100 py-2 first:mt-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-slate-900">{o.name}</p>
              <p className="text-[8px] text-slate-400">{o.cls} · {o.amt} overdue</p>
            </div>
            <WaBtn />
          </div>
        ))}
        <p className="pt-1 text-right text-[9px] font-semibold" style={{ color: BLUE }}>View all 22 →</p>
      </div>
      {/* Bottom nav */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: Users, label: "Students", active: false },
          { icon: Wallet, label: "Payments", active: false },
          { icon: BarChart3, label: "Reports", active: false },
          { icon: Settings, label: "Settings", active: false },
        ].map((t) => (
          <div key={t.label} className="flex flex-col items-center gap-0.5">
            <t.icon className="size-4" style={{ color: t.active ? BLUE : "#a1a1aa" }} />
            <span className="text-[8px] font-semibold" style={{ color: t.active ? BLUE : "#a1a1aa" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// PRODUCT SNAPSHOT 1 — Dashboard overview (mobile). Display only, hardcoded demo data.
export const DashboardSnapshot = () => (
  <PhoneFrame label="Dashboard — mobile view">
    <div className="relative">{<DashboardScreen />}</div>
  </PhoneFrame>
);

// PRODUCT SNAPSHOT 2 — Student list (mobile). Display only, hardcoded demo data.
export const StudentsSnapshot = () => {
  const CARDS = [
    { i: "FH", name: "Faadumo Hassan", meta: "Grade 2 · Parent: Hodan Maxamed", badge: "PAID", bg: GREEN, amt: "$30 / $30", border: false },
    { i: "YI", name: "Yasin Ibraahim", meta: "Grade 1 · Parent: Ibraahim Nuur", badge: "OVERDUE", bg: RED, amt: "$0 / $30", border: true },
    { i: "NM", name: "Nimo Maxamed", meta: "Grade 3 · Parent: Maxamed Cali", badge: "PARTIAL", bg: AMBER, amt: "$15 / $35", border: false },
    { i: "AH", name: "Axmed Hassan", meta: "Grade 2 · Parent: Hassan Warsame", badge: "PAID", bg: GREEN, amt: "$30 / $30", border: false },
    { i: "SC", name: "Sahra Cabdi", meta: "Grade 4 · Parent: Cabdi Ibraahim", badge: "OVERDUE", bg: RED, amt: "$0 / $40", border: true },
  ];
  return (
    <PhoneFrame label="Students — mobile view">
      <div className="pb-4">
        <div className="flex items-center justify-between bg-white px-4 pb-3 pt-7">
          <ChevronLeft className="size-5 text-slate-600" />
          <p className="text-sm font-bold" style={{ color: BLUE }}>Students</p>
          <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: BLUE }}>
            <Plus className="size-3" /> Add
          </span>
        </div>
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Search className="size-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Search students…</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-600">All Classes ▾</span>
            <span className="text-[9px] font-semibold text-slate-400">100 students · 4 classes</span>
          </div>
          <div className="mt-2 space-y-2">
            {CARDS.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                style={c.border ? { borderLeft: `3px solid ${RED}` } : undefined}
              >
                <Avatar initials={c.i} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-slate-900">{c.name}</p>
                  <p className="truncate text-[8px] text-slate-400">{c.meta}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ background: c.bg }}>{c.badge}</span>
                  <p className="mt-0.5 text-[9px] font-bold text-slate-700">{c.amt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

// PRODUCT SNAPSHOT 3 — Record payment modal (mobile). Display only, hardcoded demo data.
export const PaymentModalSnapshot = () => (
  <PhoneFrame label="Record payment — bottom sheet">
    <div className="relative min-h-[520px]">
      <div className="absolute inset-0 bg-[#dfe5ee] opacity-70 backdrop-blur-sm px-4 pt-8">
        <p className="text-sm font-bold" style={{ color: BLUE }}>Nuurka Academy</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
        <p className="text-sm font-bold text-slate-900">Record Payment</p>
        <p className="text-[10px] text-slate-400">Enter payment details below</p>
        <div className="mt-3 space-y-2.5">
          <div>
            <p className="text-[9px] font-semibold text-slate-500">Student</p>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-900">Faadumo Hassan</p>
                <p className="text-[9px] text-slate-400">Grade 2 · $30/month</p>
              </div>
              <CircleCheck className="size-4" style={{ color: GREEN }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-semibold text-slate-500">Amount</p>
              <div className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-900">$30.00</div>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-500">Date</p>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-900">
                Today, Oct 14, 2026 <Calendar className="size-3 text-slate-400" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-slate-500">Payment Method</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["EVC Plus", "Zaad", "Cash", "Bank"].map((m, i) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold"
                  style={i === 0 ? { background: BLUE, color: "#fff" } : { background: "#f5f5f7", color: "#52525b" }}
                >
                  {i === 0 && <Check className="size-3" />}
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-semibold text-slate-500">Month For</p>
              <div className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-900">October 2026</div>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-500">Reference (Optional)</p>
              <div className="mt-1 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-[10px] text-slate-400">EVC code…</div>
            </div>
          </div>
          <div
            className="mt-1 rounded-xl py-3 text-center text-[12px] font-bold text-white shadow-sm"
            style={{ background: BLUE }}
          >
            Record Payment — $30
          </div>
          <p className="text-center text-[9px] text-slate-400">Receipt sent to parent</p>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

// PRODUCT SNAPSHOT 4 — Dashboard desktop (browser view). Display only, hardcoded demo data.
export const DashboardDesktopSnapshot = () => {
  const NAV = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Users, label: "Students", active: false },
    { icon: GraduationCap, label: "Classes", active: false },
    { icon: Wallet, label: "Payments", active: false },
    { icon: BarChart3, label: "Reports", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];
  const ROWS = [
    ...RECENT,
    { i: "YI", name: "Yasin Ibraahim", meta: "Grade 2 · EVC Plus", amt: "$30", when: "Yesterday" },
    { i: "AH", name: "Axmed Hassan", meta: "Grade 2 · Cash", amt: "$30", when: "Oct 13" },
  ];
  return (
    <div className="w-full max-w-[900px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_60px_-24px_rgba(0,0,0,0.25)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-[10px] text-slate-400">app.duqsipay.com/dashboard</span>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-[220px] shrink-0 flex-col border-r border-slate-200 bg-white p-3 sm:flex">
          <div className="flex items-center gap-2 px-1 pt-1">
            <div className="grid size-7 place-items-center rounded-lg text-white" style={{ background: BLUE }}>
              <GraduationCap className="size-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900">DuqsiPay</p>
              <p className="text-[9px] text-slate-400">Nuurka Academy</p>
            </div>
          </div>
          <div className="my-3 border-t border-slate-100" />
          <nav className="space-y-1">
            {NAV.map((n) => (
              <div
                key={n.label}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold"
                style={n.active ? { background: BLUE, color: "#fff" } : { color: "#6e6e73" }}
              >
                <n.icon className="size-3.5" />
                {n.label}
              </div>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
            <Avatar initials="XM" />
            <div>
              <p className="text-[10px] font-semibold text-slate-900">Xasan Maxamed</p>
              <p className="text-[8px] text-slate-400">Admin</p>
            </div>
          </div>
        </aside>
        {/* Main */}
        <main className="min-w-0 flex-1 bg-[#f5f5f7] p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold text-slate-900">Good morning, Xasan</p>
            <p className="text-[10px] text-slate-400">Monday, October 14, 2026</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <StatCard value="$2,340" label="Collected This Month" sub="47 payments" bg={BLUE} />
            <StatCard value="78 / 100" label="Students Paid" sub="This month" bg={GREEN} />
            <StatCard value="22" label="Overdue Students" sub="Haven't paid yet" bg={RED} />
            <StatCard value="100" label="Total Students" sub="4 classes" bg="#e8e8ed" dark={false} />
          </div>
          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <MiniBarChart />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 lg:col-span-2">
              <p className="text-[10px] font-bold text-slate-800">Quick Actions</p>
              <div className="mt-2 space-y-1.5">
                {[
                  { icon: Plus, label: "Record Payment", primary: true },
                  { icon: Send, label: "Send Reminders", primary: false },
                  { icon: FileUp, label: "Export Report", primary: false },
                ].map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-bold"
                    style={
                      a.primary
                        ? { background: BLUE, color: "#fff", borderColor: BLUE }
                        : { borderColor: "#e8e8ed", color: BLUE }
                    }
                  >
                    <a.icon className="size-3.5" />
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold text-slate-800">Recent Payments</p>
              <table className="mt-1.5 w-full text-left">
                <thead>
                  <tr className="text-[8px] uppercase text-slate-400">
                    <th className="py-1 font-semibold">Student</th>
                    <th className="font-semibold">Class</th>
                    <th className="font-semibold">Method</th>
                    <th className="font-semibold">Date</th>
                    <th className="text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, idx) => (
                    <tr key={r.name} className={idx % 2 ? "bg-slate-50/70" : ""}>
                      <td className="py-1.5 text-[9px] font-semibold text-slate-800">{r.name}</td>
                      <td className="text-[9px] text-slate-500">{r.meta.split(" · ")[0]}</td>
                      <td className="text-[9px] text-slate-500">{r.meta.split(" · ")[1]}</td>
                      <td className="text-[9px] text-slate-500">{r.when}</td>
                      <td className="text-right text-[9px] font-bold" style={{ color: GREEN }}>{r.amt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold text-slate-800">Overdue This Month</p>
                <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ background: RED }}>22</span>
              </div>
              {[...OVERDUE, { name: "Sahra Cabdi", cls: "Grade 4", amt: "$40" }, { name: "Axmed Nuur", cls: "Grade 3", amt: "$35" }, { name: "Nimo Maxamed", cls: "Grade 3", amt: "$20" }].slice(0, 5).map((o) => (
                <div key={o.name} className="flex items-center gap-2 border-t border-slate-100 py-1.5 first:mt-1">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-semibold text-slate-900">{o.name}</p>
                    <p className="text-[8px] text-slate-400">{o.cls}</p>
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: RED }}>{o.amt}</span>
                  <WaBtn />
                </div>
              ))}
              <p className="pt-1 text-right text-[9px] font-semibold" style={{ color: BLUE }}>View all 22 →</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// PRODUCT SNAPSHOT 5 — Receipt (mobile). Display only, hardcoded demo data.
export const ReceiptSnapshot = () => (
  <PhoneFrame label="Receipt — print, PDF & WhatsApp">
    <div className="px-4 pb-6 pt-9">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
        <p className="text-center text-sm font-bold tracking-wide" style={{ color: BLUE }}>NUURKA ACADEMY</p>
        <p className="text-center text-[9px] text-slate-400">Mogadishu, Somalia · +252 61 555 0100</p>
        <div className="my-2.5 border-t border-slate-200" />
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">Fee Payment Receipt</p>
        <p className="mt-0.5 text-center font-mono text-[10px] font-bold text-slate-900">#2026-1089</p>
        <div className="my-2.5 border-t border-dashed border-slate-300" />
        <dl className="space-y-1.5 text-[10px]">
          {[
            ["Student", "Faadumo Hassan"],
            ["Class", "Grade 2"],
            ["Month", "October 2026"],
            ["Amount", "$30.00"],
            ["Method", "EVC Plus"],
            ["Reference", "EVC-20261014-4892"],
            ["Date", "Oct 14, 2026"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-slate-400">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="my-2.5 border-t border-dashed border-slate-300" />
        <p className="text-center text-[10px] font-medium text-slate-600">
          Thank you for your payment.
          <br />
          Your child&apos;s education matters.
        </p>
        <p className="mt-2 text-center text-[9px] text-slate-400">Received by: Xasan Maxamed (Admin)</p>
        <div className="my-2.5 border-t border-dashed border-slate-300" />
        <div className="mx-auto grid size-14 place-items-center rounded-md bg-slate-100">
          <span className="text-[7px] font-medium text-slate-400">QR CODE</span>
        </div>
        <p className="mt-1 text-center text-[8px] text-slate-400">Scan to verify payment</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700">
          <Printer className="size-3.5" /> Print Receipt
        </span>
        <span className="inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold text-white" style={{ background: GREEN }}>
          <MessageCircle className="size-3.5" /> WhatsApp to Parent
        </span>
      </div>
    </div>
  </PhoneFrame>
);

// PRODUCT SNAPSHOT 6 — Reports (mobile). Display only, hardcoded demo data.
export const ReportsSnapshot = () => (
  <PhoneFrame label="Reports — know your numbers">
    <div className="px-4 pb-6 pt-9">
      <p className="text-base font-bold text-slate-900">Reports</p>
      <p className="text-[10px] text-slate-400">October 2026</p>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold text-slate-900">Monthly Summary — October 2026</p>
        <dl className="mt-2 space-y-1.5 text-[10px]">
          <div className="flex justify-between"><dt className="text-slate-400">Expected</dt><dd className="font-semibold text-slate-900">$3,000</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Collected</dt><dd className="font-bold" style={{ color: GREEN }}>$2,340</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">Outstanding</dt><dd className="font-bold" style={{ color: RED }}>$660</dd></div>
        </dl>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: "78%", background: BLUE }} />
          </div>
          <span className="text-[9px] font-bold text-slate-700">78%</span>
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-semibold">
          <span style={{ color: GREEN }}>Paid: 78 students ✓</span>
          <span style={{ color: RED }}>Unpaid: 22 students ✗</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-700">
            <Download className="size-3" /> Export CSV
          </span>
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-700">
            <Printer className="size-3" /> Print
          </span>
        </div>
      </div>
      <div className="mt-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-900">Overdue Students</p>
          <span className="text-[9px] font-bold" style={{ color: RED }}>22 owe $660</span>
        </div>
        {OVERDUE.concat([{ name: "Sahra Cabdi", cls: "Grade 4", amt: "$40" }]).map((o) => (
          <div key={o.name} className="flex items-center gap-2 border-t border-slate-100 py-1.5 first:mt-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-slate-900">{o.name}</p>
              <p className="text-[8px] text-slate-400">{o.cls} · {o.amt} overdue</p>
            </div>
            <WaBtn />
          </div>
        ))}
        <span className="mt-2 block rounded-xl py-2.5 text-center text-[10px] font-bold text-white" style={{ background: GREEN }}>
          Send All Reminders
        </span>
      </div>
    </div>
  </PhoneFrame>
);

// PRODUCT SNAPSHOT 7 — Hero phone mockup with 3D angle + floating badges.
export const HeroPhoneMockup = () => (
  <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]">
    <div
      className="relative"
      style={{
        transform: "perspective(1000px) rotateY(-8deg) rotateX(4deg)",
        boxShadow: "24px 24px 48px rgba(0,0,0,0.2)",
        borderRadius: "46px",
      }}
    >
      <PhoneFrame>
        <div className="relative">
          <DashboardScreen />
        </div>
      </PhoneFrame>
    </div>
    {/* Floating badges */}
    <div className="absolute -right-4 top-10 flex rotate-2 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:-right-10">
      <span className="grid size-6 place-items-center rounded-full" style={{ background: GREEN }}>
        <Check className="size-3.5 text-white" />
      </span>
      <span>
        <span className="block text-[11px] font-bold text-slate-900">$2,340 collected</span>
        <span className="block text-[9px] text-slate-400">This month</span>
      </span>
    </div>
    <div className="absolute -left-4 top-28 flex -rotate-2 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:-left-12">
      <span className="grid size-6 place-items-center rounded-full" style={{ background: GREEN }}>
        <MessageCircle className="size-3.5 text-white" />
      </span>
      <span>
        <span className="block text-[11px] font-bold text-slate-900">Reminders sent</span>
        <span className="block text-[9px] text-slate-400">22 parents notified</span>
      </span>
    </div>
    <div className="absolute -bottom-4 -left-4 flex rotate-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:-left-8">
      <span className="grid size-6 place-items-center rounded-full bg-slate-100">
        <Clock className="size-3.5 text-slate-500" />
      </span>
      <span>
        <span className="block text-[11px] font-bold text-slate-900">15 min/week</span>
        <span className="block text-[9px] text-slate-400">vs 3 hours before</span>
      </span>
    </div>
  </div>
);

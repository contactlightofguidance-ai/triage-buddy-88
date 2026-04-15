import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  AlertTriangle,
  Clock,
  Phone,
  RefreshCw,
  Loader2,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface Patient {
  id: string;
  name: string;
  symptoms: string;
  temperature: number;
  priority: "urgent" | "surveillance";
  resume: string;
  ticketNumber: string;
  status: "waiting" | "called";
  createdAt: string;
}

const API_URL = "http://localhost:8000/api/patients";

const COLORS = {
  urgent: "hsl(0, 72%, 55%)",
  surveillance: "hsl(211, 65%, 45%)",
  waiting: "hsl(38, 92%, 50%)",
  called: "hsl(145, 60%, 42%)",
};

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur serveur");
      setPatients(await res.json());
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 15000);
    return () => clearInterval(interval);
  }, [fetchPatients]);

  const urgentCount = patients.filter((p) => p.priority === "urgent").length;
  const surveillanceCount = patients.filter((p) => p.priority === "surveillance").length;
  const waitingCount = patients.filter((p) => p.status === "waiting").length;
  const calledCount = patients.filter((p) => p.status === "called").length;
  const avgTemp =
    patients.length > 0
      ? (patients.reduce((s, p) => s + p.temperature, 0) / patients.length).toFixed(1)
      : "—";

  const priorityData = [
    { name: "Urgent", value: urgentCount, color: COLORS.urgent },
    { name: "Surveillance", value: surveillanceCount, color: COLORS.surveillance },
  ];

  const statusData = [
    { name: "En attente", value: waitingCount, color: COLORS.waiting },
    { name: "Appelés", value: calledCount, color: COLORS.called },
  ];

  // Group patients by hour for timeline
  const timelineData = (() => {
    const groups: Record<string, { urgent: number; surveillance: number }> = {};
    patients.forEach((p) => {
      const h = new Date(p.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!groups[h]) groups[h] = { urgent: 0, surveillance: 0 };
      groups[h][p.priority]++;
    });
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, counts]) => ({ time, ...counts }));
  })();

  // Temperature distribution
  const tempRanges = [
    { range: "< 37°C", min: 0, max: 37 },
    { range: "37-38°C", min: 37, max: 38 },
    { range: "38-39°C", min: 38, max: 39 },
    { range: "39-40°C", min: 39, max: 40 },
    { range: "> 40°C", min: 40, max: 100 },
  ];
  const tempData = tempRanges.map((r) => ({
    range: r.range,
    count: patients.filter((p) => p.temperature >= r.min && p.temperature < r.max).length,
  }));

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">MedTriage</h1>
              <p className="text-xs text-muted-foreground">Tableau de bord</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">+ Nouveau</Button>
            </Link>
            <Link to="/patients">
              <Button variant="outline" size="sm">File d'attente</Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={fetchPatients} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-3 text-center text-sm text-destructive">
              {error}
              <Button variant="outline" size="sm" className="ml-3" onClick={fetchPatients}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard icon={<Users className="w-4 h-4" />} label="Total" value={patients.length} />
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Urgents" value={urgentCount} variant="destructive" />
          <KpiCard icon={<Clock className="w-4 h-4" />} label="En attente" value={waitingCount} />
          <KpiCard icon={<Phone className="w-4 h-4" />} label="Appelés" value={calledCount} variant="success" />
          <KpiCard icon={<Thermometer className="w-4 h-4" />} label="Temp. moy." value={avgTemp} suffix="°C" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Priority Pie */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Répartition des priorités</CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {priorityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Pie */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Statut des patients</CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Évolution des admissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="urgent"
                      name="Urgent"
                      stackId="1"
                      stroke={COLORS.urgent}
                      fill={COLORS.urgent}
                      fillOpacity={0.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="surveillance"
                      name="Surveillance"
                      stackId="1"
                      stroke={COLORS.surveillance}
                      fill={COLORS.surveillance}
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Temperature Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Distribution des températures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={tempData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Patients" fill="hsl(211, 65%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Mise à jour automatique toutes les 15 secondes
        </p>
      </main>
    </div>
  );
};

function KpiCard({
  icon,
  label,
  value,
  variant,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  variant?: "destructive" | "success";
  suffix?: string;
}) {
  const bg =
    variant === "destructive"
      ? "bg-destructive/10 text-destructive"
      : variant === "success"
        ? "bg-[hsl(145,60%,42%)]/10 text-[hsl(145,60%,42%)]"
        : "bg-primary/10 text-primary";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
      Aucune donnée disponible
    </div>
  );
}

export default Dashboard;

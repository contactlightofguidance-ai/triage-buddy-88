import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, AlertTriangle, Clock, Phone, RefreshCw, Loader2, Thermometer, TrendingUp, BarChart3, AlertCircle,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
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
  urgent: "hsl(4, 72%, 58%)",
  surveillance: "hsl(221, 83%, 53%)",
  waiting: "hsl(38, 92%, 50%)",
  called: "hsl(152, 56%, 42%)",
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
  const avgTemp = patients.length > 0
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

  const timelineData = (() => {
    const groups: Record<string, { urgent: number; surveillance: number }> = {};
    patients.forEach((p) => {
      const h = new Date(p.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      if (!groups[h]) groups[h] = { urgent: 0, surveillance: 0 };
      groups[h][p.priority]++;
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([time, counts]) => ({ time, ...counts }));
  })();

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
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tableau de bord</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Vue d'ensemble en temps réel</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={fetchPatients} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7 shrink-0" onClick={fetchPatients}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard icon={<Users className="w-4 h-4" />} label="Total" value={patients.length} />
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Urgents" value={urgentCount} variant="destructive" />
          <KpiCard icon={<Clock className="w-4 h-4" />} label="En attente" value={waitingCount} variant="warning" />
          <KpiCard icon={<Phone className="w-4 h-4" />} label="Appelés" value={calledCount} variant="success" />
          <KpiCard icon={<Thermometer className="w-4 h-4" />} label="Temp. moy." value={avgTemp} suffix="°C" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ChartCard title="Répartition des priorités" icon={<BarChart3 className="w-3.5 h-3.5" />} empty={patients.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Statut des patients" icon={<Users className="w-3.5 h-3.5" />} empty={patients.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ChartCard title="Évolution des admissions" icon={<TrendingUp className="w-3.5 h-3.5" />} empty={timelineData.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 91%)" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="urgent" name="Urgent" stackId="1" stroke={COLORS.urgent} fill={COLORS.urgent} fillOpacity={0.3} />
                <Area type="monotone" dataKey="surveillance" name="Surveillance" stackId="1" stroke={COLORS.surveillance} fill={COLORS.surveillance} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribution des températures" icon={<Thermometer className="w-3.5 h-3.5" />} empty={patients.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 91%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }} />
                <Bar dataKey="count" name="Patients" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pb-4">
          Mise à jour automatique toutes les 15 secondes
        </p>
      </main>
    </div>
  );
};

function KpiCard({ icon, label, value, variant, suffix }: {
  icon: React.ReactNode; label: string; value: number | string; variant?: "destructive" | "success" | "warning"; suffix?: string;
}) {
  const styles = {
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    default: "bg-primary/10 text-primary",
  };
  const bg = styles[variant || "default"];

  return (
    <Card className="border-0 shadow-sm card-hover">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, icon, empty, children }: {
  title: string; icon: React.ReactNode; empty: boolean; children: React.ReactNode;
}) {
  return (
    <Card className="border-0 shadow-sm card-hover">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {empty ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Aucune donnée</p>
            <p className="text-xs">Les données s'afficheront ici</p>
          </div>
        ) : children}
      </CardContent>
    </Card>
  );
}

export default Dashboard;

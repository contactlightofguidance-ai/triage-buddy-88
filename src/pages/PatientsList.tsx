import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RefreshCw,
  Ticket,
  Clock,
  AlertTriangle,
  Eye,
  Users,
  Phone,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

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

const PatientsList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setPatients(data);
    } catch {
      setError("Impossible de charger les patients. Vérifiez la connexion API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, [fetchPatients]);

  const urgentCount = patients.filter((p) => p.priority === "urgent").length;
  const waitingCount = patients.filter((p) => p.status === "waiting").length;
  const calledCount = patients.filter((p) => p.status === "called").length;

  const sorted = [...patients].sort((a, b) => {
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (a.priority !== "urgent" && b.priority === "urgent") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

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
              <p className="text-xs text-muted-foreground">File d'attente des urgences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                + Nouveau patient
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={fetchPatients} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total" value={patients.length} />
          <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Urgents" value={urgentCount} urgent />
          <StatCard icon={<Clock className="w-4 h-4" />} label="En attente" value={waitingCount} />
          <StatCard icon={<Phone className="w-4 h-4" />} label="Appelés" value={calledCount} />
        </div>

        {/* List */}
        {loading && patients.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchPatients}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : patients.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Aucun patient enregistré</p>
              <Link to="/">
                <Button size="sm" className="mt-3">Ajouter un patient</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map((patient) => (
              <PatientCard key={patient.id} patient={patient} formatTime={formatTime} />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Mise à jour automatique toutes les 10 secondes
        </p>
      </main>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientCard({
  patient,
  formatTime,
}: {
  patient: Patient;
  formatTime: (d: string) => string;
}) {
  const isUrgent = patient.priority === "urgent";
  const isCalled = patient.status === "called";

  return (
    <Card className={`border-0 shadow-sm transition-all ${isUrgent ? "ring-1 ring-destructive/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isUrgent
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {patient.ticketNumber}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{patient.name}</p>
                <Badge
                  variant={isUrgent ? "destructive" : "secondary"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {isUrgent ? "URGENT" : "SURVEILLANCE"}
                </Badge>
                <Badge
                  variant={isCalled ? "default" : "outline"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {isCalled ? "APPELÉ" : "EN ATTENTE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{patient.symptoms}</p>
              {patient.resume && (
                <p className="text-xs text-muted-foreground/80 mt-0.5 truncate italic">
                  {patient.resume}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">{patient.temperature}°C</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {formatTime(patient.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PatientsList;

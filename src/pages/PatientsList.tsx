import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Ticket, Clock, AlertTriangle, Users, Phone, Loader2, AlertCircle, UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

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
      setPatients(await res.json());
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

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">File d'attente</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{patients.length} patient{patients.length !== 1 ? "s" : ""} enregistré{patients.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={fetchPatients} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total" value={patients.length} />
          <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Urgents" value={urgentCount} variant="destructive" />
          <StatCard icon={<Clock className="w-4 h-4" />} label="En attente" value={waitingCount} />
          <StatCard icon={<Phone className="w-4 h-4" />} label="Appelés" value={calledCount} variant="success" />
        </div>

        {loading && patients.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-sm text-foreground font-medium">Erreur de connexion</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-1" onClick={fetchPatients}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : patients.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Aucun patient</p>
              <p className="text-xs text-muted-foreground">Ajoutez votre premier patient pour commencer</p>
              <Link to="/">
                <Button size="sm" className="mt-1 shadow-sm">Ajouter un patient</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {sorted.map((patient) => (
              <PatientCard key={patient.id} patient={patient} formatTime={formatTime} />
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center pb-4">
          Mise à jour automatique toutes les 10 secondes
        </p>
      </main>
    </div>
  );
};

function StatCard({ icon, label, value, variant }: {
  icon: React.ReactNode; label: string; value: number; variant?: "destructive" | "success";
}) {
  const bg = variant === "destructive"
    ? "bg-destructive/10 text-destructive"
    : variant === "success"
      ? "bg-success/10 text-success"
      : "bg-primary/10 text-primary";

  return (
    <Card className="border-0 shadow-sm card-hover">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientCard({ patient, formatTime }: { patient: Patient; formatTime: (d: string) => string }) {
  const isUrgent = patient.priority === "urgent";
  const isCalled = patient.status === "called";

  return (
    <Card className={`border-0 shadow-sm card-hover ${isUrgent ? "ring-1 ring-destructive/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}>
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{patient.ticketNumber}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{patient.name}</p>
                <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 rounded-md">
                  {isUrgent ? "URGENT" : "SURVEILLANCE"}
                </Badge>
                <Badge variant={isCalled ? "default" : "outline"} className="text-[10px] px-1.5 py-0 rounded-md">
                  {isCalled ? "APPELÉ" : "EN ATTENTE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{patient.symptoms}</p>
              {patient.resume && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate italic">{patient.resume}</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <p className="text-sm font-bold text-foreground">{patient.temperature}°C</p>
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

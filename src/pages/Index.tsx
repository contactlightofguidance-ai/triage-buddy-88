import PatientForm from "@/components/PatientForm";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">MedTriage</h1>
              <p className="text-xs text-muted-foreground">Système intelligent de triage des urgences</p>
            </div>
          </div>
          <Link to="/patients">
            <Button variant="outline" size="sm">Voir la file d'attente</Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 flex items-start justify-center min-h-[calc(100vh-73px)]">
        <div className="w-full max-w-lg pt-8">
          <PatientForm />
        </div>
      </main>
    </div>
  );
};

export default Index;

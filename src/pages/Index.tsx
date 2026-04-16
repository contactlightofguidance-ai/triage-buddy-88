import PatientForm from "@/components/PatientForm";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-6 py-10 flex items-start justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-lg">
          <PatientForm />
        </div>
      </main>
    </div>
  );
};

export default Index;

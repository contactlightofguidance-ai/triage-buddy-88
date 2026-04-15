import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "@/components/StepIndicator";
import { Activity, Thermometer, User, ArrowRight, ArrowLeft, Send, Loader2, Wifi, CheckCircle2 } from "lucide-react";

interface FormData {
  name: string;
  symptoms: string;
  age: string;
  temperature: string;
}

interface FormErrors {
  name?: string;
  symptoms?: string;
  temperature?: string;
}

const API_URL = "http://localhost:8000/api/patients";

const PatientForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    symptoms: "",
    age: "",
    temperature: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingTemp, setIsReadingTemp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est obligatoire";
    if (!formData.symptoms.trim()) newErrors.symptoms = "Les symptômes sont obligatoires";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    const temp = parseFloat(formData.temperature);
    if (!formData.temperature) {
      newErrors.temperature = "La température est obligatoire";
    } else if (isNaN(temp) || temp < 30 || temp > 45) {
      newErrors.temperature = "La température doit être entre 30°C et 45°C";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const simulateESP32Read = () => {
    setIsReadingTemp(true);
    setTimeout(() => {
      const simulated = (36 + Math.random() * 4).toFixed(1);
      setFormData((prev) => ({ ...prev, temperature: simulated }));
      setIsReadingTemp(false);
      toast({
        title: "Capteur ESP32",
        description: `Température lue : ${simulated}°C`,
      });
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name.trim(),
        symptoms: formData.symptoms.trim(),
        temperature: parseFloat(formData.temperature),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const data = await response.json();
      console.log("Réponse API :", data);

      setSubmitted(true);
      toast({
        title: "Succès",
        description: "Patient ajouté avec succès",
      });

      setTimeout(() => {
        setFormData({ name: "", symptoms: "", age: "", temperature: "" });
        setStep(1);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur API :", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le patient. Vérifiez la connexion API.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg border-0">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 step-transition">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Patient ajouté avec succès</h3>
          <p className="text-muted-foreground text-sm">Le formulaire sera réinitialisé automatiquement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg medical-gradient flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Nouveau patient</CardTitle>
        </div>
        <CardDescription>
          {step === 1 ? "Informations du patient" : "Données capteur IoT"}
        </CardDescription>
        <StepIndicator currentStep={step} totalSteps={2} />
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-4 step-transition">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Nom du patient <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Jean Dupont"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="flex items-center gap-1.5 text-sm font-medium">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                Symptômes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Décrivez les symptômes..."
                value={formData.symptoms}
                onChange={(e) => handleChange("symptoms", e.target.value)}
                className={`min-h-[80px] ${errors.symptoms ? "border-destructive" : ""}`}
              />
              {errors.symptoms && <p className="text-xs text-destructive">{errors.symptoms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-muted-foreground">
                Âge (optionnel)
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 45"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>

            <Button onClick={handleNext} className="w-full mt-2" size="lg">
              Suivant
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 step-transition">
            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-1.5 text-sm font-medium">
                <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                Température (°C) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="30"
                max="45"
                placeholder="Ex: 37.5"
                value={formData.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                className={errors.temperature ? "border-destructive" : ""}
              />
              {errors.temperature && <p className="text-xs text-destructive">{errors.temperature}</p>}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={simulateESP32Read}
              disabled={isReadingTemp}
            >
              {isReadingTemp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {isReadingTemp ? "Lecture en cours..." : "Lire température depuis ESP32"}
            </Button>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleBack} className="flex-1" size="lg">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientForm;

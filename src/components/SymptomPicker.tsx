import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SYMPTOMS = [
  { id: "fever", label: "Fièvre", emoji: "🤒" },
  { id: "cough", label: "Toux", emoji: "🤧" },
  { id: "chest-pain", label: "Douleur thoracique", emoji: "💔" },
  { id: "headache", label: "Maux de tête", emoji: "🤕" },
  { id: "vomiting", label: "Vomissements", emoji: "🤮" },
  { id: "breathing", label: "Difficultés respiratoires", emoji: "😮‍💨" },
  { id: "abdominal", label: "Douleur abdominale", emoji: "🤢" },
  { id: "fracture", label: "Fracture/Trauma", emoji: "🦴" },
] as const;

interface SymptomPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const SymptomPicker = ({ selected, onChange }: SymptomPickerProps) => {
  const toggle = (label: string) => {
    onChange(
      selected.includes(label)
        ? selected.filter((s) => s !== label)
        : [...selected, label]
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {SYMPTOMS.map((s, i) => {
        const isSelected = selected.includes(s.label);
        return (
          <motion.button
            key={s.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => toggle(s.label)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all",
              "hover:shadow-sm active:scale-[0.97]",
              isSelected
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}
          >
            <span className="text-xl leading-none">{s.emoji}</span>
            <span className="truncate">{s.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SymptomPicker;

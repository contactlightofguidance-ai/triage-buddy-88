import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import feverImg from "@/assets/symptoms/fever.png";
import coughImg from "@/assets/symptoms/cough.png";
import chestPainImg from "@/assets/symptoms/chest-pain.png";
import headacheImg from "@/assets/symptoms/headache.png";
import vomitingImg from "@/assets/symptoms/vomiting.png";
import breathingImg from "@/assets/symptoms/breathing.png";
import abdominalImg from "@/assets/symptoms/abdominal.png";
import fractureImg from "@/assets/symptoms/fracture.png";

const SYMPTOMS = [
  { id: "fever", label: "Fièvre", img: feverImg },
  { id: "cough", label: "Toux", img: coughImg },
  { id: "chest-pain", label: "Douleur thoracique", img: chestPainImg },
  { id: "headache", label: "Maux de tête", img: headacheImg },
  { id: "vomiting", label: "Vomissements", img: vomitingImg },
  { id: "breathing", label: "Difficultés respiratoires", img: breathingImg },
  { id: "abdominal", label: "Douleur abdominale", img: abdominalImg },
  { id: "fracture", label: "Fracture/Trauma", img: fractureImg },
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
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all",
              "hover:shadow-sm active:scale-[0.97]",
              isSelected
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}
          >
            <img
              src={s.img}
              alt={s.label}
              width={36}
              height={36}
              loading="lazy"
              className="shrink-0 rounded"
            />
            <span className="truncate">{s.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SymptomPicker;

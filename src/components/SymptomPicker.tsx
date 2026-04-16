import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            onClick={() => toggle(s.label)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium",
              "transition-all duration-200 cursor-pointer",
              "hover:shadow-sm active:scale-[0.97]",
              isSelected
                ? "border-primary bg-primary/8 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/3"
            )}
          >
            <img
              src={s.img}
              alt={s.label}
              width={32}
              height={32}
              loading="lazy"
              className="shrink-0 rounded-lg"
            />
            <span className="truncate text-xs">{s.label}</span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default SymptomPicker;

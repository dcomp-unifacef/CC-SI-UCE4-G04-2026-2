import { Check, MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "../contexts/ThemeContext";

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Dispositivo", icon: MonitorCog },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Seleção de tema"
      className="inline-flex max-w-full items-center rounded-full border border-border bg-background p-1"
    >
      {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
        const selected = theme === id;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(id)}
            className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
              selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {selected ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
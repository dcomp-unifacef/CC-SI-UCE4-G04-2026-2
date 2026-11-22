import { useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  icon?: ReactNode;
  extra?: ReactNode;
  options?: (string | { value: string; label: string })[];
  uppercase?: boolean;
  className?: string;
};

export default function Field({
  id,
  label,
  icon,
  extra,
  options,
  uppercase = true,
  className = "mb-4",
  type = "text",
  required,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor={id}
          className={`text-sm font-semibold text-card-foreground ${uppercase ? "uppercase" : ""}`}
        >
          {label} {required && <span className="text-link">*</span>}
        </label>
        {extra}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-link">
        {icon}

        {options ? (
          <select
            id={id}
            name={id}
            required={required}
            className="min-w-0 flex-1 bg-background text-sm text-card-foreground outline-none placeholder:text-placeholder"
            {...(props as unknown as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="" disabled>Selecionar</option>
            {options.map((o) =>
              typeof o === "string" ? (
                <option key={o}>{o}</option>
              ) : (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ),
            )}
          </select>
        ) : (
          <input
            id={id}
            name={id}
            type={isPassword && visible ? "text" : type}
            required={required}
            className="min-w-0 flex-1 bg-background text-sm text-card-foreground outline-none placeholder:text-placeholder"
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setVisible(!visible)}
            className="cursor-pointer text-muted"
          >
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

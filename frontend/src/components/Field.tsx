import { useState, type ChangeEvent } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete: "name" | "email" | "current-password" | "new-password"
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  extra?: ReactNode;
};

export default function Field({
  id,
  label,
  icon,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  extra,
}: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="text-sm font-semibold uppercase text-card-foreground">
          {label} <span className="text-link">*</span>
        </label>
        {extra}
      </div>
      <div className="flex items-center gap-2 bg-surface border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-link">
        {icon}
        <input
          id={id}
          name={id}
          type={isPassword ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 min-w-0 text-xs placeholder:text-placeholder border-none outline-none"
          value={value}
          onChange={onChange}
          required
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => {setVisible(!visible)}}
          >
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
  </div>
  );
}

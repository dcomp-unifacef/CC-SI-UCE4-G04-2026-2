import { useState, type ChangeEvent } from "react";

export function useForm<T extends Record<string, string>>(
  initial: T,
  onFieldChange?: () => void,
) {
  const [form, setForm] = useState(initial);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    onFieldChange?.();
  }

  return { form, handleChange };
}

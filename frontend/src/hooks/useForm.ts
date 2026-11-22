import { useState, type ChangeEvent } from "react";

type Element = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function useForm<T extends Record<string, string>>(
  initial: T,
  onFieldChange?: () => void,
) {
  const [form, setForm] = useState(initial);

  function handleChange(e: ChangeEvent<Element>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    onFieldChange?.();
  }

  return { form, handleChange };
}

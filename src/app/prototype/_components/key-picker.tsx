"use client";

import { cn } from "@/lib/utils";

import { KEYS } from "../_lib/chordpro";

export function KeyPicker({
  value,
  onChange,
  originalKey,
}: {
  value: string;
  onChange: (key: string) => void;
  originalKey?: string | null;
}) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="radiogroup" aria-label="Key">
      {KEYS.map((k) => (
        // biome-ignore lint/a11y/useSemanticElements: chip row styled as buttons; radio inputs would need custom styling anyway
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          onClick={() => onChange(k)}
          className={cn(
            "relative h-9 min-w-10 shrink-0 rounded-full border px-3 font-medium text-sm transition-colors",
            value === k ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent",
          )}
        >
          {k}
          {originalKey === k && value !== k && (
            <span className="-top-0.5 -right-0.5 absolute size-2 rounded-full bg-primary" title="Original key" />
          )}
        </button>
      ))}
    </div>
  );
}

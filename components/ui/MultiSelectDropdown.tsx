'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type MultiSelectDropdownProps = {
  value: string[];
  onChange: (val: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
};

export default function MultiSelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Kies categorieën...',
  disabled = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full p-2 border border-border bg-transparent rounded-xl text-left focus:outline-primary flex flex-wrap min-h-[44px] transition ${open ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setOpen(v => !v)}
        disabled={disabled}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          value.map(cat => (
            <span
              key={cat}
              className="bg-primary/10 text-primary px-2 py-1 mr-2 mb-1 rounded-lg text-xs font-medium"
            >
              {cat}
            </span>
          ))
        )}
        <ChevronDown className="ml-auto text-muted-foreground" size={18} />
      </button>
      {open && (
        <div className="absolute z-20 bg-card border border-border rounded-xl mt-2 w-full shadow-xl max-h-60 overflow-auto">
          {options.map(cat => (
            <label
              key={cat}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-accent transition rounded"
            >
              <input
                type="checkbox"
                checked={value.includes(cat)}
                onChange={() => {
                  if (value.includes(cat)) {
                    onChange(value.filter(c => c !== cat));
                  } else {
                    onChange([...value, cat]);
                  }
                }}
                className="mr-2 accent-primary"
                disabled={disabled}
              />
              <span className="text-foreground">{cat}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

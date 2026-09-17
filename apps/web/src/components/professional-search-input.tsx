'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import type { ProfessionalProfile } from '@/lib/types';
import { Input, Label } from '@/components/ui/input';

interface ProfessionalSearchInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (profileId: string) => void;
}

export function ProfessionalSearchInput({
  id,
  label,
  value,
  onChange,
}: ProfessionalSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfessionalProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<ProfessionalProfile | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      apiFetch<ProfessionalProfile[]>(
        `/professionals?q=${encodeURIComponent(query.trim())}&limit=8`,
      )
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectProfile(profile: ProfessionalProfile) {
    setSelected(profile);
    onChange(profile.id);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function clearSelection() {
    setSelected(null);
    onChange('');
    setQuery('');
  }

  if (selected) {
    return (
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="flex items-center justify-between gap-3 rounded-md border border-line-strong bg-canvas px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-fg">{selected.fullName}</p>
            {selected.headline && (
              <p className="truncate text-[12.5px] text-fg-muted">{selected.headline}</p>
            )}
          </div>
          <button
            type="button"
            onClick={clearSelection}
            aria-label="Clear selected professional"
            className="shrink-0 text-fg-faint transition-colors hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
        <Input
          id={id}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name or headline…"
          autoComplete="off"
          className="pl-9"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[var(--shadow-lifted)]">
          {isLoading ? (
            <p className="px-3.5 py-3 text-[13px] text-fg-faint">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3.5 py-3 text-[13px] text-fg-faint">No professionals found.</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => selectProfile(profile)}
                    className="flex w-full flex-col items-start px-3.5 py-2 text-left transition-colors hover:bg-canvas"
                  >
                    <span className="text-[13.5px] font-medium text-fg">{profile.fullName}</span>
                    {profile.headline && (
                      <span className="text-[12px] text-fg-muted">{profile.headline}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

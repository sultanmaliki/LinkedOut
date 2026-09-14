'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import type { ProfessionalSkill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DraftSkill {
  name: string;
  proficiency: string;
  yearsOfExperience: string;
}

function toDraft(skill: ProfessionalSkill): DraftSkill {
  return {
    name: skill.name,
    proficiency: skill.proficiency?.toString() ?? '',
    yearsOfExperience: skill.yearsOfExperience?.toString() ?? '',
  };
}

export function SkillsSection({ token }: { token: string }) {
  const [skills, setSkills] = useState<DraftSkill[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<ProfessionalSkill[]>('/professionals/me/skills', { token }).then((list) =>
      setSkills(list.map(toDraft)),
    );
  }, [token]);

  function updateRow(index: number, patch: Partial<DraftSkill>) {
    setSaved(false);
    setSkills((prev) =>
      prev ? prev.map((row, i) => (i === index ? { ...row, ...patch } : row)) : prev,
    );
  }

  function removeRow(index: number) {
    setSaved(false);
    setSkills((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function addRow() {
    setSaved(false);
    setSkills((prev) => [...(prev ?? []), { name: '', proficiency: '', yearsOfExperience: '' }]);
  }

  async function save() {
    if (!skills) return;
    setError(null);
    setIsSaving(true);

    try {
      const payload = skills
        .filter((row) => row.name.trim())
        .map((row) => ({
          name: row.name.trim(),
          proficiency: row.proficiency ? Number(row.proficiency) : undefined,
          yearsOfExperience: row.yearsOfExperience ? Number(row.yearsOfExperience) : undefined,
        }));

      const result = await apiFetch<ProfessionalSkill[]>('/professionals/me/skills', {
        method: 'PUT',
        token,
        body: { skills: payload },
      });
      setSkills(result.map(toDraft));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save skills');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-medium text-fg">Skills</h3>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              Companies can find you by these when searching for professionals.
            </p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Add skill
          </Button>
        </div>

        {skills === null ? (
          <div className="h-16 animate-pulse rounded-xl bg-canvas" />
        ) : skills.length === 0 ? (
          <p className="text-[13.5px] text-fg-faint">No skills yet. Add your first one.</p>
        ) : (
          <div className="space-y-2">
            {skills.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(index, { name: e.target.value })}
                  placeholder="Skill name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={row.proficiency}
                  onChange={(e) => updateRow(index, { proficiency: e.target.value })}
                  placeholder="Level 1–5"
                  className="w-28"
                />
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={row.yearsOfExperience}
                  onChange={(e) => updateRow(index, { yearsOfExperience: e.target.value })}
                  placeholder="Years"
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="shrink-0 rounded-full p-1.5 text-fg-faint hover:text-rose-600"
                  aria-label={`Remove ${row.name || 'skill'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <Button type="button" size="sm" onClick={save} disabled={isSaving || skills === null}>
            {isSaving ? 'Saving…' : 'Save skills'}
          </Button>
          {saved && <span className="text-[12.5px] text-fg-faint">Saved.</span>}
        </div>
      </CardBody>
    </Card>
  );
}

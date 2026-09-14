import type { ProfessionalSkill } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export function SkillsBadges({ skills }: { skills: ProfessionalSkill[] }) {
  if (skills.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-[13px] font-medium uppercase tracking-[0.04em] text-fg-faint">Skills</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill.skillId} tone="emerald">
            {skill.name}
            {skill.yearsOfExperience ? ` · ${skill.yearsOfExperience}y` : ''}
          </Badge>
        ))}
      </div>
    </div>
  );
}

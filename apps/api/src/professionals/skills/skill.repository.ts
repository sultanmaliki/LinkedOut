import { eq } from 'drizzle-orm';

import { db, professionalSkills, skills } from '@linkedout/database';

export interface ProfessionalSkillRecord {
  skillId: string;
  name: string;
  proficiency: number | null;
  yearsOfExperience: number | null;
}

export interface ProfessionalSkillInput {
  name: string;
  proficiency?: number;
  yearsOfExperience?: number;
}

export class SkillRepository {
  async listForProfile(professionalProfileId: string): Promise<ProfessionalSkillRecord[]> {
    return db
      .select({
        skillId: skills.id,
        name: skills.name,
        proficiency: professionalSkills.proficiency,
        yearsOfExperience: professionalSkills.yearsOfExperience,
      })
      .from(professionalSkills)
      .innerJoin(skills, eq(skills.id, professionalSkills.skillId))
      .where(eq(professionalSkills.professionalProfileId, professionalProfileId));
  }

  async replaceForProfile(
    professionalProfileId: string,
    entries: ProfessionalSkillInput[],
  ): Promise<ProfessionalSkillRecord[]> {
    return db.transaction(async (tx) => {
      const seen = new Set<string>();
      const uniqueEntries = entries.filter((entry) => {
        const key = entry.name.trim().toLowerCase();

        if (!key || seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });

      const result: ProfessionalSkillRecord[] = [];

      for (const entry of uniqueEntries) {
        const name = entry.name.trim();

        const [existing] = await tx.select().from(skills).where(eq(skills.name, name)).limit(1);

        const skill = existing ?? (await tx.insert(skills).values({ name }).returning())[0];

        if (!skill) {
          throw new Error(`Failed to create skill "${name}"`);
        }

        result.push({
          skillId: skill.id,
          name: skill.name,
          proficiency: entry.proficiency ?? null,
          yearsOfExperience: entry.yearsOfExperience ?? null,
        });
      }

      await tx
        .delete(professionalSkills)
        .where(eq(professionalSkills.professionalProfileId, professionalProfileId));

      if (result.length > 0) {
        await tx.insert(professionalSkills).values(
          result.map((entry) => ({
            professionalProfileId,
            skillId: entry.skillId,
            proficiency: entry.proficiency,
            yearsOfExperience: entry.yearsOfExperience,
          })),
        );
      }

      return result;
    });
  }
}

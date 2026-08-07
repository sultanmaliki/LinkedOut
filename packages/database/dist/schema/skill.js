import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Skills
 * ========================================== */
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
/* ==========================================
 * Professional Skills
 * ========================================== */
export const professionalSkills = pgTable(
  'professional_skills',
  {
    professionalProfileId: uuid('professional_profile_id')
      .notNull()
      .references(() => professionalProfiles.id, {
        onDelete: 'cascade',
      }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, {
        onDelete: 'cascade',
      }),
    proficiency: integer('proficiency'),
    yearsOfExperience: integer('years_of_experience'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.professionalProfileId, table.skillId],
    }),
  }),
);
/* ==========================================
 * Relations
 * ========================================== */
export const skillsRelations = relations(skills, ({ many }) => ({
  professionalSkills: many(professionalSkills),
}));
export const professionalSkillsRelations = relations(professionalSkills, ({ one }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [professionalSkills.professionalProfileId],
    references: [professionalProfiles.id],
  }),
  skill: one(skills, {
    fields: [professionalSkills.skillId],
    references: [skills.id],
  }),
}));

import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const clubEnum = pgEnum("club_enum", ["sdc", "gdg", "both"]); // ✅ added 'both' option

export const submissionsTable = pgTable("SDCxGDG_submission", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	firstName: varchar({ length: 50 }).notNull(),
	lastName: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	phoneNumber: varchar({ length: 15 }).notNull(),
	course: varchar({ length: 100 }).notNull(),
	batch: varchar({ length: 20 }).notNull(),
	github: varchar({ length: 255 }).notNull(),
	linkedin: varchar({ length: 255 }).notNull(),
	reason: text().notNull(),
	club: clubEnum().notNull(), // ✅ no argument here
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});

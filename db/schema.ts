import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id").notNull(),
  programme: text("programme").notNull(),
  level: text("level").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const timetableEntries = sqliteTable("timetable_entries", {
  id: text("id").primaryKey(),
  profileEmail: text("profile_email").notNull(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  placeId: integer("place_id"),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  reminderMinutes: integer("reminder_minutes").notNull().default(20),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const issueReports = sqliteTable("issue_reports", {
  id: text("id").primaryKey(),
  reporterEmail: text("reporter_email").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  locationText: text("location_text").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  photoKey: text("photo_key"),
  status: text("status").notNull().default("submitted"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

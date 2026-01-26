import { pgTable, text, serial, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
});

export const outcome = pgTable("outcome", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
});

// === BASE SCHEMAS ===
export const insertIncomeSchema = createInsertSchema(income).omit({ id: true });
export const insertOutcomeSchema = createInsertSchema(outcome).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Income = typeof income.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type Outcome = typeof outcome.$inferSelect;
export type InsertOutcome = z.infer<typeof insertOutcomeSchema>;

// Response types
export type IncomeResponse = Income;
export type OutcomeResponse = Outcome;

// Analytics types
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

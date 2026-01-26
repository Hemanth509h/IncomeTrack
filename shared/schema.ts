import { pgTable, text, serial, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g., 'Groceries', 'Rent'
  limit: decimal("limit", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // 'monthly'
});

// === BASE SCHEMAS ===
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Request types
export type CreateTransactionRequest = InsertTransaction;
export type UpdateTransactionRequest = Partial<InsertTransaction>;

export type CreateBudgetRequest = InsertBudget;
export type UpdateBudgetRequest = Partial<InsertBudget>;

// Response types
export type TransactionResponse = Transaction;
export type BudgetResponse = Budget;

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

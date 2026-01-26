import { db } from "./db";
import {
  transactions, budgets,
  type Transaction, type InsertTransaction,
  type Budget, type InsertBudget,
  type FinancialSummary, type CategoryBreakdown
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  getBudgets(): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;
  getFinancialSummary(): Promise<FinancialSummary>;
  getCategoryBreakdown(): Promise<CategoryBreakdown[]>;
}

export class DatabaseStorage implements IStorage {
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    // Calculate totals
    const result = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
      })
      .from(transactions);

    const { totalIncome, totalExpenses } = result[0];
    const income = Number(totalIncome);
    const expenses = Number(totalExpenses);
    const netBalance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance,
      savingsRate
    };
  }

  async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
    const totalExpensesResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(eq(transactions.type, 'expense'));
    
    const totalExpenses = Number(totalExpensesResult[0].total);

    const breakdown = await db
      .select({
        category: transactions.category,
        amount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .where(eq(transactions.type, 'expense'))
      .groupBy(transactions.category);

    return breakdown.map(item => ({
      category: item.category,
      amount: Number(item.amount),
      percentage: totalExpenses > 0 ? (Number(item.amount) / totalExpenses) * 100 : 0
    }));
  }
}

export const storage = new DatabaseStorage();

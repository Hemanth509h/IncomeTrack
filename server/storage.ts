import {
  type Transaction, type InsertTransaction,
  type Budget, type InsertBudget,
  type FinancialSummary, type CategoryBreakdown
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface LocalData {
  transactions: Transaction[];
  budgets: Budget[];
  nextTransactionId: number;
  nextBudgetId: number;
}

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

export class JsonStorage implements IStorage {
  private data: LocalData | null = null;

  private async load(): Promise<LocalData> {
    if (this.data) return this.data;
    try {
      const content = await fs.readFile(DATA_FILE, "utf-8");
      this.data = JSON.parse(content);
    } catch (e) {
      this.data = {
        transactions: [],
        budgets: [],
        nextTransactionId: 1,
        nextBudgetId: 1,
      };
      await this.save();
    }
    return this.data!;
  }

  private async save(): Promise<void> {
    if (!this.data) return;
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  async getTransactions(): Promise<Transaction[]> {
    const data = await this.load();
    return [...data.transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const data = await this.load();
    const transaction: Transaction = {
      ...insertTransaction,
      id: data.nextTransactionId++,
      date: insertTransaction.date ? new Date(insertTransaction.date) : new Date(),
    };
    data.transactions.push(transaction);
    await this.save();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    const data = await this.load();
    data.transactions = data.transactions.filter(t => t.id !== id);
    await this.save();
  }

  async getBudgets(): Promise<Budget[]> {
    const data = await this.load();
    return data.budgets;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const data = await this.load();
    const budget: Budget = {
      ...insertBudget,
      id: data.nextBudgetId++,
    };
    data.budgets.push(budget);
    await this.save();
    return budget;
  }

  async deleteBudget(id: number): Promise<void> {
    const data = await this.load();
    data.budgets = data.budgets.filter(b => b.id !== id);
    await this.save();
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const data = await this.load();
    let income = 0;
    let expenses = 0;

    for (const t of data.transactions) {
      const amount = Number(t.amount);
      if (t.type === 'income') income += amount;
      else expenses += amount;
    }

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
    const data = await this.load();
    const categoryTotals = new Map<string, number>();
    let totalExpenses = 0;

    for (const t of data.transactions) {
      if (t.type === 'expense') {
        const amount = Number(t.amount);
        totalExpenses += amount;
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + amount);
      }
    }

    return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
  }
}

export const storage = new JsonStorage();

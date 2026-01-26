import {
  type Income, type InsertIncome,
  type Outcome, type InsertOutcome,
  type FinancialSummary, type CategoryBreakdown
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface LocalData {
  income: Income[];
  outcome: Outcome[];
  nextIncomeId: number;
  nextOutcomeId: number;
}

export interface IStorage {
  getIncome(): Promise<Income[]>;
  createIncome(data: InsertIncome): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  
  getOutcome(): Promise<Outcome[]>;
  createOutcome(data: InsertOutcome): Promise<Outcome>;
  deleteOutcome(id: number): Promise<void>;

  getFinancialSummary(): Promise<FinancialSummary>;
  getCategoryBreakdown(): Promise<CategoryBreakdown[]>;
}

export class JsonStorage implements IStorage {
  private data: LocalData | null = null;

  private async load(): Promise<LocalData> {
    if (this.data) return this.data;
    try {
      const content = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      
      // Migration logic if converting from old transactions structure
      if (parsed.transactions) {
        const income: Income[] = [];
        const outcome: Outcome[] = [];
        let nextIncomeId = 1;
        let nextOutcomeId = 1;

        for (const t of parsed.transactions) {
          if (t.type === 'income') {
            income.push({ ...t, id: nextIncomeId++ });
          } else {
            outcome.push({ ...t, id: nextOutcomeId++ });
          }
        }
        
        this.data = {
          income,
          outcome,
          nextIncomeId,
          nextOutcomeId
        };
        await this.save();
      } else {
        this.data = parsed;
      }
    } catch (e) {
      this.data = {
        income: [],
        outcome: [],
        nextIncomeId: 1,
        nextOutcomeId: 1,
      };
      await this.save();
    }
    return this.data!;
  }

  private async save(): Promise<void> {
    if (!this.data) return;
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  async getIncome(): Promise<Income[]> {
    const data = await this.load();
    return [...data.income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createIncome(insert: InsertIncome): Promise<Income> {
    const data = await this.load();
    const record: Income = {
      ...insert,
      id: data.nextIncomeId++,
      date: insert.date ? new Date(insert.date) : new Date(),
      description: insert.description ?? null,
    };
    data.income.push(record);
    await this.save();
    return record;
  }

  async deleteIncome(id: number): Promise<void> {
    const data = await this.load();
    data.income = data.income.filter(t => t.id !== id);
    await this.save();
  }

  async getOutcome(): Promise<Outcome[]> {
    const data = await this.load();
    return [...data.outcome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createOutcome(insert: InsertOutcome): Promise<Outcome> {
    const data = await this.load();
    const record: Outcome = {
      ...insert,
      id: data.nextOutcomeId++,
      date: insert.date ? new Date(insert.date) : new Date(),
      description: insert.description ?? null,
    };
    data.outcome.push(record);
    await this.save();
    return record;
  }

  async deleteOutcome(id: number): Promise<void> {
    const data = await this.load();
    data.outcome = data.outcome.filter(t => t.id !== id);
    await this.save();
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const data = await this.load();
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of data.income) {
      totalIncome += Number(t.amount);
    }
    for (const t of data.outcome) {
      totalExpenses += Number(t.amount);
    }

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate
    };
  }

  async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
    const data = await this.load();
    const categoryTotals = new Map<string, number>();
    let totalExpenses = 0;

    for (const t of data.outcome) {
      const amount = Number(t.amount);
      totalExpenses += amount;
      categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + amount);
    }

    return Array.from(categoryTotals.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
  }
}

export const storage = new JsonStorage();

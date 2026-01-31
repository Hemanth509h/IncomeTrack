import {
  type Income, type InsertIncome,
  type Outcome, type InsertOutcome,
  type FinancialSummary, type CategoryBreakdown
} from "@shared/schema";
import { MongoClient, Db, Collection, ObjectId } from "mongodb";

export interface IStorage {
  getIncome(month?: number, year?: number): Promise<Income[]>;
  createIncome(data: InsertIncome): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  updateIncome(id: number, data: Partial<InsertIncome>): Promise<Income>;
  
  getOutcome(month?: number, year?: number): Promise<Outcome[]>;
  createOutcome(data: InsertOutcome): Promise<Outcome>;
  deleteOutcome(id: number): Promise<void>;
  updateOutcome(id: number, data: Partial<InsertOutcome>): Promise<Outcome>;

  adjustBalance(amount: number, month?: number, year?: number): Promise<void>;
  resetData(): Promise<void>;
  getFinancialSummary(month?: number, year?: number): Promise<FinancialSummary>;
  getCategoryBreakdown(month?: number, year?: number): Promise<CategoryBreakdown[]>;
}

interface CounterDoc {
  _id: string;
  seq: number;
}

interface MetaDoc {
  _id: string;
  month?: number;
  year?: number;
  manualAdjustment: number;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private incomeCollection: Collection<any> | null = null;
  private outcomeCollection: Collection<any> | null = null;
  private countersCollection: Collection<CounterDoc> | null = null;
  private metaCollection: Collection<MetaDoc> | null = null;

  constructor() {
    const uri = "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority&appName=data";
    this.client = new MongoClient(uri);
  }

  private async connect(): Promise<void> {
    if (this.db) return;
    await this.client.connect();
    this.db = this.client.db();
    this.incomeCollection = this.db.collection("income");
    this.outcomeCollection = this.db.collection("outcome");
    this.countersCollection = this.db.collection("counters");
    this.metaCollection = this.db.collection("meta");
    
    // Initialize counters if they don't exist
    await this.countersCollection.updateOne(
      { _id: "incomeId" },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );
    await this.countersCollection.updateOne(
      { _id: "outcomeId" },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );
  }

  private async getNextId(name: string): Promise<number> {
    await this.connect();
    const result = await this.countersCollection!.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { returnDocument: "after" }
    );
    return result!.seq;
  }

  async getIncome(month?: number, year?: number): Promise<Income[]> {
    await this.connect();
    let query: any = {};
    if (month !== undefined && year !== undefined) {
      // Use UTC dates to avoid timezone issues when filtering by month
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 1));
      query.date = { $gte: start, $lt: end };
    }
    const docs = await this.incomeCollection!.find(query).sort({ date: -1 }).toArray();
    return docs.map(doc => ({
      id: doc.id,
      amount: doc.amount,
      category: doc.category,
      description: doc.description ?? null,
      date: new Date(doc.date)
    }));
  }

  async createIncome(insert: InsertIncome): Promise<Income> {
    await this.connect();
    const id = await this.getNextId("incomeId");
    const record: Income = {
      id,
      amount: insert.amount,
      category: insert.category,
      description: insert.description ?? null,
      date: insert.date ? new Date(insert.date) : new Date()
    };
    await this.incomeCollection!.insertOne({ ...record });
    return record;
  }

  async deleteIncome(id: number): Promise<void> {
    await this.connect();
    await this.incomeCollection!.deleteOne({ id });
  }

  async updateIncome(id: number, data: Partial<InsertIncome>): Promise<Income> {
    await this.connect();
    const update: any = { ...data };
    if (update.date) update.date = new Date(update.date);
    
    const result = await this.incomeCollection!.findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: "after" }
    );
    
    if (!result) throw new Error("Income not found");
    
    return {
      id: result.id,
      amount: result.amount,
      category: result.category,
      description: result.description ?? null,
      date: new Date(result.date)
    };
  }

  async getOutcome(month?: number, year?: number): Promise<Outcome[]> {
    await this.connect();
    let query: any = {};
    if (month !== undefined && year !== undefined) {
      // Use UTC dates to avoid timezone issues when filtering by month
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 1));
      query.date = { $gte: start, $lt: end };
    }
    const docs = await this.outcomeCollection!.find(query).sort({ date: -1 }).toArray();
    return docs.map(doc => ({
      id: doc.id,
      amount: doc.amount,
      category: doc.category,
      description: doc.description ?? null,
      date: new Date(doc.date)
    }));
  }

  async createOutcome(insert: InsertOutcome): Promise<Outcome> {
    await this.connect();
    const id = await this.getNextId("outcomeId");
    const record: Outcome = {
      id,
      amount: insert.amount,
      category: insert.category,
      description: insert.description ?? null,
      date: insert.date ? new Date(insert.date) : new Date()
    };
    await this.outcomeCollection!.insertOne({ ...record });
    return record;
  }

  async deleteOutcome(id: number): Promise<void> {
    await this.connect();
    await this.outcomeCollection!.deleteOne({ id });
  }

  async updateOutcome(id: number, data: Partial<InsertOutcome>): Promise<Outcome> {
    await this.connect();
    const update: any = { ...data };
    if (update.date) update.date = new Date(update.date);
    
    const result = await this.outcomeCollection!.findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: "after" }
    );
    
    if (!result) throw new Error("Outcome not found");
    
    return {
      id: result.id,
      amount: result.amount,
      category: result.category,
      description: result.description ?? null,
      date: new Date(result.date)
    };
  }

  async adjustBalance(amount: number, month?: number, year?: number): Promise<void> {
    await this.connect();
    if (month !== undefined && year !== undefined) {
      await this.metaCollection!.updateOne(
        { _id: `adjustment_${year}_${month}` },
        { $set: { manualAdjustment: amount, month, year } },
        { upsert: true }
      );
    } else {
      await this.metaCollection!.updateOne(
        { _id: "settings" },
        { $set: { manualAdjustment: amount } }
      );
    }
  }

  async resetData(): Promise<void> {
    await this.connect();
    // Instead of deleting transactions, we just refresh the collections to ensure consistency
    // No data deletion is performed here anymore as the user wants to "Recalculate"
    return;
  }

  async getFinancialSummary(month?: number, year?: number): Promise<FinancialSummary> {
    await this.connect();
    
    let match: any = {};
    let cumulativeMatch: any = {};
    if (month !== undefined && year !== undefined) {
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 1));
      match.date = { $gte: start, $lt: end };
      cumulativeMatch.date = { $lt: end };
    }

    const incomeResult = await this.incomeCollection!.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    
    const outcomeResult = await this.outcomeCollection!.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();

    const cumulativeIncomeResult = await this.incomeCollection!.aggregate([
      { $match: cumulativeMatch },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    
    const cumulativeOutcomeResult = await this.outcomeCollection!.aggregate([
      { $match: cumulativeMatch },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();

    let manualAdjustment = 0;
    if (month !== undefined && year !== undefined) {
      const adj = await this.metaCollection!.findOne({ _id: `adjustment_${year}_${month}` });
      if (adj) {
        const currentBalance = (cumulativeIncomeResult[0]?.total ?? 0) - (cumulativeOutcomeResult[0]?.total ?? 0);
        manualAdjustment = adj.manualAdjustment - currentBalance;
      } else {
        // Find the most recent adjustment STRICTLY BEFORE this month/year
        const prevAdjs = await this.metaCollection!.find({ 
          _id: { $regex: /^adjustment_/ },
          $or: [
            { year: { $lt: year } },
            { year: year, month: { $lt: month } }
          ]
        }).sort({ year: -1, month: -1 }).limit(1).toArray();
        
        if (prevAdjs.length > 0) {
          const lastAdj = prevAdjs[0];
          // If we found an adjustment, it sets the balance at the end of that month.
          // We need to calculate how much to adjust the "raw" cumulative balance to match this.
          const adjEnd = new Date(Date.UTC(lastAdj.year!, lastAdj.month! + 1, 1));
          
          const incomeAtAdj = await this.incomeCollection!.aggregate([
            { $match: { date: { $lt: adjEnd } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
          ]).toArray();
          const outcomeAtAdj = await this.outcomeCollection!.aggregate([
            { $match: { date: { $lt: adjEnd } } },
            { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
          ]).toArray();
          
          const rawBalanceAtAdj = (incomeAtAdj[0]?.total ?? 0) - (outcomeAtAdj[0]?.total ?? 0);
          manualAdjustment = lastAdj.manualAdjustment - rawBalanceAtAdj;
        } else {
          const meta = await this.metaCollection!.findOne({ _id: "settings" });
          manualAdjustment = meta?.manualAdjustment ?? 0;
        }
      }
    } else {
      const meta = await this.metaCollection!.findOne({ _id: "settings" });
      manualAdjustment = meta?.manualAdjustment ?? 0;
    }

    const totalIncome = incomeResult[0]?.total ?? 0;
    const totalExpenses = outcomeResult[0]?.total ?? 0;
    
    // Final balance is cumulative income - cumulative outcome + the calculated manual adjustment
    const netBalance = Math.round((cumulativeIncomeResult[0]?.total ?? 0) - (cumulativeOutcomeResult[0]?.total ?? 0) + manualAdjustment);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      manualAdjustment
    };
  }

  async getCategoryBreakdown(month?: number, year?: number): Promise<CategoryBreakdown[]> {
    await this.connect();
    
    let match: any = {};
    if (month !== undefined && year !== undefined) {
      // Use UTC dates to avoid timezone issues when filtering by month
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 1));
      match.date = { $gte: start, $lt: end };
    }

    const totalResult = await this.outcomeCollection!.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    const totalExpenses = totalResult[0]?.total ?? 0;

    const categoryResult = await this.outcomeCollection!.aggregate([
      { $match: match },
      { $group: { _id: "$category", amount: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();

    return categoryResult.map(doc => ({
      category: doc._id,
      amount: doc.amount,
      percentage: totalExpenses > 0 ? (doc.amount / totalExpenses) * 100 : 0
    }));
  }
}

export const storage = new MongoStorage();

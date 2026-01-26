import {
  type Income, type InsertIncome,
  type Outcome, type InsertOutcome,
  type FinancialSummary, type CategoryBreakdown
} from "@shared/schema";
import { MongoClient, Db, Collection, ObjectId } from "mongodb";

export interface IStorage {
  getIncome(): Promise<Income[]>;
  createIncome(data: InsertIncome): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  updateIncome(id: number, data: Partial<InsertIncome>): Promise<Income>;
  
  getOutcome(): Promise<Outcome[]>;
  createOutcome(data: InsertOutcome): Promise<Outcome>;
  deleteOutcome(id: number): Promise<void>;
  updateOutcome(id: number, data: Partial<InsertOutcome>): Promise<Outcome>;

  getFinancialSummary(): Promise<FinancialSummary>;
  getCategoryBreakdown(): Promise<CategoryBreakdown[]>;
}

interface CounterDoc {
  _id: string;
  seq: number;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private incomeCollection: Collection<any> | null = null;
  private outcomeCollection: Collection<any> | null = null;
  private countersCollection: Collection<CounterDoc> | null = null;

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

  async getIncome(): Promise<Income[]> {
    await this.connect();
    const docs = await this.incomeCollection!.find({}).sort({ date: -1 }).toArray();
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

  async getOutcome(): Promise<Outcome[]> {
    await this.connect();
    const docs = await this.outcomeCollection!.find({}).sort({ date: -1 }).toArray();
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

  async getFinancialSummary(): Promise<FinancialSummary> {
    await this.connect();
    
    const incomeResult = await this.incomeCollection!.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    
    const outcomeResult = await this.outcomeCollection!.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();

    const totalIncome = incomeResult[0]?.total ?? 0;
    const totalExpenses = outcomeResult[0]?.total ?? 0;
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
    await this.connect();
    
    const totalResult = await this.outcomeCollection!.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    const totalExpenses = totalResult[0]?.total ?? 0;

    const categoryResult = await this.outcomeCollection!.aggregate([
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

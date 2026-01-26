import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction(input);
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        throw err;
      }
    }
  });

  app.delete(api.transactions.delete.path, async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.status(204).end();
  });

  // Analytics
  app.get(api.analytics.summary.path, async (req, res) => {
    const summary = await storage.getFinancialSummary();
    res.json(summary);
  });

  app.get(api.analytics.categoryBreakdown.path, async (req, res) => {
    const breakdown = await storage.getCategoryBreakdown();
    res.json(breakdown);
  });

  // Seed data if empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const transactions = await storage.getTransactions();
  if (transactions.length === 0) {
    const now = new Date();
    
    // Income
    await storage.createTransaction({
      type: 'income',
      amount: '5000.00',
      category: 'Salary',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      description: 'Monthly Salary'
    });
    
    // Expenses
    await storage.createTransaction({
      type: 'expense',
      amount: '1200.00',
      category: 'Rent',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      description: 'Apartment Rent'
    });
    
    await storage.createTransaction({
      type: 'expense',
      amount: '450.00',
      category: 'Groceries',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      description: 'Weekly groceries'
    });

    await storage.createTransaction({
      type: 'expense',
      amount: '150.00',
      category: 'Utilities',
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      description: 'Electricity Bill'
    });
  }
}

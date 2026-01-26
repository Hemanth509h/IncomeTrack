import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Income
  app.get(api.income.list.path, async (req, res) => {
    const items = await storage.getIncome();
    res.json(items);
  });

  app.post(api.income.create.path, async (req, res) => {
    try {
      const input = api.income.create.input.parse(req.body);
      const item = await storage.createIncome(input);
      res.status(201).json(item);
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

  app.delete(api.income.delete.path, async (req, res) => {
    await storage.deleteIncome(Number(req.params.id));
    res.status(204).end();
  });

  app.patch(api.income.update.path, async (req, res) => {
    try {
      const input = api.income.update.input.parse(req.body);
      const item = await storage.updateIncome(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(404).json({ message: "Income not found" });
      }
    }
  });

  // Outcome
  app.get(api.outcome.list.path, async (req, res) => {
    const items = await storage.getOutcome();
    res.json(items);
  });

  app.post(api.outcome.create.path, async (req, res) => {
    try {
      const input = api.outcome.create.input.parse(req.body);
      const item = await storage.createOutcome(input);
      res.status(201).json(item);
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

  app.delete(api.outcome.delete.path, async (req, res) => {
    await storage.deleteOutcome(Number(req.params.id));
    res.status(204).end();
  });

  app.patch(api.outcome.update.path, async (req, res) => {
    try {
      const input = api.outcome.update.input.parse(req.body);
      const item = await storage.updateOutcome(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(404).json({ message: "Outcome not found" });
      }
    }
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
  const incomeItems = await storage.getIncome();
  const outcomeItems = await storage.getOutcome();
  
  if (incomeItems.length === 0 && outcomeItems.length === 0) {
    const now = new Date();
    
    // Income
    await storage.createIncome({
      amount: '5000.00',
      category: 'Salary',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      description: 'Monthly Salary'
    });
    
    // Outcome
    await storage.createOutcome({
      amount: '1200.00',
      category: 'Rent',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      description: 'Apartment Rent'
    });
    
    await storage.createOutcome({
      amount: '450.00',
      category: 'Groceries',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      description: 'Weekly groceries'
    });
  }
}

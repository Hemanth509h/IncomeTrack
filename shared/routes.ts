import { z } from 'zod';
import { insertIncomeSchema, insertOutcomeSchema, income, outcome } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  income: {
    list: {
      method: 'GET' as const,
      path: '/api/income',
      responses: {
        200: z.array(z.custom<typeof income.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/income',
      input: insertIncomeSchema,
      responses: {
        201: z.custom<typeof income.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/income/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/income/:id',
      input: insertIncomeSchema.partial(),
      responses: {
        200: z.custom<typeof income.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  outcome: {
    list: {
      method: 'GET' as const,
      path: '/api/outcome',
      responses: {
        200: z.array(z.custom<typeof outcome.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/outcome',
      input: insertOutcomeSchema,
      responses: {
        201: z.custom<typeof outcome.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/outcome/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/outcome/:id',
      input: insertOutcomeSchema.partial(),
      responses: {
        200: z.custom<typeof outcome.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    summary: {
      method: 'GET' as const,
      path: '/api/analytics/summary',
      responses: {
        200: z.object({
          totalIncome: z.number(),
          totalExpenses: z.number(),
          netBalance: z.number(),
          savingsRate: z.number(),
        }),
      },
    },
    categoryBreakdown: {
      method: 'GET' as const,
      path: '/api/analytics/breakdown',
      responses: {
        200: z.array(z.object({
          category: z.string(),
          amount: z.number(),
          percentage: z.number(),
        })),
      },
    },
    adjustBalance: {
      method: 'POST' as const,
      path: '/api/analytics/adjust-balance',
      input: z.object({ 
        amount: z.number(),
        month: z.number().optional(),
        year: z.number().optional()
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    resetData: {
      method: 'POST' as const,
      path: '/api/analytics/reset',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

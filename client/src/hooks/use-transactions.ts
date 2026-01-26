import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertIncome, type InsertOutcome } from "@shared/schema";

export function useIncome(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.income.list.path, { month, year }] 
    : [api.income.list.path];
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = month !== undefined && year !== undefined
        ? `${api.income.list.path}?month=${month}&year=${year}`
        : api.income.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch income");
      return api.income.list.responses[200].parse(await res.json());
    },
  });
}

export function useOutcome(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.outcome.list.path, { month, year }] 
    : [api.outcome.list.path];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = month !== undefined && year !== undefined
        ? `${api.outcome.list.path}?month=${month}&year=${year}`
        : api.outcome.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch outcome");
      return api.outcome.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertIncome) => {
      const res = await fetch(api.income.create.path, {
        method: api.income.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create income");
      }
      return api.income.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.income.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useCreateOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertOutcome) => {
      const res = await fetch(api.outcome.create.path, {
        method: api.outcome.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create outcome");
      }
      return api.outcome.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.outcome.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.income.delete.path, { id });
      const res = await fetch(url, { method: api.income.delete.method });
      if (!res.ok) throw new Error("Failed to delete income");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.income.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useDeleteOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.outcome.delete.path, { id });
      const res = await fetch(url, { method: api.outcome.delete.method });
      if (!res.ok) throw new Error("Failed to delete outcome");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.outcome.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertIncome> }) => {
      const url = buildUrl(api.income.update.path, { id });
      const res = await fetch(url, {
        method: api.income.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update income");
      }
      return api.income.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.income.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useUpdateOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertOutcome> }) => {
      const url = buildUrl(api.outcome.update.path, { id });
      const res = await fetch(url, {
        method: api.outcome.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update outcome");
      }
      return api.outcome.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.outcome.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

export function useSummary(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.analytics.summary.path, { month, year }] 
    : [api.analytics.summary.path];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = month !== undefined && year !== undefined
        ? `${api.analytics.summary.path}?month=${month}&year=${year}`
        : api.analytics.summary.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return api.analytics.summary.responses[200].parse(await res.json());
    },
  });
}

export function useCategoryBreakdown(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.analytics.categoryBreakdown.path, { month, year }] 
    : [api.analytics.categoryBreakdown.path];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = month !== undefined && year !== undefined
        ? `${api.analytics.categoryBreakdown.path}?month=${month}&year=${year}`
        : api.analytics.categoryBreakdown.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch breakdown");
      return api.analytics.categoryBreakdown.responses[200].parse(await res.json());
    },
  });
}

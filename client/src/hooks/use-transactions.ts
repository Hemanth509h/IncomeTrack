import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertIncome, type InsertOutcome, type Income, type Outcome } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useIncome(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.income.list.path, { month, year }] 
    : [api.income.list.path];
    
  return useQuery<Income[]>({
    queryKey,
  });
}

export function useOutcome(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.outcome.list.path, { month, year }] 
    : [api.outcome.list.path];

  return useQuery<Outcome[]>({
    queryKey,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertIncome) => {
      const res = await apiRequest(api.income.create.method, api.income.create.path, data);
      return await res.json();
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
      const res = await apiRequest(api.outcome.create.method, api.outcome.create.path, data);
      return await res.json();
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
      const url = api.income.delete.path.replace(':id', id.toString());
      await apiRequest(api.income.delete.method, url);
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
      const url = api.outcome.delete.path.replace(':id', id.toString());
      await apiRequest(api.outcome.delete.method, url);
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
      const url = api.income.update.path.replace(':id', id.toString());
      const res = await apiRequest(api.income.update.method, url, data);
      return await res.json();
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
      const url = api.outcome.update.path.replace(':id', id.toString());
      const res = await apiRequest(api.outcome.update.method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.outcome.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.categoryBreakdown.path] });
    },
  });
}

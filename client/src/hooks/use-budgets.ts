import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBudget } from "@shared/schema";

export function useBudgets() {
  return useQuery({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      const res = await fetch(api.budgets.list.path);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return api.budgets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBudget) => {
      const res = await fetch(api.budgets.create.path, {
        method: api.budgets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create budget");
      }
      return api.budgets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.budgets.delete.path, { id });
      const res = await fetch(url, { method: api.budgets.delete.method });
      if (!res.ok) throw new Error("Failed to delete budget");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
    },
  });
}

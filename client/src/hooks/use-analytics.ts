import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type FinancialSummary, type CategoryBreakdown } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useFinancialSummary(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.analytics.summary.path, { month, year }] 
    : [api.analytics.summary.path];

  return useQuery<FinancialSummary>({
    queryKey,
  });
}

export function useCategoryBreakdown(month?: number, year?: number) {
  const queryKey = month !== undefined && year !== undefined 
    ? [api.analytics.categoryBreakdown.path, { month, year }] 
    : [api.analytics.categoryBreakdown.path];

  return useQuery<CategoryBreakdown[]>({
    queryKey,
  });
}

export function useAdjustBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, month, year }: { amount: number, month?: number, year?: number }) => {
      const res = await apiRequest(api.analytics.adjustBalance.method, api.analytics.adjustBalance.path, { amount, month, year });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analytics.summary.path] });
    },
  });
}

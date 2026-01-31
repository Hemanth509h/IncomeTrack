import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type FinancialSummary, type CategoryBreakdown } from "@shared/schema";

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

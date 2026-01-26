import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useFinancialSummary(month?: number, year?: number) {
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
      if (!res.ok) throw new Error("Failed to fetch category breakdown");
      return api.analytics.categoryBreakdown.responses[200].parse(await res.json());
    },
  });
}

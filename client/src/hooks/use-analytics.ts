import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useFinancialSummary() {
  return useQuery({
    queryKey: [api.analytics.summary.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.summary.path);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return api.analytics.summary.responses[200].parse(await res.json());
    },
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: [api.analytics.categoryBreakdown.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.categoryBreakdown.path);
      if (!res.ok) throw new Error("Failed to fetch category breakdown");
      return api.analytics.categoryBreakdown.responses[200].parse(await res.json());
    },
  });
}

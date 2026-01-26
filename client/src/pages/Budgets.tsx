import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useCategoryBreakdown } from "@/hooks/use-analytics";
import { Sidebar } from "@/components/Sidebar";
import { BudgetForm } from "@/components/BudgetForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Budgets() {
  const { data: budgets, isLoading: isBudgetsLoading } = useBudgets();
  const { data: breakdown } = useCategoryBreakdown();
  const deleteMutation = useDeleteBudget();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getSpentAmount = (category: string) => {
    if (!breakdown) return 0;
    const item = breakdown.find(b => b.category === category);
    return item ? item.amount : 0;
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Budget deleted successfully" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Budgets</h1>
              <p className="text-muted-foreground mt-1">Set limits and track your spending goals.</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 px-6 h-12">
                  <Plus className="w-5 h-5 mr-2" /> Set New Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Set Budget Limit</DialogTitle>
                </DialogHeader>
                <BudgetForm onSuccess={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isBudgetsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : budgets && budgets.length > 0 ? (
              budgets.map((budget) => {
                const spent = getSpentAmount(budget.category);
                const limit = Number(budget.limit);
                const percentage = Math.min((spent / limit) * 100, 100);
                const isOverBudget = spent > limit;

                return (
                  <div key={budget.id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(budget.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2 capitalize">
                        {budget.period}
                      </span>
                      <h3 className="text-xl font-bold font-display">{budget.category}</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : "text-foreground"}`}>
                          ${spent.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          of ${limit.toFixed(0)} limit
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Progress value={percentage} className="h-3 bg-muted" indicatorClassName={isOverBudget ? "bg-destructive" : "bg-primary"} />
                      </div>

                      {isOverBudget && (
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>Over budget by ${(spent - limit).toFixed(0)}</span>
                        </div>
                      )}
                      
                      {!isOverBudget && (
                        <p className="text-sm text-muted-foreground">
                          You have <span className="text-green-600 font-semibold">${(limit - spent).toFixed(0)}</span> remaining
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center bg-card border border-border/50 rounded-2xl border-dashed">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Budgets Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                  Create a budget to track spending in specific categories and save more money.
                </p>
                <Button onClick={() => setIsOpen(true)} variant="outline">Create Your First Budget</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

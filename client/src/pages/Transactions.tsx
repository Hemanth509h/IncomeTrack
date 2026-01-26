import { useIncome, useOutcome, useDeleteIncome, useDeleteOutcome } from "@/hooks/use-transactions";
import { Sidebar } from "@/components/Sidebar";
import { format } from "date-fns";
import { Loader2, Trash2, Search, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";

export default function Transactions() {
  const { data: income, isLoading: isIncomeLoading } = useIncome();
  const { data: outcome, isLoading: isOutcomeLoading } = useOutcome();
  const deleteIncome = useDeleteIncome();
  const deleteOutcome = useDeleteOutcome();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTx, setEditingTx] = useState<{ tx: any, type: "income" | "outcome" } | null>(null);

  const handleDelete = (id: number, type: string) => {
    if (type === 'income') {
      deleteIncome.mutate(id);
    } else {
      deleteOutcome.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Transactions</h1>
              <p className="text-muted-foreground mt-1">View and manage your financial history.</p>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-9 bg-background border-border/60 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Income Table */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-green-600 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Income
                </h3>
                <div className="rounded-xl border border-border/40 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="bg-green-50 text-green-700 font-medium uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                      {isIncomeLoading ? (
                        Array(3).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto" /></td>
                          </tr>
                        ))
                      ) : income && income.length > 0 ? (
                        income.filter(tx => (tx.description || tx.category).toLowerCase().includes(searchTerm.toLowerCase())).map((tx) => (
                          <tr key={tx.id} className="hover:bg-green-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                              {format(new Date(tx.date), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-6 py-4 font-medium text-foreground">
                              {tx.description || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">
                              +₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                  onClick={() => setEditingTx({ tx, type: "income" })}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Income?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(tx.id, 'income')}
                                        className="bg-destructive hover:bg-destructive/90 text-white"
                                      >
                                        {deleteIncome.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No income records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outcome Table */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-red-600 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Outcome
                </h3>
                <div className="rounded-xl border border-border/40 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="bg-red-50 text-red-700 font-medium uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                      {isOutcomeLoading ? (
                        Array(3).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto" /></td>
                          </tr>
                        ))
                      ) : outcome && outcome.length > 0 ? (
                        outcome.filter(tx => (tx.description || tx.category).toLowerCase().includes(searchTerm.toLowerCase())).map((tx) => (
                          <tr key={tx.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                              {format(new Date(tx.date), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-6 py-4 font-medium text-foreground">
                              {tx.description || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-red-600">
                              -₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                  onClick={() => setEditingTx({ tx, type: "outcome" })}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Outcome?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(tx.id, 'outcome')}
                                        className="bg-destructive hover:bg-destructive/90 text-white"
                                      >
                                        {deleteOutcome.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No outcome records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {editingTx && (
        <EditTransactionDialog
          transaction={editingTx.tx}
          type={editingTx.type}
          open={!!editingTx}
          onOpenChange={(open) => !open && setEditingTx(null)}
        />
      )}
    </div>
  );
}

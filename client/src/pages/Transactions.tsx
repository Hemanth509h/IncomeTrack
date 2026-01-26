import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { Sidebar } from "@/components/Sidebar";
import { format } from "date-fns";
import { Loader2, Trash2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = (tx.description || tx.category).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
              <div className="w-full sm:w-[180px]">
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-card">
                  {isLoading ? (
                     Array(5).fill(0).map((_, i) => (
                       <tr key={i}>
                         <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                         <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                         <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                         <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                         <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto" /></td>
                       </tr>
                     ))
                  ) : filteredTransactions && filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
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
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                          {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove the transaction from your records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMutation.mutate(tx.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

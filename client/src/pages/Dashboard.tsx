import { useFinancialSummary, useCategoryBreakdown, useAdjustBalance } from "@/hooks/use-analytics";
import { useIncome, useOutcome } from "@/hooks/use-transactions";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { useMonth } from "@/hooks/use-month";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const { currentDate, nextMonth, prevMonth, formattedMonth } = useMonth();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const { toast } = useToast();

  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(month, year);
  const { data: breakdown, isLoading: isBreakdownLoading } = useCategoryBreakdown(month, year);
  const { data: income, isLoading: isIncomeLoading } = useIncome(month, year);
  const { data: outcome, isLoading: isOutcomeLoading } = useOutcome(month, year);
  const adjustBalance = useAdjustBalance();
  
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");

  useEffect(() => {
    if (summary) {
      setAdjustAmount(summary.netBalance.toString());
    }
  }, [summary]);

  const handleAdjustBalance = () => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) return;

    adjustBalance.mutate({ amount, month, year }, {
      onSuccess: () => {
        setIsAdjustOpen(false);
        toast({
          title: "Balance Set",
          description: `Current balance for ${formattedMonth} has been set to ₹${amount.toLocaleString('en-IN')}.`,
        });
      },
    });
  };

  const latestTransactions = useMemo(() => {
    const combined = [
      ...(income || []).map(item => ({ ...item, type: 'income' })),
      ...(outcome || []).map(item => ({ ...item, type: 'outcome' }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [income, outcome]);

  const isTransactionsLoading = isIncomeLoading || isOutcomeLoading;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-3xl font-bold font-display text-foreground">Overview</h1>
                <div className="flex items-center gap-2 bg-card border border-border/50 px-3 py-1.5 rounded-xl shadow-sm ml-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-[100px] text-center">{formattedMonth}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">Welcome back, here's your financial summary.</p>
            </div>
            
            <Dialog open={isTxOpen} onOpenChange={setIsTxOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 px-6 h-12">
                  <Plus className="w-5 h-5 mr-2" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={() => setIsTxOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isSummaryLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
            ) : (
              <>
                <div className="relative group">
                  <StatCard 
                    title="Total Balance" 
                    value={`₹${summary?.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`} 
                    icon={Wallet} 
                    color="primary" 
                  />
                  <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[325px]">
                      <DialogHeader>
                        <DialogTitle>Adjust Balance</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Enter a starting balance or manual adjustment. This will be added to your calculated total.
                        </p>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Adjustment / Starting Balance (₹)</label>
                          <Input 
                            type="number" 
                            step="1" 
                            value={adjustAmount} 
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdjustBalance} disabled={adjustBalance.isPending}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <StatCard 
                  title="Total Income" 
                  value={`₹${summary?.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`} 
                  icon={TrendingUp} 
                  color="success" 
                />
                <StatCard 
                  title="Total Expenses" 
                  value={`₹${summary?.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`} 
                  icon={TrendingDown} 
                  color="destructive" 
                />
                <StatCard 
                  title="Savings Rate" 
                  value={`${summary?.savingsRate.toFixed(0) || '0'}%`} 
                  icon={PiggyBank} 
                  color="warning" 
                />
              </>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display mb-6">Expense Breakdown</h3>
              <div className="h-[300px] w-full">
                {isBreakdownLoading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : breakdown && breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="category" type="category" width={100} tick={{fontSize: 12}} />
                      <RechartsTooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24}>
                        {breakdown.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold font-display mb-6">Recent Transactions</h3>
              <div className="space-y-4 flex-1 overflow-y-auto">
                {isTransactionsLoading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                ) : latestTransactions.length > 0 ? (
                  latestTransactions.map((tx) => (
                    <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description || tx.category}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No transactions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

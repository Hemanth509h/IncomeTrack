import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, PieChart, Wallet, Menu, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useResetData } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
];

export function Sidebar() {
  const [location] = useLocation();
  const resetData = useResetData();
  const { toast } = useToast();

  const handleReset = () => {
    resetData.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Recalculation Complete",
          description: "All transactions and balances have been refreshed.",
        });
      },
    });
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/40">
        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          IncomeTrack
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Smart Money Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground/70"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/40 space-y-2">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h4 className="font-semibold text-sm">Pro Tip</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Review your monthly expenses to identify saving opportunities.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border/40 bg-card fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
         <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FinTrack
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

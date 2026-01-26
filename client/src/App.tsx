import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import NotFound from "@/pages/not-found";
import { MonthProvider } from "@/hooks/use-month";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MonthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MonthProvider>
    </QueryClientProvider>
  );
}

export default App;

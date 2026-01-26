import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncomeSchema, insertOutcomeSchema } from "@shared/schema";
import { z } from "zod";
import { useCreateIncome, useCreateOutcome } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";

const incomeFormSchema = insertIncomeSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

const outcomeFormSchema = insertOutcomeSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

const DEFAULT_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Salary",
  "Freelance",
  "Other"
];

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const incomeMutation = useCreateIncome();
  const outcomeMutation = useCreateOutcome();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState<"income" | "outcome">("outcome");

  const form = useForm({
    resolver: zodResolver(type === "income" ? incomeFormSchema : outcomeFormSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: undefined as any,
    },
  });

  const onSubmit = (data: any) => {
    const mutation = type === "income" ? incomeMutation : outcomeMutation;
    mutation.mutate({
      ...data,
      amount: data.amount.toString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Transaction Added",
          description: "Your transaction has been recorded successfully.",
        });
        form.reset();
        setShowCustomCategory(false);
        setCustomCategory("");
        onSuccess();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      form.setValue("category", customCategory.trim());
      setShowCustomCategory(false);
      setCustomCategory("");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Type</FormLabel>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="outcome">Outcome</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center">
                Category
                {!showCustomCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowCustomCategory(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Category
                  </Button>
                )}
              </FormLabel>
              
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleAddCustomCategory}
                    disabled={!customCategory.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowCustomCategory(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    {field.value && !DEFAULT_CATEGORIES.includes(field.value) && (
                      <SelectItem value={field.value}>{field.value}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Weekly Groceries" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl shadow-lg shadow-primary/20"
          disabled={incomeMutation.isPending || outcomeMutation.isPending}
        >
          {incomeMutation.isPending || outcomeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Transaction"
          )}
        </Button>
      </form>
    </Form>
  );
}

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
import { Loader2, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const incomeFormSchema = insertIncomeSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.date({
    required_error: "A date is required",
  }),
});

const outcomeFormSchema = insertOutcomeSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.date({
    required_error: "A date is required",
  }),
});

const DEFAULT_CATEGORIES = [
  "Canteen",
  "Buss pass",
  "Auto",
  "Canteen Auto",
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
      date: new Date(),
    },
  });

  const onSubmit = (data: any) => {
    const mutation = type === "income" ? incomeMutation : outcomeMutation;
    // Normalize date to UTC midnight to avoid timezone shifts
    const utcDate = new Date(Date.UTC(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate()
    ));
    
    mutation.mutate({
      ...data,
      amount: data.amount.toString(),
      date: utcDate.toISOString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Transaction Added",
          description: "Your transaction has been recorded successfully.",
        });
        form.reset({
          category: "",
          description: "",
          amount: undefined as any,
          date: new Date(),
        });
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
        <div className="grid grid-cols-2 gap-4">
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
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
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

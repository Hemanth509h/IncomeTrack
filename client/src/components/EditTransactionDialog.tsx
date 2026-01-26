import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncomeSchema, insertOutcomeSchema } from "@shared/schema";
import { z } from "zod";
import { useUpdateIncome, useUpdateOutcome } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface EditTransactionDialogProps {
  transaction: any;
  type: "income" | "outcome";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ transaction, type, open, onOpenChange }: EditTransactionDialogProps) {
  const { toast } = useToast();
  const updateIncomeMutation = useUpdateIncome();
  const updateOutcomeMutation = useUpdateOutcome();
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const form = useForm({
    resolver: zodResolver(type === "income" ? incomeFormSchema : outcomeFormSchema),
    defaultValues: {
      category: transaction?.category || "",
      description: transaction?.description || "",
      amount: transaction?.amount || "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        category: transaction.category,
        description: transaction.description || "",
        amount: transaction.amount,
        date: new Date(transaction.date),
      });
    }
  }, [transaction, form]);

  const onSubmit = (data: any) => {
    const mutation = type === "income" ? updateIncomeMutation : updateOutcomeMutation;
    mutation.mutate({
      id: transaction.id,
      data: {
        ...data,
        amount: data.amount.toString(),
        date: data.date.toISOString(),
      },
    }, {
      onSuccess: () => {
        toast({
          title: "Transaction Updated",
          description: "Your transaction has been updated successfully.",
        });
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {type === "income" ? "Income" : "Outcome"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              className="w-full"
              disabled={updateIncomeMutation.isPending || updateOutcomeMutation.isPending}
            >
              {updateIncomeMutation.isPending || updateOutcomeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Transaction"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
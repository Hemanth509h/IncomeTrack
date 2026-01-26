import { createContext, useContext, useState, ReactNode } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";

interface MonthContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  formattedMonth: string;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));

  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const formattedMonth = format(currentDate, "MMMM yyyy");

  return (
    <MonthContext.Provider value={{ currentDate, setCurrentDate, nextMonth, prevMonth, formattedMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error("useMonth must be used within a MonthProvider");
  }
  return context;
}

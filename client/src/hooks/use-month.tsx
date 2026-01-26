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
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });

  const nextMonth = () => setCurrentDate(prev => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)));
  const prevMonth = () => setCurrentDate(prev => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)));
  
  const formattedMonth = format(new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1), "MMMM yyyy");

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

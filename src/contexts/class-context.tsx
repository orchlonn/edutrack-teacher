"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { getToday } from "@/lib/utils";

interface ClassContextType {
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const ClassContext = createContext<ClassContextType | null>(null);

export function ClassProvider({ children }: { children: ReactNode }) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getToday());

  return (
    <ClassContext.Provider
      value={{ selectedClassId, setSelectedClassId, selectedDate, setSelectedDate }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClassContext() {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClassContext must be used within ClassProvider");
  return ctx;
}

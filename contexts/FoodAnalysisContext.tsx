import { FoodAnalysisResult } from '@/types/food-analysis';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FoodAnalysisContextType {
  result: FoodAnalysisResult | null;
  setResult: (result: FoodAnalysisResult | null) => void;
  clearResult: () => void;
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  imageBase64: string | null;
  setImageBase64: (base64: string | null) => void;
}

const FoodAnalysisContext = createContext<FoodAnalysisContextType | undefined>(undefined);

export function FoodAnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const clearResult = () => {
    setResult(null);
    setImageUri(null);
    setImageBase64(null);
  };

  return (
    <FoodAnalysisContext.Provider value={{ result, setResult, clearResult, imageUri, setImageUri, imageBase64, setImageBase64 }}>
      {children}
    </FoodAnalysisContext.Provider>
  );
}

export function useFoodAnalysis() {
  const context = useContext(FoodAnalysisContext);
  if (context === undefined) {
    throw new Error('useFoodAnalysis must be used within a FoodAnalysisProvider');
  }
  return context;
}


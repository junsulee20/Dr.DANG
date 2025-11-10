import { FoodAnalysisResult } from '@/types/food-analysis';
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';

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

// localStorage 키
const STORAGE_KEY = 'dr_dang_analysis_result';

export function FoodAnalysisProvider({ children }: { children: ReactNode }) {
  // 초기화: localStorage에서 복원
  const [result, setResultState] = useState<FoodAnalysisResult | null>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          console.log('✅ 저장된 분석 결과 복원됨');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('분석 결과 복원 실패:', error);
      }
    }
    return null;
  });
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // setResult 래퍼: localStorage에 저장
  const setResult = (newResult: FoodAnalysisResult | null) => {
    setResultState(newResult);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      if (newResult) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newResult));
          console.log('✅ 분석 결과 저장됨 (localStorage)');
        } catch (error) {
          console.error('분석 결과 저장 실패:', error);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ 분석 결과 삭제됨 (localStorage)');
      }
    }
  };

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


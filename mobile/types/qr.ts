export type RiskCategory = 'GREEN' | 'YELLOW' | 'RED';

export interface ParsedUPIParams {
  rawText: string;
  isUpi: boolean;
  pa?: string; // Payee VPA / UPI ID
  pn?: string; // Payee Name
  am?: string; // Transaction Amount
  cu?: string; // Currency Code (default INR)
  tn?: string; // Transaction Note
  tr?: string; // Transaction Reference ID
  mc?: string; // Merchant Category Code
  url?: string; // Embedded URL
}

export interface RiskIndicator {
  code: string;
  category: RiskCategory;
  titleKey: string;
  descriptionKey: string;
  detail?: string;
}

export interface QRAnalysisResult {
  category: RiskCategory;
  score: number; // 0 (Clean) to 100 (Critical Risk)
  summaryKey: string;
  recommendationKey: string;
  indicators: RiskIndicator[];
  isHighValue: boolean;
  highValueThreshold: number;
  parsedParams: ParsedUPIParams;
  timestamp: string;
}

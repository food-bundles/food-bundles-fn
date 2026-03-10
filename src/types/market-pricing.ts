// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Market {
  id: string;
  name: string;
  location?: string | null;
  province?: string | null;
  district?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRecord {
  id: string;
  product: { id: string; name: string };
  market: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
  };
  ourPrice: number;
  marketPrice: number;
  difference: number;
  recordedDate: string;
}

export interface ProductOption {
  id: string;
  productName: string;
  unitPrice: number;
}

export interface ProductGroup {
  productId: string;
  productName: string;
  ourPrice: number;
  records: PriceRecord[];
}

export interface PriceAnalysis {
  product: { id: string; name: string; currentPrice: number };
  analysis: {
    totalRecords: number;
    avgOurPrice: number;
    avgMarketPrice: number;
    minMarketPrice: number;
    maxMarketPrice: number;
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
    percentageDifference: number;
    message?: string;
  };
  marketBreakdown?: Array<{
    market: { id: string; name: string; district?: string | null };
    recordCount: number;
    avgMarketPrice: number;
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
  }>;
}

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

export interface ProductPriceCardProps {
  group: ProductGroup;
  onAnalyze: (id: string, name: string) => void;
  isAnalyzing: boolean;
  onRecordPrice: (productId: string) => void;
  onEditRecord: (r: PriceRecord) => void;
  onDeleteRecord: (r: PriceRecord) => void;
}

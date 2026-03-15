export interface ChartAnalysis {
  signal: "CALL" | "PUT" | "NO_TRADE";
  confidence: number;
  trend: {
    direction: "Bullish" | "Bearish" | "Sideways";
    strength: "Strong" | "Moderate" | "Weak";
    description: string;
  };
  bollingerBands: {
    position: "Upper Band" | "Middle Band" | "Lower Band" | "Outside Upper" | "Outside Lower";
    squeeze: boolean;
    description: string;
  };
  macd: {
    signal: "Bullish Crossover" | "Bearish Crossover" | "Bullish Divergence" | "Bearish Divergence" | "Neutral" | "Bullish Momentum" | "Bearish Momentum";
    histogram: "Rising" | "Falling" | "Near Zero";
    description: string;
  };
  momentum: {
    status: "Overbought" | "Oversold" | "Neutral" | "Building Up" | "Weakening";
    description: string;
  };
  summary: string;
}

export type AnalysisStatus = "idle" | "uploading" | "scanning" | "complete" | "error";

export const SCAN_MESSAGES = [
  "Menyalakan mesin analisis...",
  "Mendeteksi pola candlestick...",
  "Menganalisis arah tren...",
  "Membaca Bollinger Bands...",
  "Memproses sinyal MACD...",
  "Mengevaluasi momentum...",
  "Menyusun prediksi...",
];

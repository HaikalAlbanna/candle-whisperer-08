import type { ChartAnalysis } from "@/types/trading";

const SIGNAL_LABELS: Record<ChartAnalysis["signal"], string> = {
  CALL: "BELI",
  PUT: "JUAL",
  NO_TRADE: "TUNGGU",
};

const SIGNAL_DESCRIPTIONS: Record<ChartAnalysis["signal"], string> = {
  CALL: "Harga kemungkinan naik",
  PUT: "Harga kemungkinan turun",
  NO_TRADE: "Sinyal belum cukup jelas",
};

const TREND_DIRECTIONS: Record<ChartAnalysis["trend"]["direction"], string> = {
  Bullish: "Naik",
  Bearish: "Turun",
  Sideways: "Mendatar",
};

const TREND_STRENGTH: Record<ChartAnalysis["trend"]["strength"], string> = {
  Strong: "Kuat",
  Moderate: "Sedang",
  Weak: "Lemah",
};

const BOLLINGER_POSITION: Record<ChartAnalysis["bollingerBands"]["position"], string> = {
  "Upper Band": "Pita Atas",
  "Middle Band": "Pita Tengah",
  "Lower Band": "Pita Bawah",
  "Outside Upper": "Di Atas Pita Atas",
  "Outside Lower": "Di Bawah Pita Bawah",
};

const MACD_SIGNAL: Record<ChartAnalysis["macd"]["signal"], string> = {
  "Bullish Crossover": "Persilangan Bullish",
  "Bearish Crossover": "Persilangan Bearish",
  "Bullish Divergence": "Divergensi Bullish",
  "Bearish Divergence": "Divergensi Bearish",
  Neutral: "Netral",
  "Bullish Momentum": "Momentum Bullish",
  "Bearish Momentum": "Momentum Bearish",
};

const MACD_HISTOGRAM: Record<ChartAnalysis["macd"]["histogram"], string> = {
  Rising: "Naik",
  Falling: "Turun",
  "Near Zero": "Dekat Nol",
};

const MOMENTUM_STATUS: Record<ChartAnalysis["momentum"]["status"], string> = {
  Overbought: "Jenuh Beli",
  Oversold: "Jenuh Jual",
  Neutral: "Netral",
  "Building Up": "Menguat",
  Weakening: "Melemah",
};

export const formatSignalLabel = (signal: ChartAnalysis["signal"]) => SIGNAL_LABELS[signal];

export const formatSignalDescription = (signal: ChartAnalysis["signal"]) => SIGNAL_DESCRIPTIONS[signal];

export const formatTrendDirection = (direction: ChartAnalysis["trend"]["direction"]) => TREND_DIRECTIONS[direction];

export const formatTrendStrength = (strength: ChartAnalysis["trend"]["strength"]) => TREND_STRENGTH[strength];

export const formatBollingerPosition = (position: ChartAnalysis["bollingerBands"]["position"]) =>
  BOLLINGER_POSITION[position];

export const formatMacdSignal = (signal: ChartAnalysis["macd"]["signal"]) => MACD_SIGNAL[signal];

export const formatMacdHistogram = (histogram: ChartAnalysis["macd"]["histogram"]) => MACD_HISTOGRAM[histogram];

export const formatMomentumStatus = (status: ChartAnalysis["momentum"]["status"]) => MOMENTUM_STATUS[status];

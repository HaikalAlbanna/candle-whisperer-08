import React from "react";
import type { ChartAnalysis } from "@/types/trading";
import { TrendingUp, Activity, BarChart3, Zap } from "lucide-react";
import {
  formatBollingerPosition,
  formatMacdHistogram,
  formatMacdSignal,
  formatMomentumStatus,
  formatTrendDirection,
  formatTrendStrength,
} from "@/lib/analysis-i18n";

interface AnalysisGridProps {
  analysis: ChartAnalysis;
}

const AnalysisCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  description: string;
  delay: number;
}> = ({ icon, title, value, subtitle, description, delay }) => (
  <div
    className="p-4 rounded-lg bg-secondary/50 animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{title}</span>
    </div>
    <p className="text-lg font-mono font-semibold text-foreground">{value}</p>
    {subtitle && (
      <p className="text-xs font-mono text-muted-foreground mt-0.5">{subtitle}</p>
    )}
    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>
  </div>
);

const AnalysisGrid: React.FC<AnalysisGridProps> = ({ analysis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AnalysisCard
        icon={<TrendingUp className="w-4 h-4 text-primary" />}
        title="Tren"
        value={formatTrendDirection(analysis.trend.direction)}
        subtitle={`Kekuatan: ${formatTrendStrength(analysis.trend.strength)}`}
        description={analysis.trend.description}
        delay={0}
      />
      <AnalysisCard
        icon={<Activity className="w-4 h-4 text-signal-neutral" />}
        title="Bollinger Bands"
        value={formatBollingerPosition(analysis.bollingerBands.position)}
        subtitle={analysis.bollingerBands.squeeze ? "Squeeze terdeteksi" : "Tidak ada squeeze"}
        description={analysis.bollingerBands.description}
        delay={100}
      />
      <AnalysisCard
        icon={<BarChart3 className="w-4 h-4 text-primary" />}
        title="MACD"
        value={formatMacdSignal(analysis.macd.signal)}
        subtitle={`Histogram: ${formatMacdHistogram(analysis.macd.histogram)}`}
        description={analysis.macd.description}
        delay={200}
      />
      <AnalysisCard
        icon={<Zap className="w-4 h-4 text-signal-neutral" />}
        title="Momentum"
        value={formatMomentumStatus(analysis.momentum.status)}
        description={analysis.momentum.description}
        delay={300}
      />
    </div>
  );
};

export default AnalysisGrid;

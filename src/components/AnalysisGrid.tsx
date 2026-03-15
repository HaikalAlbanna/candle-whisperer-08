import React from "react";
import type { ChartAnalysis } from "@/types/trading";
import { TrendingUp, Activity, BarChart3, Zap } from "lucide-react";

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
        title="Trend"
        value={analysis.trend.direction}
        subtitle={`Strength: ${analysis.trend.strength}`}
        description={analysis.trend.description}
        delay={0}
      />
      <AnalysisCard
        icon={<Activity className="w-4 h-4 text-signal-neutral" />}
        title="Bollinger Bands"
        value={analysis.bollingerBands.position}
        subtitle={analysis.bollingerBands.squeeze ? "Squeeze Detected" : "No Squeeze"}
        description={analysis.bollingerBands.description}
        delay={100}
      />
      <AnalysisCard
        icon={<BarChart3 className="w-4 h-4 text-primary" />}
        title="MACD"
        value={analysis.macd.signal}
        subtitle={`Histogram: ${analysis.macd.histogram}`}
        description={analysis.macd.description}
        delay={200}
      />
      <AnalysisCard
        icon={<Zap className="w-4 h-4 text-signal-neutral" />}
        title="Momentum"
        value={analysis.momentum.status}
        description={analysis.momentum.description}
        delay={300}
      />
    </div>
  );
};

export default AnalysisGrid;

import React from "react";
import type { ChartAnalysis } from "@/types/trading";
import { ArrowUpCircle, ArrowDownCircle, PauseCircle } from "lucide-react";
import { formatSignalDescription, formatSignalLabel } from "@/lib/analysis-i18n";

interface SignalBannerProps {
  analysis: ChartAnalysis;
}

const SignalBanner: React.FC<SignalBannerProps> = ({ analysis }) => {
  const isCall = analysis.signal === "CALL";
  const isPut = analysis.signal === "PUT";
  const isNoTrade = analysis.signal === "NO_TRADE";
  const signalLabel = formatSignalLabel(analysis.signal);
  const signalDescription = formatSignalDescription(analysis.signal);

  const containerClass = isCall
    ? "bg-primary/10 glow-call"
    : isPut
      ? "bg-destructive/10 glow-put"
      : "bg-secondary/40";

  const textClass = isCall
    ? "text-signal-call"
    : isPut
      ? "text-signal-put"
      : "text-signal-neutral";

  return (
    <div className={`relative flex items-center justify-between p-6 rounded-lg animate-fade-up ${containerClass}`}>
      <div className="flex items-center gap-4">
        {isCall ? (
          <ArrowUpCircle className="w-10 h-10 text-signal-call" />
        ) : isPut ? (
          <ArrowDownCircle className="w-10 h-10 text-signal-put" />
        ) : (
          <PauseCircle className="w-10 h-10 text-signal-neutral" />
        )}
        <div>
          <h2 className={`text-3xl font-mono font-bold tracking-wider ${textClass}`}>
            {signalLabel}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {signalDescription}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-4xl font-mono font-bold ${textClass}`}>
          {analysis.confidence}%
        </p>
        <p className="text-xs font-mono text-muted-foreground">KEYAKINAN</p>
      </div>
    </div>
  );
};

export default SignalBanner;

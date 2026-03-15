import React from "react";
import type { ChartAnalysis } from "@/types/trading";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface SignalBannerProps {
  analysis: ChartAnalysis;
}

const SignalBanner: React.FC<SignalBannerProps> = ({ analysis }) => {
  const isCall = analysis.signal === "CALL";

  return (
    <div
      className={`relative flex items-center justify-between p-6 rounded-lg animate-fade-up ${
        isCall ? "bg-primary/10 glow-call" : "bg-destructive/10 glow-put"
      }`}
    >
      <div className="flex items-center gap-4">
        {isCall ? (
          <ArrowUpCircle className="w-10 h-10 text-signal-call" />
        ) : (
          <ArrowDownCircle className="w-10 h-10 text-signal-put" />
        )}
        <div>
          <h2 className={`text-3xl font-mono font-bold tracking-wider ${isCall ? "text-signal-call" : "text-signal-put"}`}>
            {analysis.signal}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {isCall ? "BUY — Price likely to rise" : "SELL — Price likely to fall"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-4xl font-mono font-bold ${isCall ? "text-signal-call" : "text-signal-put"}`}>
          {analysis.confidence}%
        </p>
        <p className="text-xs font-mono text-muted-foreground">CONFIDENCE</p>
      </div>
    </div>
  );
};

export default SignalBanner;

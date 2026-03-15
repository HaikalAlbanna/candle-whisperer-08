import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import ChartUpload from "@/components/ChartUpload";
import ScanningOverlay from "@/components/ScanningOverlay";
import SignalBanner from "@/components/SignalBanner";
import AnalysisGrid from "@/components/AnalysisGrid";
import { analyzeChart } from "@/lib/api";
import type { ChartAnalysis, AnalysisStatus } from "@/types/trading";
import { ScanLine, Clock } from "lucide-react";

const Index = () => {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChartAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (base64: string) => {
    setPreviewUrl(`data:image/png;base64,${base64}`);
    setStatus("scanning");
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeChart(base64);
      setAnalysis(result);
      setAnalyzedAt(new Date().toLocaleTimeString());
      setStatus("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setStatus("error");
      toast.error(message);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setStatus("idle");
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setAnalyzedAt(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-mono font-semibold tracking-wider text-foreground">
              SIGNAL<span className="text-primary">VISION</span>
            </h1>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            1M Predictor
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Zone */}
        <section>
          <ChartUpload
            onImageUpload={handleImageUpload}
            previewUrl={previewUrl}
            isAnalyzing={status === "scanning"}
          />
        </section>
        <p className="text-center text-[10px] font-mono text-muted-foreground/60">
          Prediksi berlaku untuk candle 1 menit berikutnya setelah waktu yang terlihat pada gambar. Contoh: 11:59 berarti candle 12:00.
        </p>

        {/* Scanning State */}
        {status === "scanning" && <ScanningOverlay />}

        {/* Error State */}
        {status === "error" && error && (
          <>
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-mono text-center animate-fade-up">
              {error}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetAnalysis}
                className="px-4 py-2 rounded-md border border-border/60 bg-secondary/50 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                Upload new image
              </button>
            </div>
          </>
        )}

        {/* Results */}
        {status === "complete" && analysis && (
          <div className="space-y-4">
            <SignalBanner analysis={analysis} />
            <AnalysisGrid analysis={analysis} />

            {/* Summary */}
            <div className="p-4 rounded-lg bg-secondary/30 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Summary</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Metadata */}
            {analyzedAt && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground/60">
                <Clock className="w-3 h-3" />
                <span>Analyzed at {analyzedAt} · Timeframe: 1M</span>
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetAnalysis}
                className="px-4 py-2 rounded-md border border-border/60 bg-secondary/50 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                Analyze another image
              </button>
            </div>
          </div>
        )}

        {/* Idle hint */}
        {status === "idle" && (
          <p className="text-center text-xs font-mono text-muted-foreground/50">
            Upload atau paste screenshot chart 1 menit untuk mendapatkan prediksi
          </p>
        )}
      </main>

      {/* Disclaimer */}
      <footer className="fixed bottom-0 left-0 right-0 px-4 py-2 bg-background/80 backdrop-blur border-t border-border/30">
        <p className="text-[9px] font-mono text-muted-foreground/40 text-center max-w-2xl mx-auto">
          ⚠ For educational purposes only. Not financial advice. Past patterns do not guarantee future results.
        </p>
      </footer>
    </div>
  );
};

export default Index;

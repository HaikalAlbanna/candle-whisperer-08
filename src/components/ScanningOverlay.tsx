import React, { useEffect, useState } from "react";
import { SCAN_MESSAGES } from "@/types/trading";
import { Loader2 } from "lucide-react";

const ScanningOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-fade-up">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      <p className="text-sm font-mono text-primary animate-pulse-glow">
        {SCAN_MESSAGES[messageIndex]}
      </p>
      <div className="flex gap-1">
        {SCAN_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i <= messageIndex ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScanningOverlay;

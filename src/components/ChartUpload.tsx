import React, { useCallback, useEffect, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ChartUploadProps {
  onImageUpload: (base64: string) => void;
  previewUrl: string | null;
  isAnalyzing: boolean;
}

const ChartUpload: React.FC<ChartUploadProps> = ({ onImageUpload, previewUrl, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (base64) onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            event.preventDefault();
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (file) processFile(file);
    input.value = "";
  }, [processFile]);

  if (previewUrl) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-lg bg-secondary ${isDragging ? "ring-2 ring-primary/60" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <img
          src={previewUrl}
          alt="Trading chart"
          className="w-full h-auto max-h-[400px] object-contain"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]">
            <div className="absolute left-0 right-0 h-[2px] bg-primary animate-scan-line" />
          </div>
        )}
        {!isAnalyzing && (
          <label className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/80 backdrop-blur text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Upload className="w-3 h-3" />
            Replace
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground hover:bg-secondary/50"
      }`}
    >
      <ImageIcon className="w-8 h-8 text-muted-foreground mb-3" />
      <p className="text-sm font-mono text-muted-foreground">
        Taruh screenshot chart di sini
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
        atau klik untuk upload, atau paste dari clipboard
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
        className="hidden"
      />
    </label>
  );
};

export default ChartUpload;

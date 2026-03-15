import { supabase } from "@/integrations/supabase/client";
import type { ChartAnalysis } from "@/types/trading";

export async function analyzeChart(imageBase64: string): Promise<ChartAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-chart", {
    body: { imageBase64 },
  });

  if (error) {
    throw new Error(error.message || "Analisis gagal");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ChartAnalysis;
}

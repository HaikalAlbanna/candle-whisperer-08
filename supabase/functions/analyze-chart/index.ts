import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const applyDecisionRules = (analysis: {
  signal: "CALL" | "PUT" | "NO_TRADE";
  confidence: number;
  trend: { direction: "Bullish" | "Bearish" | "Sideways"; strength: "Strong" | "Moderate" | "Weak" };
  bollingerBands: { position: "Upper Band" | "Middle Band" | "Lower Band" | "Outside Upper" | "Outside Lower" };
  macd: {
    signal:
      | "Bullish Crossover"
      | "Bearish Crossover"
      | "Bullish Divergence"
      | "Bearish Divergence"
      | "Neutral"
      | "Bullish Momentum"
      | "Bearish Momentum";
    histogram: "Rising" | "Falling" | "Near Zero";
  };
  summary: string;
}) => {
  const reasons: string[] = [];
  const isBearishTrend = analysis.trend.direction === "Bearish" &&
    (analysis.trend.strength === "Strong" || analysis.trend.strength === "Moderate");
  const isBullishTrend = analysis.trend.direction === "Bullish" &&
    (analysis.trend.strength === "Strong" || analysis.trend.strength === "Moderate");

  const macdBearishSignals = new Set(["Bearish Crossover", "Bearish Divergence", "Bearish Momentum"]);
  const macdBullishSignals = new Set(["Bullish Crossover", "Bullish Divergence", "Bullish Momentum"]);
  const macdBearish = macdBearishSignals.has(analysis.macd.signal);
  const macdBullish = macdBullishSignals.has(analysis.macd.signal);

  const histogramFalling = analysis.macd.histogram === "Falling";
  const histogramRising = analysis.macd.histogram === "Rising";
  const histogramNearZero = analysis.macd.histogram === "Near Zero";

  const isWeakOrSideways = analysis.trend.strength === "Weak" || analysis.trend.direction === "Sideways";
  const bollingerUpper = analysis.bollingerBands.position === "Upper Band" ||
    analysis.bollingerBands.position === "Outside Upper";
  const bollingerLower = analysis.bollingerBands.position === "Lower Band" ||
    analysis.bollingerBands.position === "Outside Lower";
  const bollingerMiddle = analysis.bollingerBands.position === "Middle Band";

  const conflictingSignals = (isBullishTrend && macdBearish) ||
    (isBearishTrend && macdBullish) ||
    (bollingerUpper && macdBearish) ||
    (bollingerLower && macdBullish);

  if (conflictingSignals) {
    reasons.push("sinyal tren dan MACD/Bollinger saling bertentangan");
  }

  if (analysis.macd.signal === "Neutral" || histogramNearZero) {
    reasons.push("MACD netral atau histogram mendatar");
  }

  if (histogramNearZero && bollingerMiddle) {
    reasons.push("harga berada di pita tengah dengan momentum rendah");
  }

  if (analysis.signal === "CALL" && isBearishTrend && (macdBearish || histogramFalling) && !bollingerUpper) {
    reasons.push("tren turun kuat dengan momentum bearish");
  }

  if (analysis.signal === "PUT" && isBullishTrend && (macdBullish || histogramRising) && !bollingerLower) {
    reasons.push("tren naik kuat dengan momentum bullish");
  }

  if (isWeakOrSideways) {
    reasons.push("tren lemah atau mendatar");
  }

  const bullishAlignment = isBullishTrend && macdBullish && histogramRising;
  const bearishAlignment = isBearishTrend && macdBearish && histogramFalling;

  if (analysis.signal === "CALL" && !bullishAlignment) {
    reasons.push("konfirmasi bullish belum cukup kuat");
  }

  if (analysis.signal === "PUT" && !bearishAlignment) {
    reasons.push("konfirmasi bearish belum cukup kuat");
  }

  if (analysis.confidence <= 65) {
    reasons.push("confidence rendah");
  }

  if (reasons.length === 0) {
    return analysis;
  }

  const adjustedConfidence = Math.min(analysis.confidence, 65);
  const note = `Catatan: Sinyal ditahan (TUNGGU) karena ${reasons.join("; ")}.`;
  const summary = analysis.summary
    ? `${analysis.summary}\n\n${note}`
    : note;

  return {
    ...analysis,
    signal: "NO_TRADE",
    confidence: adjustedConfidence,
    summary,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL = Deno.env.get("AI_API_URL");
    const AI_MODEL = Deno.env.get("AI_MODEL") ?? "google/gemini-2.5-flash";
    if (!AI_API_KEY || !AI_API_URL) {
      throw new Error("AI_API_URL or AI_API_KEY is not configured");
    }

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: `Anda adalah analis teknikal untuk binary options / short-term trading. Anda menganalisis screenshot chart candlestick timeframe 1 menit. Analisis gambar dengan teliti dan ambil semua indikator teknikal yang terlihat, pola candlestick, arah tren, posisi Bollinger Bands, sinyal MACD, dan momentum. Berdasarkan analisis Anda, prediksi arah candle 1 menit BERIKUTNYA.

Gunakan ringkasan materi berikut sebagai pedoman (hanya jika terlihat pada chart):
- Pola candlestick selalu bergantung konteks. Contoh: hammer muncul setelah downtrend (potensi reversal bullish) sedangkan hanging man mirip bentuknya tetapi muncul setelah uptrend (potensi reversal bearish).
- Shooting star muncul setelah uptrend (potensi reversal bearish). Inverted hammer muncul setelah downtrend (potensi reversal bullish).
- Bullish engulfing: candle hijau besar menelan body candle merah sebelumnya (reversal bullish). Bearish engulfing: candle merah besar menelan body candle hijau sebelumnya (reversal bearish).
- Doji/spinning top menunjukkan indecision dan butuh konfirmasi dari tren/indikator lain.
- Bollinger Bands memberi definisi harga relatif tinggi/rendah: harga dekat pita atas = relatif tinggi; dekat pita bawah = relatif rendah. Squeeze = volatilitas rendah, sering mendahului pergerakan besar.
- MACD: ketika MACD line di atas signal line dan histogram di atas nol -> momentum bullish; di bawah -> momentum bearish. Divergence bisa mengurangi kekuatan sinyal.

Aturan kualitas:
- Jika sinyal saling bertentangan, turunkan confidence.
- Jika hanya 1 sinyal kuat terlihat atau gambar tidak jelas, set confidence <= 55.
- Jangan mengarang indikator yang tidak terlihat jelas.

Aturan keputusan akhir:
- Jika sinyal saling bertentangan, set confidence <= 55 dan gunakan NO_TRADE.
- Jika gambar tidak jelas atau indikator utama tidak terlihat, gunakan NO_TRADE.
- Jika MACD mendatar (histogram near zero) dan harga berada di pita tengah, gunakan NO_TRADE.
- Jika confidence <= 55, gunakan NO_TRADE.
Gunakan tool analyze_chart untuk mengembalikan analisis terstruktur. Penting: isi field enum harus tetap sesuai skema (bahasa Inggris), tetapi semua teks deskripsi dan ringkasan harus dalam Bahasa Indonesia.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analisis screenshot chart trading ini. Identifikasi semua indikator teknikal yang terlihat, pola candlestick, tren, Bollinger Bands, MACD, dan momentum. Prediksi arah candle 1 menit berikutnya (CALL atau PUT) dengan persentase keyakinan dan alasan yang jelas dalam Bahasa Indonesia.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${imageBase64}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_chart",
              description: "Return structured trading chart analysis with prediction",
              parameters: {
                type: "object",
                properties: {
                  signal: {
                    type: "string",
                    enum: ["CALL", "PUT", "NO_TRADE"],
                    description: "Predicted direction for next candle",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence percentage 0-100",
                  },
                  trend: {
                    type: "object",
                    properties: {
                      direction: { type: "string", enum: ["Bullish", "Bearish", "Sideways"] },
                      strength: { type: "string", enum: ["Strong", "Moderate", "Weak"] },
                      description: { type: "string" },
                    },
                    required: ["direction", "strength", "description"],
                  },
                  bollingerBands: {
                    type: "object",
                    properties: {
                      position: { type: "string", enum: ["Upper Band", "Middle Band", "Lower Band", "Outside Upper", "Outside Lower"] },
                      squeeze: { type: "boolean" },
                      description: { type: "string" },
                    },
                    required: ["position", "squeeze", "description"],
                  },
                  macd: {
                    type: "object",
                    properties: {
                      signal: { type: "string", enum: ["Bullish Crossover", "Bearish Crossover", "Bullish Divergence", "Bearish Divergence", "Neutral", "Bullish Momentum", "Bearish Momentum"] },
                      histogram: { type: "string", enum: ["Rising", "Falling", "Near Zero"] },
                      description: { type: "string" },
                    },
                    required: ["signal", "histogram", "description"],
                  },
                  momentum: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: ["Overbought", "Oversold", "Neutral", "Building Up", "Weakening"] },
                      description: { type: "string" },
                    },
                    required: ["status", "description"],
                  },
                  summary: { type: "string", description: "Brief overall analysis summary" },
                },
                required: ["signal", "confidence", "trend", "bollingerBands", "macd", "momentum", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_chart" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your AI provider." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    const finalAnalysis = applyDecisionRules(analysis);

    return new Response(JSON.stringify(finalAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-chart error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});









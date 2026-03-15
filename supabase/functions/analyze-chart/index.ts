import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
            content: `You are an expert technical analyst for binary options / short-term trading. You analyze candlestick chart screenshots with 1-minute timeframe. Analyze the image carefully and extract all visible technical indicators, candlestick patterns, trend direction, Bollinger Bands position, MACD signals, and momentum. Based on your analysis, predict the direction of the NEXT 1-minute candle. You MUST use the analyze_chart tool to return your structured analysis.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this trading chart screenshot. Identify all visible technical indicators, candlestick patterns, trend, Bollinger Bands, MACD, and momentum. Predict the next 1-minute candle direction (CALL or PUT) with confidence percentage and detailed reasoning.",
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
                    enum: ["CALL", "PUT"],
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

    return new Response(JSON.stringify(analysis), {
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

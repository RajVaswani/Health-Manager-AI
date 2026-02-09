import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a supportive nutritionist assistant. Analyze food images and return a JSON object with these fields:
- meal_name: string (e.g. "Grilled chicken salad")
- description: string (brief, friendly description of what you see)
- estimated_calories: number (rough estimate)
- protein_g: number
- carbs_g: number  
- fat_g: number
- fiber_g: number
- highlights: string[] (2-3 positive observations, encouraging tone)
- suggestion: string (one gentle, non-judgmental suggestion)

Be supportive and non-judgmental. Focus on what's good about the meal. If you can't identify the food clearly, make your best guess and note the uncertainty. Return ONLY valid JSON, no markdown.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this meal photo for me." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "log_meal_analysis",
              description: "Log the nutritional analysis of a meal photo",
              parameters: {
                type: "object",
                properties: {
                  meal_name: { type: "string" },
                  description: { type: "string" },
                  estimated_calories: { type: "number" },
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fat_g: { type: "number" },
                  fiber_g: { type: "number" },
                  highlights: { type: "array", items: { type: "string" } },
                  suggestion: { type: "string" },
                },
                required: ["meal_name", "description", "estimated_calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "highlights", "suggestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "log_meal_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";
      analysis = JSON.parse(content);
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

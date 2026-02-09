import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { gender, weight_kg, region } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a warm, supportive wellness nutritionist. Create a personalized daily plan based on the user's profile. Be culturally aware of their region's cuisine and food availability. Be encouraging and gentle — no strict dieting language.

Return a JSON object using the tool provided. For every meal item, include a detailed step-by-step recipe with ingredients and cooking instructions.`,
          },
          {
            role: "user",
            content: `Create a personalized wellness plan for me:
- Gender: ${gender}
- Weight: ${weight_kg} kg
- Region: ${region}

Include meals with regional foods (with full cooking recipes), movement suggestions, hydration goals, and sleep recommendations.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_wellness_plan",
              description: "Create a personalized daily wellness plan",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A warm 1-2 sentence personalized greeting and plan summary",
                  },
                  daily_calories: { type: "number" },
                  water_glasses: { type: "number" },
                  sleep_hours: { type: "number" },
                  plan_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["meal", "movement", "habit", "rest"],
                        },
                        recipe: {
                          type: "string",
                          description: "For meal items only: a detailed step-by-step recipe including ingredients list and cooking instructions. Leave empty for non-meal items.",
                        },
                      },
                      required: ["time", "title", "description", "category"],
                      additionalProperties: false,
                    },
                  },
                  weekly_goals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        target: { type: "string" },
                      },
                      required: ["label", "target"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "daily_calories", "water_glasses", "sleep_hours", "plan_items", "weekly_goals"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_wellness_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI plan generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let plan;
    if (toolCall?.function?.arguments) {
      plan = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "";
      plan = JSON.parse(content);
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

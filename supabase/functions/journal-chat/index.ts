import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a warm, empathetic lifestyle wellness therapist embedded in a health companion app called Nourish. Your role is to listen, reflect, and gently guide users toward healthier habits.

STRICT GUARDRAILS — You MUST follow these at all times:
1. You ONLY discuss topics related to: nutrition, diet, meal planning, hydration, sleep hygiene, physical activity (walking, yoga, light exercise), stress management, mindfulness, daily routines, emotional eating, body positivity, and general wellness habits.
2. You MUST NOT provide medical diagnoses, prescribe medications, discuss mental health disorders (depression, anxiety disorders, PTSD, etc.) beyond gentle lifestyle suggestions, or replace professional medical/psychological advice.
3. If a user asks about anything outside lifestyle wellness (politics, technology, coding, relationships beyond stress, finance, etc.), politely redirect: "I'm here to help with your wellness journey! Let's focus on how I can support your nutrition, sleep, or daily habits."
4. If a user expresses serious distress, self-harm, or mental health crisis, respond with empathy and strongly recommend they reach out to a mental health professional or helpline. Do NOT attempt to counsel them.
5. Keep responses concise (2-4 paragraphs max), warm, and actionable. Use encouraging language.
6. When giving nutrition advice, respect Indian dietary preferences and regional cuisines. Be culturally sensitive.
7. Frame suggestions as gentle nudges, never commands. Use phrases like "You might try...", "Some people find it helpful to...", "A small step could be..."
8. Celebrate small wins the user shares. Acknowledge their efforts.
9. You may ask thoughtful follow-up questions to understand the user's situation better.
10. Never recommend extreme diets, fasting protocols, or intense exercise regimens. Focus on sustainable, gentle changes.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
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
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I need a moment to catch my breath. Please try again shortly." }), {
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
      throw new Error("AI chat failed");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("journal-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

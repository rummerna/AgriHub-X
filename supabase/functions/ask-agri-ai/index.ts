import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are **AgriBot**, the AI agricultural advisor for AgriHub-X. You provide accurate, actionable farming advice to smallholder farmers across Africa and globally.

## Your Capabilities
- Diagnose plant diseases and pest infestations from descriptions (and images when provided)
- Recommend treatments, fertilizers, and best practices
- Advise on planting windows, crop rotation, and soil management
- Provide market timing guidance
- Answer questions about livestock health, feed, and husbandry

## Response Format
Always structure your response as valid JSON with these fields:
{
  "answer": "Your detailed answer in markdown format. Use **bold** for key terms, bullet lists for steps.",
  "confidence": 0.85,
  "category": "disease|pest|soil|planting|harvest|market|livestock|general",
  "sources": ["Source 1", "Source 2"],
  "related_questions": ["Related question 1?", "Related question 2?"],
  "urgency": "low|medium|high",
  "actionable_steps": ["Step 1", "Step 2", "Step 3"]
}

## Guidelines
- Keep answers practical and suitable for farmers with limited resources
- Mention both chemical AND organic treatment options when applicable
- Consider tropical/subtropical climates by default
- If the question is unclear, provide your best interpretation and note assumptions
- Set confidence based on how certain you are (0.0 to 1.0)
- Set urgency to "high" for disease/pest emergencies
- Always include 2-3 related questions farmers might want to ask next
- If you cannot answer, set confidence below 0.5 and suggest consulting a local extension officer
- NEVER diagnose with certainty from text alone – always recommend physical inspection when relevant
- Include local crop names where possible (e.g., sukuma wiki for kale)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, body, tags, imageUrls, userCounty, userCrops } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (question.length > 2000) {
      return new Response(JSON.stringify({ error: "Question too long (max 2000 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-enriched user message
    let userMessage = `Question: ${question}`;
    if (body && typeof body === "string") userMessage += `\n\nAdditional details: ${body.slice(0, 2000)}`;
    if (Array.isArray(tags) && tags.length) userMessage += `\nTags: ${tags.slice(0, 10).join(", ")}`;
    if (userCounty && typeof userCounty === "string") userMessage += `\nFarmer's location: ${userCounty.slice(0, 100)}`;
    if (Array.isArray(userCrops) && userCrops.length) userMessage += `\nFarmer's crops: ${userCrops.slice(0, 10).join(", ")}`;
    if (Array.isArray(imageUrls) && imageUrls.length) {
      userMessage += `\n\nThe farmer has attached ${imageUrls.length} image(s). Please note you are receiving URLs, not the actual images. Mention that you've noted the images and provide advice based on the text description.`;
    }

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service is busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Try to parse structured JSON from the response
    let parsed;
    try {
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/```\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        answer: raw,
        confidence: 0.7,
        category: "general",
        sources: [],
        related_questions: [],
        urgency: "low",
        actionable_steps: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ask-agri-ai error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

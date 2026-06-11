import { optionalEnv } from "@/lib/config";

export async function generateVehicleDescription(input: {
  make: string;
  model: string;
  year: number;
  category: string;
  city?: string;
  seats?: number;
  fuel?: string;
  transmission?: string;
}): Promise<string> {
  const apiKey = optionalEnv("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("AI content generation is not configured. Set OPENAI_API_KEY.");
  }

  const prompt = `Write a compelling 2-paragraph SEO-friendly vehicle rental description for a ${input.year} ${input.make} ${input.model} (${input.category}) available for hire${input.city ? ` in ${input.city}` : " in Australia"}. Mention key features: ${input.seats ?? 5} seats, ${input.fuel ?? "petrol"}, ${input.transmission ?? "automatic"} transmission. Tone: professional, trustworthy, Australian English. No bullet points. Max 120 words.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write concise car rental listing descriptions for an Australian marketplace." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI generation failed: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI returned empty content.");
  }
  return text;
}

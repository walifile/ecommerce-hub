import { getSupabaseServerClient } from "@/lib/supabase/server";

export type GeneratedFaq = { question: string; answer: string };
export type GeneratedProductContent = {
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  specifications: string[];
  metaTitle: string;
  metaDescription: string;
  faq: GeneratedFaq[];
};
export type GenerateResult =
  | { status: "success"; content: GeneratedProductContent }
  | { status: "error"; message: string };

const PRODUCT_CONTENT_SCHEMA = {
  type: "object",
  properties: {
    productTitle: { type: "string" },
    shortDescription: { type: "string" },
    longDescription: { type: "string" },
    specifications: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 7 },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    faq: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        properties: { question: { type: "string" }, answer: { type: "string" } },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["productTitle", "shortDescription", "longDescription", "specifications", "metaTitle", "metaDescription", "faq"],
  additionalProperties: false,
} as const;

type ResponsesPayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

function outputText(payload: ResponsesPayload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function isGeneratedContent(value: unknown): value is GeneratedProductContent {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const textFields = ["productTitle", "shortDescription", "longDescription", "metaTitle", "metaDescription"];
  if (textFields.some((key) => typeof row[key] !== "string" || !String(row[key]).trim())) return false;
  if (
    !Array.isArray(row.specifications) ||
    row.specifications.some((item) => typeof item !== "string" || !item.trim()) ||
    !Array.isArray(row.faq) ||
    row.faq.some((item) => !item || typeof item !== "object" ||
      typeof (item as Record<string, unknown>).question !== "string" ||
      typeof (item as Record<string, unknown>).answer !== "string")
  ) return false;
  return true;
}

/** Generate validated product copy with the OpenAI Responses API. */
export async function generateProductContent(productName: string, category?: string): Promise<GenerateResult> {
  const name = productName.trim().slice(0, 160);
  if (!name) return { status: "error", message: "Enter a product name first." };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { status: "error", message: "OpenAI is not configured. Add OPENAI_API_KEY to the server environment." };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  const categoryName = category?.trim().slice(0, 100);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 2500,
        instructions:
          "You are an expert e-commerce copywriter for ToyVerse, a premium toy store. " +
          "Write accurate, vivid, benefit-led copy without inventing certifications, safety claims, materials, ages, dimensions, warranties, or included accessories that were not provided. " +
          "Keep the tone playful and trustworthy. Use plain text, not markdown. Keep the meta title within 60 characters and meta description within 155 characters.",
        input: [
          `Create complete store listing content for Product: ${name}`,
          categoryName ? `Category: ${categoryName}` : null,
          "When product facts are unavailable, write benefit-oriented generic copy and phrase specifications as feature highlights.",
        ].filter(Boolean).join("\n"),
        text: { format: { type: "json_schema", name: "product_content", strict: true, schema: PRODUCT_CONTENT_SCHEMA } },
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      console.error("[ai] OpenAI request failed:", response.status, await response.text());
      return { status: "error", message: "AI generation failed. Please try again." };
    }

    const payload = (await response.json()) as ResponsesPayload;
    const text = outputText(payload);
    if (!text) return { status: "error", message: "OpenAI returned no content. Try again." };
    const parsed: unknown = JSON.parse(text);
    if (!isGeneratedContent(parsed)) return { status: "error", message: "OpenAI returned incomplete content. Try again." };

    const content: GeneratedProductContent = {
      ...parsed,
      productTitle: parsed.productTitle.slice(0, 160),
      metaTitle: parsed.metaTitle.slice(0, 60),
      metaDescription: parsed.metaDescription.slice(0, 155),
    };
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from("ai_generations").insert({
        product_name: name,
        product_title: content.productTitle,
        short_description: content.shortDescription,
        long_description: content.longDescription,
        specifications: content.specifications,
        meta_title: content.metaTitle,
        meta_description: content.metaDescription,
        faq: content.faq,
        model,
      } as never);
      if (error) console.error("[ai] ai_generations log failed:", error.message);
    }
    return { status: "success", content };
  } catch (error) {
    console.error("[ai] generateProductContent failed:", error);
    return { status: "error", message: "AI generation failed. Please try again." };
  }
}

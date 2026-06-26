import Anthropic from "@anthropic-ai/sdk";
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

// JSON Schema that constrains Claude's response. output_config.format guarantees
// the first text block is valid JSON matching this shape.
const PRODUCT_CONTENT_SCHEMA = {
  type: "object",
  properties: {
    productTitle: {
      type: "string",
      description: "Polished, SEO-friendly product title (max ~70 chars).",
    },
    shortDescription: {
      type: "string",
      description: "Punchy one-to-two sentence tagline for cards and previews.",
    },
    longDescription: {
      type: "string",
      description:
        "Engaging marketing description, 2-4 short paragraphs, plain text.",
    },
    specifications: {
      type: "array",
      description: "5-7 concise bullet-point specifications or feature highlights.",
      items: { type: "string" },
    },
    metaTitle: {
      type: "string",
      description: "SEO meta title (max ~60 chars).",
    },
    metaDescription: {
      type: "string",
      description: "SEO meta description (max ~155 chars).",
    },
    faq: {
      type: "array",
      description: "3-4 helpful buyer FAQs.",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "productTitle",
    "shortDescription",
    "longDescription",
    "specifications",
    "metaTitle",
    "metaDescription",
    "faq",
  ],
  additionalProperties: false,
} as const;

/**
 * Generates marketing + SEO copy for a product using the Claude API and logs
 * the result to ai_generations (best-effort). Requires ANTHROPIC_API_KEY in the
 * server environment; returns a friendly error otherwise.
 */
export async function generateProductContent(
  productName: string,
  category?: string
): Promise<GenerateResult> {
  const name = productName.trim();
  if (!name) {
    return { status: "error", message: "Enter a product name first." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message:
        "AI generation is not configured. Set ANTHROPIC_API_KEY in the server environment.",
    };
  }

  const client = new Anthropic({ apiKey });

  const categoryLine = category?.trim()
    ? `\nCategory: ${category.trim()}`
    : "";

  let content: GeneratedProductContent;
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      system:
        "You are an expert e-commerce copywriter for ToyVerse, a premium toy store. " +
        "Write vivid, benefit-led marketing copy and clean SEO metadata. " +
        "Keep the tone playful but trustworthy. Plain text only, no markdown.",
      messages: [
        {
          role: "user",
          content: `Write complete store listing content for this product.${categoryLine}\nProduct: ${name}`,
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: PRODUCT_CONTENT_SCHEMA },
      },
    });

    if (response.stop_reason === "refusal") {
      return {
        status: "error",
        message: "The request was declined. Try a different product name.",
      };
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { status: "error", message: "No content was generated. Try again." };
    }

    content = JSON.parse(textBlock.text) as GeneratedProductContent;
  } catch (error) {
    console.error("[ai] generateProductContent failed:", error);
    return {
      status: "error",
      message: "AI generation failed. Please try again.",
    };
  }

  // Best-effort log to ai_generations (never blocks the response).
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from("ai_generations").insert({
        product_name: name,
        product_title: content.productTitle,
        short_description: content.shortDescription,
        long_description: content.longDescription,
        meta_title: content.metaTitle,
        meta_description: content.metaDescription,
        faq: content.faq,
      } as never);
    }
  } catch (error) {
    console.error("[ai] ai_generations log failed:", error);
  }

  return { status: "success", content };
}

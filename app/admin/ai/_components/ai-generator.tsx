"use client";

import { useState, useTransition } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateProductContentAction } from "@/app/admin/actions";
import type { AiFaq, AiGeneration } from "@/lib/ecommerce-data";

type Fields = {
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
  specifications: string;
};

export function AiGenerator({ initial }: { initial?: AiGeneration }) {
  const [name, setName] = useState(initial?.productName ?? "");
  const [fields, setFields] = useState<Fields>({
    productTitle: initial?.productTitle ?? "",
    shortDescription: initial?.shortDescription ?? "",
    longDescription: initial?.longDescription ?? "",
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    specifications: "",
  });
  const [faq, setFaq] = useState<AiFaq[]>(initial?.faq ?? []);
  const [pending, startGenerating] = useTransition();

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    const productName = name.trim();
    if (!productName) {
      toast.error("Enter a product name first.");
      return;
    }
    startGenerating(async () => {
      const result = await generateProductContentAction(productName);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      const c = result.content;
      setFields({
        productTitle: c.productTitle,
        shortDescription: c.shortDescription,
        longDescription: c.longDescription,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        specifications: c.specifications.join("\n"),
      });
      setFaq(c.faq);
      toast.success("AI content generated.");
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>Generate with AI</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <Input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleGenerate} disabled={pending} className="rounded-md">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <WandSparkles className="size-4" />
                Generate with AI
              </>
            )}
          </Button>
          <Input
            placeholder="Product title"
            value={fields.productTitle}
            onChange={(e) => update("productTitle", e.target.value)}
          />
          <Textarea
            placeholder="Short description"
            className="min-h-24"
            value={fields.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
          />
          <Textarea
            placeholder="Long description"
            className="min-h-40"
            value={fields.longDescription}
            onChange={(e) => update("longDescription", e.target.value)}
          />
          <Textarea
            placeholder="Specifications, one per line"
            className="min-h-24"
            value={fields.specifications}
            onChange={(e) => update("specifications", e.target.value)}
          />
          <Input
            placeholder="Meta title"
            value={fields.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
          />
          <Textarea
            placeholder="Meta description"
            className="min-h-24"
            value={fields.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>Generated FAQ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-6">
          {faq.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Generate content to see buyer FAQs here.
            </p>
          ) : (
            faq.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-md border border-border/70 px-4 py-3 text-sm"
              >
                <p className="font-medium">{item.question}</p>
                <p className="mt-1 text-muted-foreground">{item.answer}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

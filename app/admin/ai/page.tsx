import { AdminShell } from "@/app/admin/_components/admin-shell";
import { AiGenerator } from "@/app/admin/ai/_components/ai-generator";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminAiPage() {
  const catalog = await getCatalogData();
  return (
    <AdminShell
      title="AI Product Generator"
      description="Generate product titles, descriptions, specifications, SEO metadata, and buyer FAQs with the OpenAI API. Successful output is saved to generation history."
    >
      <AiGenerator initial={catalog.aiGenerations[0]} />
    </AdminShell>
  );
}

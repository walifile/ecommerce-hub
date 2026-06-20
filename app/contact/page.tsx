import { Mail, MessageSquare, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function ContactPage() {
  const catalog = await getCatalogData();

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <SectionHeading
          eyebrow="Contact"
          title="Keep support, sales, and order issues in one inbox."
          description="The contact surface is part of the operating system, not an isolated brochure page."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="rounded-lg border-border/70 py-0">
            <CardContent className="space-y-4 p-6">
              <Input placeholder="Your name" />
              <Input placeholder="Email address" />
              <Textarea placeholder="Message" className="min-h-40" />
              <Button>Send message</Button>
            </CardContent>
          </Card>
          <div className="grid gap-4">
            {[
              { label: "Email", value: catalog.settings.supportEmail, icon: Mail },
              { label: "Phone", value: catalog.settings.supportPhone, icon: Phone },
              { label: "Response", value: "Within one business day", icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="rounded-lg border-border/70 py-0">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-semibold text-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </StoreShell>
  );
}

-- Persist the complete AI result required by the Phase 1 product generator.
alter table public.ai_generations
  add column if not exists specifications jsonb not null default '[]'::jsonb,
  add column if not exists model text;

comment on column public.ai_generations.specifications is
  'Generated product specifications/feature highlights.';
comment on column public.ai_generations.model is
  'OpenAI model used for this generation.';

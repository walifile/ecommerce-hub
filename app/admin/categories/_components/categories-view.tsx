"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderTree,
  Image as ImageIcon,
  LayoutGrid,
  Package2,
  Search,
  Table as TableIcon,
  X,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CategoryDeleteButton } from "@/app/admin/categories/_components/category-delete-button";
import { CategoryEditButton } from "@/app/admin/categories/_components/category-edit-button";
import { CategoryFormSheet } from "@/app/admin/categories/_components/category-form-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
};

const VIEWS = [
  { key: "grid", icon: LayoutGrid, label: "Grid view" },
  { key: "table", icon: TableIcon, label: "Table view" },
] as const;

const PAGE_SIZE_OPTIONS = [8, 16, 24, 48];

function PaginationBar({
  page,
  totalPages,
  from,
  to,
  total,
  pageSize,
  onPrev,
  onNext,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  if (total === 0) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="space-y-3">
      {/* Row 1: showing info + per page */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{from}–{to}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{total}</span>{" "}
          result{total === 1 ? "" : "s"}
        </p>
        <Select value={String(pageSize)} onValueChange={(v) => v && onPageSize(Number(v))}>
          <SelectTrigger aria-label="Per page" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: centered pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => { e.preventDefault(); onPrev(); }}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {pages.map((p, i) =>
              p === "…" ? (
                <PaginationItem key={`el-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={(e) => { e.preventDefault(); onPage(p as number); }}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => { e.preventDefault(); onNext(); }}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export function CategoriesView({
  categories,
  total,
  totalProducts,
  page,
  pageSize,
}: {
  categories: CategoryView[];
  total: number;
  totalProducts: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filter values from URL
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "name-asc";
  const filterImage = searchParams.get("filterImage") ?? "all";
  const filterProducts = searchParams.get("filterProducts") ?? "all";
  const view = (searchParams.get("view") ?? "table") as "grid" | "table";

  const DEFAULTS: Record<string, string> = {
    sort: "name-asc",
    filterImage: "all",
    filterProducts: "all",
    pageSize: "16",
    view: "table",
  };

  const update = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === "" || val === DEFAULTS[key]) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      if (resetPage) params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?");
    },
    [searchParams, router]
  );

  const hasActiveFilters =
    search !== "" || filterImage !== "all" || filterProducts !== "all" || sort !== "name-asc";

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    ["search", "sort", "filterImage", "filterProducts", "page"].forEach((k) =>
      params.delete(k)
    );
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} categor{total === 1 ? "y" : "ies"} · {totalProducts} products grouped
        </p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/70 bg-card p-0.5">
            {VIEWS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ view: key }, false)}
                aria-pressed={view === key}
                aria-label={label}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-colors",
                  view === key
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <CategoryFormSheet />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug…"
            defaultValue={search}
            key={search}
            onChange={(e) => {
              const val = e.target.value;
              // debounce via setTimeout so we don't push on every keystroke
              clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>).__catSearch);
              (window as unknown as Record<string, ReturnType<typeof setTimeout>>).__catSearch = setTimeout(
                () => update({ search: val }),
                400
              );
            }}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => v && update({ sort: v })}>
          <SelectTrigger aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A → Z</SelectItem>
            <SelectItem value="name-desc">Name Z → A</SelectItem>
            <SelectItem value="most">Most products</SelectItem>
            <SelectItem value="least">Fewest products</SelectItem>
          </SelectContent>
        </Select>

        {/* Image filter */}
        <Select value={filterImage} onValueChange={(v) => v && update({ filterImage: v })}>
          <SelectTrigger aria-label="Image filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All images</SelectItem>
            <SelectItem value="with">With image</SelectItem>
            <SelectItem value="without">Without image</SelectItem>
          </SelectContent>
        </Select>

        {/* Products filter */}
        <Select value={filterProducts} onValueChange={(v) => v && update({ filterProducts: v })}>
          <SelectTrigger aria-label="Products filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="with">Has products</SelectItem>
            <SelectItem value="without">No products</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm"
            className="h-8 rounded-md text-muted-foreground" onClick={clearFilters}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Empty states ── */}
      {total === 0 && !hasActiveFilters ? (
        <Card className="rounded-xl border-dashed border-border/70 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FolderTree className="size-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">No categories yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first category to organize the catalog.
              </p>
            </div>
            <CategoryFormSheet />
          </CardContent>
        </Card>
      ) : total === 0 ? (
        <Card className="rounded-xl border-dashed border-border/70 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">No results</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div key={category.id}
                className="group relative overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  {category.image ? (
                    <div
                      className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${category.image})` }}
                      aria-hidden
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground/40">
                      <ImageIcon className="size-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    <Package2 className="size-3.5" />
                    {category.productCount}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <CategoryEditButton
                      category={{ id: category.id, name: category.name, slug: category.slug, description: category.description, image: category.image }}
                      tone="overlay"
                    />
                    <CategoryDeleteButton id={category.id} name={category.name} productCount={category.productCount} tone="overlay" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="truncate text-base font-semibold text-white">{category.name}</h3>
                    <p className="truncate text-xs text-white/60">/{category.slug}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {category.description || "No description yet."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <PaginationBar page={page} totalPages={totalPages} from={from} to={to} total={total}
            pageSize={pageSize}
            onPrev={() => update({ page: String(page - 1) }, false)}
            onNext={() => update({ page: String(page + 1) }, false)}
            onPage={(p) => update({ page: String(p) }, false)}
            onPageSize={(n) => update({ pageSize: String(n) })}
          />
        </>
      ) : (
        <>
          <Card className="rounded-xl border-border/70 py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 shrink-0 rounded-lg border border-border/70 bg-muted bg-cover bg-center"
                            style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{category.name}</p>
                            {category.description ? (
                              <p className="truncate text-sm text-muted-foreground">{category.description}</p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{category.productCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {category.image ? (
                          <Badge variant="outline" className="rounded-full text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full text-muted-foreground">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1.5">
                          <CategoryEditButton
                            category={{ id: category.id, name: category.name, slug: category.slug, description: category.description, image: category.image }}
                          />
                          <CategoryDeleteButton id={category.id} name={category.name} productCount={category.productCount} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <PaginationBar page={page} totalPages={totalPages} from={from} to={to} total={total}
            pageSize={pageSize}
            onPrev={() => update({ page: String(page - 1) }, false)}
            onNext={() => update({ page: String(page + 1) }, false)}
            onPage={(p) => update({ page: String(p) }, false)}
            onPageSize={(n) => update({ pageSize: String(n) })}
          />
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package2, Search, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductFormSheet } from "@/app/admin/products/_components/product-form-sheet";
import { ProductRowActions } from "@/app/admin/products/_components/product-row-actions";
import { StatusBadge } from "@/components/ecommerce/status-badge";
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
import { formatCurrency } from "@/lib/format";
import type { ProductRow } from "@/app/admin/products/page";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{from}–{to}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{total}</span>{" "}
          product{total === 1 ? "" : "s"}
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

export function ProductsView({
  products,
  total,
  categories,
  page,
  pageSize,
}: {
  products: ProductRow[];
  total: number;
  categories: { id: string; name: string }[];
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search   = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const status   = searchParams.get("status") ?? "all";
  const stock    = searchParams.get("stock") ?? "all";
  const sort     = searchParams.get("sort") ?? "newest";

  const DEFAULTS: Record<string, string> = {
    status:   "all",
    stock:    "all",
    sort:     "newest",
    category: "",
    pageSize: "20",
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
    search !== "" ||
    category !== "" ||
    status !== "all" ||
    stock !== "all" ||
    sort !== "newest";

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    ["search", "category", "status", "stock", "sort", "page"].forEach((k) =>
      params.delete(k)
    );
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const categoryNames = categories.map((c) => c.name);

  return (
    <div className="space-y-5">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} product{total === 1 ? "" : "s"} in the catalog
        </p>
        <ProductFormSheet categories={categoryNames} />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or SKU…"
            defaultValue={search}
            key={search}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>).__prodSearch);
              (window as unknown as Record<string, ReturnType<typeof setTimeout>>).__prodSearch = setTimeout(
                () => update({ search: val }),
                400
              );
            }}
            className="h-8 pl-8 text-sm"
          />
        </div>

        {/* Category */}
        <Select value={category || "all"} onValueChange={(v) => v && update({ category: v === "all" ? "" : v })}>
          <SelectTrigger aria-label="Category" className="w-40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={status} onValueChange={(v) => v && update({ status: v })}>
          <SelectTrigger aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Stock */}
        <Select value={stock} onValueChange={(v) => v && update({ stock: v })}>
          <SelectTrigger aria-label="Stock">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in-stock">In stock</SelectItem>
            <SelectItem value="low-stock">Low stock</SelectItem>
            <SelectItem value="out-of-stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => v && update({ sort: v })}>
          <SelectTrigger aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name A → Z</SelectItem>
            <SelectItem value="name-desc">Name Z → A</SelectItem>
            <SelectItem value="price-asc">Price low → high</SelectItem>
            <SelectItem value="price-desc">Price high → low</SelectItem>
            <SelectItem value="stock-asc">Stock low → high</SelectItem>
            <SelectItem value="stock-desc">Stock high → low</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-md text-muted-foreground"
            onClick={clearFilters}
          >
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
              <Package2 className="size-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">No products yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &ldquo;New product&rdquo; to add your first product.
              </p>
            </div>
            <ProductFormSheet categories={categoryNames} />
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
      ) : (
        <>
          <Card className="rounded-xl border-border/70 py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 shrink-0 rounded-lg border border-border/70 bg-muted bg-cover bg-center"
                            style={
                              product.image
                                ? { backgroundImage: `url(${product.image})` }
                                : undefined
                            }
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{product.name}</p>
                            <p className="truncate text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.stockQuantity} / limit {product.lowStockLimit}
                      </TableCell>
                      <TableCell>
                        {product.stockQuantity <= 0 ? (
                          <Badge variant="destructive" className="rounded-full">Out of stock</Badge>
                        ) : product.stockQuantity <= product.lowStockLimit ? (
                          <Badge variant="outline" className="rounded-full border-amber-500/30 text-amber-600 dark:text-amber-400">
                            Low stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full">Healthy</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end">
                          <ProductRowActions
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
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

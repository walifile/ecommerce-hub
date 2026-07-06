import { z } from "zod";

/** A numeric text field that must parse to a value > 0. */
const positiveAmount = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, msg);

// ── Product ───────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  slug: z.string().trim(),
  sku: z.string().trim(),
  category: z.string().trim(),
  costPrice: z.string().trim(),
  sellingPrice: positiveAmount("Enter a valid selling price"),
  comparePrice: z.string().trim(),
  stockQuantity: z.string().trim(),
  lowStockLimit: z.string().trim(),
  imageUrl: z.string().trim(),
  gallery: z.string(),
  shortDescription: z.string().trim(),
  description: z.string(),
  specifications: z.string(),
  metaTitle: z.string().trim(),
  metaDescription: z.string().trim(),
  status: z.enum(["draft", "published"]),
});

export type ProductFormInput = z.infer<typeof productSchema>;

// ── Category ──────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  slug: z.string().trim(),
  description: z.string().trim(),
  imageUrl: z.string().trim(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

// ── Expense ───────────────────────────────────────────────────────────
export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Enter an expense title"),
  expenseType: z.enum(["advertising", "shipping", "salary", "miscellaneous"]),
  amount: positiveAmount("Enter a valid amount"),
  date: z.string().trim(),
});

export type ExpenseFormInput = z.infer<typeof expenseSchema>;

// ── Coupon ────────────────────────────────────────────────────────────
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Enter a coupon code")
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - and _ only"),
    discountType: z.enum(["fixed", "percentage"]),
    discountValue: positiveAmount("Enter a valid discount value"),
    minOrderAmount: z.string().trim(),
    maxDiscountAmount: z.string().trim(),
    usageLimit: z.string().trim(),
    startsAt: z.string().trim(),
    expiresAt: z.string().trim(),
    active: z.boolean(),
  })
  .refine(
    (d) => !(d.discountType === "percentage" && Number(d.discountValue) > 100),
    { path: ["discountValue"], message: "Percentage cannot exceed 100%" }
  );

export type CouponFormInput = z.infer<typeof couponSchema>;

// ── Store banner ──────────────────────────────────────────────────────
export const bannerSchema = z
  .object({
    announcementEnabled: z.boolean(),
    announcementMessage: z.string().trim(),
    announcementLinkText: z.string().trim(),
    announcementLinkHref: z.string().trim(),
  })
  .refine((d) => !d.announcementEnabled || d.announcementMessage.length > 0, {
    path: ["announcementMessage"],
    message: "Add a banner message before enabling it.",
  });

export type BannerFormInput = z.infer<typeof bannerSchema>;

// ── Storefront theme ──────────────────────────────────────────────────
export const themeSchema = z.object({
  // Plain string keeps RHF input/output types aligned; the server action
  // re-validates the value via resolveTheme().
  theme: z.string().min(1, "Pick a theme."),
});

export type ThemeFormInput = z.infer<typeof themeSchema>;

// Store settings
export const storeDetailsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  supportEmail: z
    .string()
    .trim()
    .email("Enter a valid support email")
    .or(z.literal("")),
  supportPhone: z.string().trim(),
  heroTitle: z.string().trim().min(1, "Hero title is required"),
  heroSubtitle: z.string().trim().min(1, "Hero subtitle is required"),
});

export type StoreDetailsFormInput = z.infer<typeof storeDetailsSchema>;

// Admin security
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/[0-9]/, "Add at least one number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password",
  });

export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>;

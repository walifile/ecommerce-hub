import { z } from "zod";

/** A numeric text field that must parse to a value > 0. */
const positiveAmount = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, msg);

const optionalNonNegativeAmount = (msg: string) =>
  z.string().trim().refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
    msg
  );

const optionalNonNegativeInteger = (msg: string) =>
  z.string().trim().refine(
    (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0),
    msg
  );

const optionalPositiveAmount = (msg: string) =>
  z.string().trim().refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) > 0),
    msg
  );

const optionalPositiveInteger = (msg: string) =>
  z.string().trim().refine(
    (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) > 0),
    msg
  );

const optionalDateTime = (msg: string) =>
  z.string().trim().refine(
    (value) => value === "" || Number.isFinite(new Date(value).getTime()),
    msg
  );

const optionalHttpUrl = z.string().trim().refine(
  (value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value),
  "Enter a valid http(s) image URL"
);

// ── Product ───────────────────────────────────────────────────────────
export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required").max(160, "Product name is too long"),
    slug: z.string().trim().max(180, "Slug is too long").refine(
      (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Slug can only contain lowercase letters, numbers, and single hyphens"
    ),
    sku: z.string().trim().max(80, "SKU is too long"),
    category: z.string().trim().max(100, "Category name is too long"),
    costPrice: optionalNonNegativeAmount("Cost price cannot be negative"),
    sellingPrice: positiveAmount("Enter a valid selling price"),
    comparePrice: optionalNonNegativeAmount("Compare price cannot be negative"),
    stockQuantity: optionalNonNegativeInteger("Stock must be a whole number of zero or more"),
    lowStockLimit: optionalNonNegativeInteger("Low-stock limit must be a whole number of zero or more"),
    imageUrl: optionalHttpUrl,
    gallery: z.string().refine((value) => {
      const urls = value.split("\n").map((line) => line.trim()).filter(Boolean);
      return urls.length <= 12 && urls.every((url) => /^https?:\/\/[^\s]+$/i.test(url));
    }, "Gallery supports up to 12 valid http(s) image URLs"),
    shortDescription: z.string().trim().max(300, "Short description is too long"),
    description: z.string().max(10000, "Description is too long"),
    specifications: z.string().max(5000, "Specifications are too long"),
    metaTitle: z.string().trim().max(60, "Meta title should be 60 characters or fewer"),
    metaDescription: z.string().trim().max(160, "Meta description should be 160 characters or fewer"),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    isNew: z.boolean(),
    bestSeller: z.boolean(),
  })
  .refine(
    (data) => !data.comparePrice || Number(data.comparePrice) > Number(data.sellingPrice),
    { path: ["comparePrice"], message: "Compare price must be higher than selling price" }
  )
  .refine(
    (data) => data.status !== "published" || Boolean(data.imageUrl),
    { path: ["imageUrl"], message: "Published products require a main image" }
  )
  .refine(
    (data) => data.status !== "published" || Boolean(data.description.trim()),
    { path: ["description"], message: "Published products require a description" }
  );

export type ProductFormInput = z.infer<typeof productSchema>;

// ── Category ──────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100, "Category name is too long"),
  slug: z.string().trim().max(120, "Slug is too long").refine(
    (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Slug can only contain lowercase letters, numbers, and single hyphens"
  ),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  imageUrl: optionalHttpUrl,
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

// ── Customer ──────────────────────────────────────────────────────────
export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(120, "Name is too long"),
  phone: z.string().trim().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Enter a valid phone number with 7 to 15 digits"),
  email: z.string().trim().max(254, "Email is too long").refine(
    (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter a valid email address"
  ),
  address: z.string().trim().max(500, "Address is too long"),
  city: z.string().trim().max(100, "City is too long"),
});

export type CustomerFormInput = z.infer<typeof customerSchema>;

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
      .max(40, "Coupon code must be 40 characters or fewer")
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - and _ only"),
    discountType: z.enum(["fixed", "percentage"]),
    discountValue: positiveAmount("Enter a valid discount value"),
    minOrderAmount: optionalNonNegativeAmount("Minimum order cannot be negative"),
    maxDiscountAmount: optionalPositiveAmount("Maximum discount must be greater than zero"),
    usageLimit: optionalPositiveInteger("Usage limit must be a whole number greater than zero"),
    startsAt: optionalDateTime("Enter a valid start date"),
    expiresAt: optionalDateTime("Enter a valid expiry date"),
    active: z.boolean(),
  })
  .refine(
    (d) => !(d.discountType === "percentage" && Number(d.discountValue) > 100),
    { path: ["discountValue"], message: "Percentage cannot exceed 100%" }
  )
  .refine(
    (d) =>
      !d.startsAt ||
      !d.expiresAt ||
      new Date(d.expiresAt).getTime() > new Date(d.startsAt).getTime(),
    { path: ["expiresAt"], message: "Expiry must be after the start date" }
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

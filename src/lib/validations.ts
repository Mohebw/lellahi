import { z } from "zod";

export const purchaseRequestSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد").max(80),
  customerPhone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره تماس معتبر نیست (مثال: 09121234567)"),
  message: z.string().trim().max(500).optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  price: z.coerce.number().int().nonnegative(),
  compareAtPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
  isActive: z.coerce.boolean().default(true),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  specs: z.record(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  badge: z.enum(["NONE", "NEW", "FEATURED", "DISCOUNT", "OUT_OF_STOCK"]).default("NONE"),
  images: z.array(z.string()).optional()
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  icon: z.string().trim().optional().or(z.literal("")),
  image: z.string().trim().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  order: z.coerce.number().int().default(0)
});

export const requestStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "CONTACTED", "COMPLETED", "CANCELLED"])
});

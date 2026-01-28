import { z } from "zod";

// Slug validation: 3-50 characters, alphanumeric, hyphens, underscores
// Cannot be a reserved word
export const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;

export const RESERVED_SLUGS = [
  "dashboard",
  "admin",
  "settings",
  "api",
  "auth",
  "sign-in",
  "sign-up",
  "login",
  "register",
  "logout",
  "profile",
  "404",
  "test",
];

export const isSlugReserved = (slug: string) => {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
};

export const customSlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug must be less than 50 characters")
  .regex(SLUG_REGEX, "Slug can only contain letters, numbers, hyphens, and underscores")
  .refine((slug) => !isSlugReserved(slug), "This slug is reserved");

export const utmParamsSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
});

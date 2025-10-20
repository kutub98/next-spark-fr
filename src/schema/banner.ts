import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Image URL must be valid"),
  buttonText: z.string().min(1, "Button text is required"),
  status: z.enum(["approve", "pending", "rejected"]),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

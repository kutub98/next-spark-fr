import { api } from "@/data/api";
import { z } from "zod";

export const bannerSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Image must be a valid URL"),
  buttonText: z.string().optional(),
  status: z.enum(["approved", "pending", "rejected"]),
});

export type BannerPayload = z.infer<typeof bannerSchema>;

export const createBanner = async (data: BannerPayload) => {
  const res = await fetch(`${api}/banner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([data]),
  });

  if (!res.ok) {
    const errorBody = await res.text(); // or res.json() if your backend returns JSON
    console.error("API Error Response:", errorBody);
    throw new Error("Failed to create banner");
  }

  return res.json();
};

export const updateBanner = async (id: string, data: BannerPayload) => {
  const res = await fetch(`${api}/banner/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update banner");
  return res.json();
};

export const deleteBanner = async (id: string) => {
  const res = await fetch(`${api}/banner/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete banner");
  return res.json();
};

export const getBanner = async () => {
  const res = await fetch(`${api}/banner`);

  if (!res.ok) throw new Error("Failed to fetch banner");

  return res.json(); // returns: { success, message, data: [...] }
};

import { api } from "@/data/api";
import { z } from "zod";

export const offerSchema = z.object({
  _id: z.string().optional(),
  img: z.string().url({ message: "Must be a valid image URL" }),
  amount: z.number(),
  dailyGift: z.number(),
  dayLength: z.number(),
  status: z.enum(["approved", "pending", "delete"]),
  __v: z.number().optional(),
});

export const offerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: offerSchema,
});

export type Offer = z.infer<typeof offerSchema>;
export type OfferResponse = z.infer<typeof offerResponseSchema>;

export const createOffer = async (data: Offer) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found. Please log in first.");
  }
  const res = await fetch(`${api}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.text(); // or res.json() if your backend returns JSON
    console.error("API Error Response:", errorBody);
    throw new Error("Failed to create Offer");
  }

  return res.json();
};

export const updateOffer = async (id: string, data: Offer) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found. Please log in first.");
  }
  const res = await fetch(`${api}/offers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Offer");
  return res.json();
};

export const deleteOffer = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found. Please log in first.");
  }
  const res = await fetch(`${api}/offers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete Offer");
  return res.json();
};

export const getOffer = async () => {
  const res = await fetch(`${api}/Offers`);

  if (!res.ok) throw new Error("Failed to fetch Offer");

  return res.json(); // returns: { success, message, data: [...] }
};



import { api } from "@/data/api";

// GET sponsors (no change)
export async function getSponsors() {
  const res = await fetch(`${api}/sponsored-by`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load sponsors");
  return res.json();
}

// CREATE sponsor with FormData
export async function createSponsor(data: FormData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${api}/sponsored-by`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: data, // FormData is sent directly
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Create Sponsor Error:", text);
    throw new Error("Failed to create sponsor");
  }
  return res.json();
}

// UPDATE sponsor with FormData
export async function updateSponsor(id: string, data: FormData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${api}/sponsored-by/${id}`, {
    method: "PUT",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: data, // FormData is sent directly
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update Sponsor Error:", text);
    throw new Error("Failed to update sponsor");
  }
  return res.json();
}

// DELETE sponsor (no change)
export async function deleteSponsor(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${api}/sponsored-by/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) throw new Error("Failed to delete sponsor");
  return res.json();
}

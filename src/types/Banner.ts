export type Banner = {
  _id: string;
  title: string;
  description: string;
  image: string; // could be base64 or URL
  buttonText?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
};

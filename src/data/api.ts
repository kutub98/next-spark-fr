export const api =
  process.env.NODE_ENV === "production"
    ? "https://next-spark-backend.vercel.app"
    : "http://localhost:5000/api/v1";

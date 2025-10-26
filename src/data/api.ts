// export const api = "https://next-spark-backend-js.vercel.app/api";

// export const api = "http://localhost:5000/api";

export const api = process.env.NODE_ENV === "production" ? "https://next-spark-backend-js.vercel.app/api" : "http://localhost:5000/api";
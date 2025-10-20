import next from "next";
import { createServer } from "http";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Use WHATWG URL API — required in Next.js 15
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, hostname, () => {
    console.log(`✅ Ready on http://${hostname}:${port}`);
  });
});

import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { api } from "./api.js";
import { closeDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/api", api);

const distPath = join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(join(distPath, "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  closeDb();
  server.close();
  process.exit();
});

process.on("SIGTERM", () => {
  closeDb();
  server.close();
  process.exit();
});

import { Router } from "express";
import { getDb } from "./db.js";

export const api = Router();

api.get("/:empresa/menu", (req, res) => {
  const db = getDb();
  const empresa = db
    .prepare("SELECT * FROM empresas WHERE id = ?")
    .get(req.params.empresa);

  if (!empresa) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  const items = db
    .prepare("SELECT * FROM menu_items WHERE empresa_id = ? ORDER BY sort_order")
    .all(req.params.empresa);

  res.json({ empresa, items });
});

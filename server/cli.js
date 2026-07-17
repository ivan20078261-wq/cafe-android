import { getDb, closeDb } from "./db.js";

const db = getDb();

const [, , cmd, ...args] = process.argv;

async function main() {
  switch (cmd) {
    // ── Empresas ──────────────────────────────────────
    case "empresa":
      return handleEmpresa(args);
    case "menu":
      return handleMenu(args);
    default:
      printHelp();
  }
}

// ── Empresa commands ──────────────────────────────────

function handleEmpresa(args) {
  const [sub, ...rest] = args;

  switch (sub) {
    case "list": {
      const rows = db.prepare("SELECT * FROM empresas ORDER BY nombre").all();
      if (rows.length === 0) {
        console.log("No hay empresas registradas.");
        return;
      }
      console.log("\n📋  Empresas:\n");
      for (const r of rows) {
        console.log(`  ${r.id.padEnd(20)} ${r.nombre}`);
      }
      break;
    }
    case "create": {
      const [id, nombre, subtitle = ""] = rest;
      if (!id || !nombre) {
        console.log("Uso: node server/cli.js empresa create <id> <nombre> [subtitle]");
        return;
      }
      db.prepare("INSERT INTO empresas (id, nombre, subtitle) VALUES (?, ?, ?)").run(
        id,
        nombre,
        subtitle
      );
      console.log(`✅ Empresa "${nombre}" (${id}) creada.`);
      break;
    }
    case "remove": {
      const [id] = rest;
      if (!id) {
        console.log("Uso: node server/cli.js empresa remove <id>");
        return;
      }
      db.prepare("DELETE FROM menu_items WHERE empresa_id = ?").run(id);
      db.prepare("DELETE FROM empresas WHERE id = ?").run(id);
      console.log(`🗑️  Empresa "${id}" eliminada.`);
      break;
    }
    default:
      console.log("Subcomandos: list, create, remove");
  }
}

// ── Menu commands ─────────────────────────────────────

function handleMenu(args) {
  const [sub, ...rest] = args;

  switch (sub) {
    case "list": {
      const [empresaId] = rest;
      if (!empresaId) {
        console.log("Uso: node server/cli.js menu list <empresa_id>");
        return;
      }
      const emp = db.prepare("SELECT * FROM empresas WHERE id = ?").get(empresaId);
      if (!emp) {
        console.log(`❌ Empresa "${empresaId}" no encontrada.`);
        return;
      }
      const items = db
        .prepare("SELECT * FROM menu_items WHERE empresa_id = ? ORDER BY sort_order")
        .all(empresaId);
      console.log(`\n📋  Menú de ${emp.nombre}:\n`);
      for (const item of items) {
        console.log(
          `  ${item.id.padEnd(16)} $${String(item.precio).padStart(3)}  ${item.nombre.padEnd(20)} ${item.icono}`
        );
      }
      break;
    }
    case "add": {
      const [empresaId, id, nombre, precioStr, descripcion = "", icono = "espresso"] = rest;
      const precio = parseInt(precioStr, 10);
      if (!empresaId || !id || !nombre || isNaN(precio)) {
        console.log(
          "Uso: node server/cli.js menu add <empresa_id> <id> <nombre> <precio> [descripcion] [icono]"
        );
        return;
      }
      const emp = db.prepare("SELECT * FROM empresas WHERE id = ?").get(empresaId);
      if (!emp) {
        console.log(`❌ Empresa "${empresaId}" no encontrada. Crealá primero.`);
        return;
      }
      const maxOrder = db
        .prepare("SELECT MAX(sort_order) as m FROM menu_items WHERE empresa_id = ?")
        .get(empresaId);
      const sortOrder = (maxOrder?.m ?? -1) + 1;

      db.prepare(
        "INSERT INTO menu_items (id, empresa_id, nombre, descripcion, precio, icono, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(id, empresaId, nombre, descripcion, precio, icono, sortOrder);
      console.log(`✅ "${nombre}" agregado al menú de ${empresaId} ($${precio}).`);
      break;
    }
    case "remove": {
      const [empresaId, itemId] = rest;
      if (!empresaId || !itemId) {
        console.log("Uso: node server/cli.js menu remove <empresa_id> <item_id>");
        return;
      }
      db.prepare("DELETE FROM menu_items WHERE id = ? AND empresa_id = ?").run(
        itemId,
        empresaId
      );
      console.log(`🗑️  "${itemId}" eliminado del menú de ${empresaId}.`);
      break;
    }
    case "seed": {
      const [empresaId] = rest;
      if (!empresaId) {
        console.log("Uso: node server/cli.js menu seed <empresa_id>");
        return;
      }
      const emp = db.prepare("SELECT * FROM empresas WHERE id = ?").get(empresaId);
      if (!emp) {
        console.log(`❌ Empresa "${empresaId}" no encontrada.`);
        return;
      }
      seedMenu(empresaId);
      break;
    }
    default:
      console.log("Subcomandos: list, add, remove, seed");
  }
}

function seedMenu(empresaId) {
  const items = [
    { id: "espresso", nombre: "Espresso", descripcion: "Intenso y aromático, shot puro de café.", precio: 45, icono: "espresso" },
    { id: "cappuccino", nombre: "Cappuccino", descripcion: "Espuma suave con equilibrio perfecto.", precio: 65, icono: "cappuccino" },
    { id: "latte", nombre: "Latte", descripcion: "Cremoso y suave, leche texturizada.", precio: 60, icono: "latte" },
    { id: "flatwhite", nombre: "Flat White", descripcion: "Microespuma densa, doble shot.", precio: 70, icono: "flatwhite" },
    { id: "coldbrew", nombre: "Cold Brew", descripcion: "Frío, suave y refrescante.", precio: 75, icono: "coldbrew" },
    { id: "cortado", nombre: "Cortado", descripcion: "Espresso con un toque de leche caliente.", precio: 50, icono: "cortado" },
  ];

  const insert = db.prepare(
    "INSERT OR IGNORE INTO menu_items (id, empresa_id, nombre, descripcion, precio, icono, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (let i = 0; i < items.length; i++) {
      insert.run(items[i].id, empresaId, items[i].nombre, items[i].descripcion, items[i].precio, items[i].icono, i);
    }
  });

  tx();
  console.log(`🌱 Menú semilla insertado para "${empresaId}".`);
}

function printHelp() {
  console.log(`
Uso: node server/cli.js <comando> [args]

Comandos:

  empresa list
  empresa create <id> <nombre> [subtitle]
  empresa remove <id>

  menu list <empresa_id>
  menu add <empresa_id> <item_id> <nombre> <precio> [descripcion] [icono]
  menu remove <empresa_id> <item_id>
  menu seed <empresa_id>
`);
}

main().finally(() => closeDb());

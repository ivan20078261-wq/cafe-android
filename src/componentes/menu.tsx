export interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string;
}

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  cafe: "Cafés",
  te: "Tés",
  bebidas: "Bebidas",
  pasteleria: "Pastelería",
  facturas: "Facturas",
  panes: "Panes",
  comida: "Comida",
  ensaladas: "Ensaladas",
  bowls: "Bowls",
  wraps: "Wraps",
  principal: "Principal",
  postre: "Postres",
};

const ORDEN_CATEGORIA = [
  "cafe",
  "te",
  "bebidas",
  "pasteleria",
  "facturas",
  "panes",
  "comida",
  "ensaladas",
  "bowls",
  "wraps",
  "principal",
  "postre",
];

export function categoriasDeItems(items: MenuItem[]): string[] {
  const cats = [...new Set(items.map((i) => i.categoria))].sort((a, b) => {
    const ia = ORDEN_CATEGORIA.indexOf(a);
    const ib = ORDEN_CATEGORIA.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  return cats.filter((c) => items.some((i) => i.categoria === c));
}

export function etiquetaDe(cat: string): string {
  return ETIQUETAS_CATEGORIA[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}
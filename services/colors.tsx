export const colors = {
  // ── Marca ──────────────────────────────────────────────
  brand: {
    espresso: "#2C1810", // marrón café profundo — CTA principal, header badge
    latte: "#8B6840", // marrón medio — íconos, bordes activos
    crema: "#F5ECD8", // crema suave — texto sobre fondo oscuro
    leche: "#EDE0CC", // café con leche — fondos de miniaturas/thumbs
  },

  // ── Fondo / superficies ────────────────────────────────
  surface: {
    base: "#FDFBF7", // fondo principal de la app (crema cálido)
    card: "#F5EDE0", // tarjetas hover / bottom sheet bloques
    section: "#F0E8DB", // separadores, fondos de sección
    input: "#FDFBF7", // fondo de inputs y textareas
  },

  // ── Bordes ─────────────────────────────────────────────
  border: {
    default: "#EAE0D0", // hairline por defecto
    soft: "#F0E8DB", // divisores entre cards
    strong: "#D5C8B5", // bordes de botones secundarios
    active: "#2C1810", // borde de opción seleccionada
    veg: "#C4703A", // borde terracota — leches vegetales seleccionadas
  },

  // ── Texto ──────────────────────────────────────────────
  text: {
    primary: "#2C1810", // títulos y valores principales
    secondary: "#5C4030", // texto de opciones / botones
    muted: "#9B8B7A", // descripciones, labels, subtítulos
    onDark: "#F5ECD8", // texto sobre fondos oscuros (espresso)
    veg: "#7A3A10", // texto de leches vegetales seleccionadas
  },

  // ── Estados de mesa / pedidos ──────────────────────────
  status: {
    libre: {
      silla: "#C8B99A",
      mesa: "#E8D9C0",
      borde: "#C8B99A",
      dot: "#9CA3AF",
    },
    pendiente: {
      silla: "#F59E0B",
      mesa: "#FFFBEB",
      borde: "#F59E0B",
      dot: "#F59E0B",
      badge: "#FEF9C3",
      badgeText: "#854D0E",
    },
    preparando: {
      silla: "#F97316",
      mesa: "#FFF7ED",
      borde: "#F97316",
      dot: "#F97316",
      badge: "#FFEDD5",
      badgeText: "#9A3412",
    },
    urgente: {
      silla: "#EF4444",
      mesa: "#FEF2F2",
      borde: "#EF4444",
      dot: "#EF4444",
      badge: "#FEE2E2",
      badgeText: "#991B1B",
    },
  },

  // ── Sala / plano ───────────────────────────────────────
  salon: {
    piso: "#EFE1CC", // tablones del piso
    pisoAlt: "#EAD9C0", // variación de tablón
    pisoBorde: "#D9C8B0", // línea entre tablones
    pared: "#C8B99A", // paredes laterales
    paredSombra: "#B8A88A", // borde interior de pared
    planta: "#2D6A4F", // hojas de plantas decorativas
    plantaOsc: "#1B4332", // hojas oscuras
    plantaMac: "#8B6914", // maceta
    ventana: "#A8C4D8", // vidrio de ventanas
    barra: "#C8A870", // mostrador/barra lateral
  },
} as const;

export type Colors = typeof colors;

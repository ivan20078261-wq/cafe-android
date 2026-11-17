export const colors = {
  // ── Marca ──────────────────────────────────────────────
  // En el modo "moderno limpio" el espresso es el único acento
  // (CTAs, selección, estado activo). El resto es neutro.
  brand: {
    espresso: "#2C1810", // marrón café profundo — CTAs, selección
    latte: "#8B6840", // marrón medio — precios, detalles secundarios
    crema: "#FDFBF7", // tinta sobre fondo oscuro
    leche: "#F7F7F5", // fondos de thumbnails / chips
  },

  // ── Fondo / superficies ────────────────────────────────
  surface: {
    base: "#FFFFFF", // fondo principal de la app
    card: "#F7F7F5", // tarjetas y chips (gris cálido muy suave)
    section: "#F2F1EE", // separadores, fondos de sección
    input: "#FFFFFF", // inputs y textareas
  },

  // ── Bordes ─────────────────────────────────────────────
  border: {
    default: "#ECEBE7", // hairline por defecto
    soft: "#F2F1EE", // divisores entre cards
    strong: "#D9D7D1", // bordes de botones secundarios
    active: "#2C1810", // opción seleccionada
    veg: "#C4703A", // borde terracota — leches vegetales seleccionadas
  },

  // ── Texto ──────────────────────────────────────────────
  text: {
    primary: "#1C1917", // título principal (casi negro cálido)
    secondary: "#44403C", // opciones / botones
    muted: "#8A8680", // descripciones, labels, subtítulos
    onDark: "#FDFBF7", // texto sobre fondos oscuros (espresso)
    veg: "#7A3A10", // texto de leches vegetales seleccionadas
  },

  // ── Sombras ────────────────────────────────────────────
  shadow: {
    sm: "0 1px 2px rgba(28,25,23,0.05)",
    md: "0 2px 10px rgba(28,25,23,0.07)",
    lg: "0 10px 30px rgba(28,25,23,0.10)",
    bar: "0 -2px 14px rgba(28,25,23,0.06)",
    fab: "0 6px 20px rgba(28,25,23,0.22)",
  },

  // ── Estados de mesa / pedidos (compat, heredados) ──────
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

  // ── Sala / plano (compat, heredados) ───────────────────
  salon: {
    piso: "#EFE1CC",
    pisoAlt: "#EAD9C0",
    pisoBorde: "#D9C8B0",
    pared: "#C8B99A",
    paredSombra: "#B8A88A",
    planta: "#2D6A4F",
    plantaOsc: "#1B4332",
    plantaMac: "#8B6914",
    ventana: "#A8C4D8",
    barra: "#C8A870",
  },
} as const;

export type Colors = typeof colors;
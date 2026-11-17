import type { SVGProps } from "react";

/**
 * Set de íconos lineales de café — estilo Café Central.
 * Todos comparten el mismo grosor de trazo y paleta (marrón café),
 * pero cada uno tiene un detalle visual distinto según la bebida.
 *
 * Uso:
 *   <IconLatte size={32} />
 *   <IconEspresso size={24} stroke="#2C1810" />
 */

export interface CoffeeIconProps extends SVGProps<SVGSVGElement> {
  /** Tamaño en px (alto y ancho). Default: 32 */
  size?: number;
  /** Color del trazo principal. Default: #8B6840 */
  stroke?: string;
  /** Color del trazo secundario (detalles internos). Default: #B8916A */
  strokeLight?: string;
}

function withDefaults({
  size = 32,
  stroke = "#8B6840",
  strokeLight = "#B8916A",
  ...rest
}: CoffeeIconProps) {
  return { size, stroke, strokeLight, rest };
}

/**
 * Carita simple y reutilizable: dos ojitos + boquita curva sonriente.
 * Se dibuja sobre el cuerpo de la taza en (cx, cy).
 */
function Face({
  cx,
  cy,
  w,
  color = "#5C4030",
}: {
  cx: number;
  cy: number;
  w: number;
  color?: string;
}) {
  const eyeDx = w * 0.16;
  return (
    <>
      <circle cx={cx - eyeDx} cy={cy} r="0.9" fill={color} />
      <circle cx={cx + eyeDx} cy={cy} r="0.9" fill={color} />
      <path
        d={`M${cx - 2.2} ${cy + 2.6} Q${cx} ${cy + 4.4} ${cx + 2.2} ${cy + 2.6}`}
        stroke={color}
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ── Espresso ───────────────────────────────────────────── */
export function IconEspresso(props: CoffeeIconProps) {
  const { size, stroke, strokeLight, rest } = withDefaults(props);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M11 16h10l-1 9a2 2 0 0 1-2 1.8h-4a2 2 0 0 1-2-1.8L11 16z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M22 18h1.5a2 2 0 0 1 0 4H21.5"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="28"
        x2="22.5"
        y2="28"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M14 13c0-1 1-1.4 1-2.6M18 13c0-1 1-1.4 1-2.6"
        stroke={strokeLight}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Face cx={16} cy={20} w={10} />
    </svg>
  );
}

/* ── Cappuccino ─────────────────────────────────────────── */
export function IconCappuccino(props: CoffeeIconProps) {
  const { size, stroke, strokeLight, rest } = withDefaults(props);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M8 14h16v8a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-8z"
        stroke={stroke}
        strokeWidth="1.3"
      />
      <path
        d="M24 16h1.8a2.3 2.3 0 0 1 0 4.6H24"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 14c1-2 .5-3 0-4M16 14c.6-2 .1-3-.4-4M22.5 14c1-2 .5-3 0-4"
        stroke={strokeLight}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Face cx={16} cy={20.5} w={16} />
    </svg>
  );
}

/* ── Latte ──────────────────────────────────────────────── */
export function IconLatte(props: CoffeeIconProps) {
  const { size, stroke, rest } = withDefaults(props);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M9 13h14l-1.2 11.5A3 3 0 0 1 18.8 27h-5.6a3 3 0 0 1-3-2.5L9 13z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M23 15h1.6a2.2 2.2 0 0 1 0 4.4H22.8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="27"
        x2="24.5"
        y2="27"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Face cx={16} cy={19.5} w={14} />
    </svg>
  );
}

/* ── Flat White ─────────────────────────────────────────── */
export function IconFlatWhite(props: CoffeeIconProps) {
  const { size, stroke, rest } = withDefaults(props);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M10 14h12v8.5a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5V14z"
        stroke={stroke}
        strokeWidth="1.3"
      />
      <path
        d="M22 16h1.6a2.2 2.2 0 0 1 0 4.4H22"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="8.5"
        y1="27"
        x2="23.5"
        y2="27"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Face cx={16} cy={19.5} w={12} />
    </svg>
  );
}

/* ── Cold Brew ──────────────────────────────────────────── */
export function IconColdBrew(props: CoffeeIconProps) {
  const { size, stroke, rest } = withDefaults(props);
  const ice = "#A8C4D8";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M10 9h12l-1.3 17a2 2 0 0 1-2 1.8h-5.4a2 2 0 0 1-2-1.8L10 9z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line
        x1="9"
        y1="9"
        x2="23"
        y2="9"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* cubos de hielo */}
      <path
        d="M13 13l1 5M16 12l.3 8M19 13l-1 5"
        stroke={ice}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1="12.5"
        y1="22"
        x2="19.5"
        y2="22"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.7}
      />
      <Face cx={16} cy={18} w={12} />
    </svg>
  );
}

/* ── Cortado ────────────────────────────────────────────── */
export function IconCortado(props: CoffeeIconProps) {
  const { size, stroke, rest } = withDefaults(props);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M12 15h8l-.8 8.5a1.8 1.8 0 0 1-1.8 1.6h-2.8a1.8 1.8 0 0 1-1.8-1.6L12 15z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M20 16.5h1.3a1.8 1.8 0 0 1 0 3.6H20"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="25"
        x2="21"
        y2="25"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Face cx={16} cy={19.5} w={8} />
    </svg>
  );
}

/* ── Mapa nombre → componente, útil para renderizar dinámicamente ── */
// eslint-disable-next-line react-refresh/only-export-components
export const COFFEE_ICONS = {
  espresso: IconEspresso,
  cappuccino: IconCappuccino,
  latte: IconLatte,
  flatwhite: IconFlatWhite,
  coldbrew: IconColdBrew,
  cortado: IconCortado,
} as const;

export type CoffeeIconKey = keyof typeof COFFEE_ICONS;

/** Renderiza el ícono correspondiente a partir de su key. */
export function CoffeeIcon({
  name,
  ...props
}: { name: CoffeeIconKey } & CoffeeIconProps) {
  const Icon = COFFEE_ICONS[name];
  return <Icon {...props} />;
}

import type { MenuItem } from "./menu";
import { colors } from "../../services/colors";

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

export default function MenuGrid({
  items,
  onSelectCafe,
}: {
  items: MenuItem[];
  onSelectCafe: (cafe: MenuItem) => void;
}) {
  const categorias = [...new Set(items.map((i) => i.categoria))].sort(
    (a, b) => {
      const ia = ORDEN_CATEGORIA.indexOf(a);
      const ib = ORDEN_CATEGORIA.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    },
  );
  return (
    <div style={{ padding: "12px 4px 40px" }}>
      {categorias.map((cat, catIdx) => {
        const catItems = items.filter((m) => m.categoria === cat);
        if (catItems.length === 0) return null;

        return (
          <div
            key={cat}
            style={{
              marginBottom: 28,
              animation: `fadeSlideUp 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) both`,
              animationDelay: `${catIdx * 0.06}s`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                paddingLeft: 4,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: colors.brand.latte,
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.brand.latte,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: 0,
                }}
              >
                {ETIQUETAS_CATEGORIA[cat] ||
                  cat.charAt(0).toUpperCase() + cat.slice(1)}
              </h2>
            </div>
            {catItems.map((item, i) => {
              const Icono = IconDefault;
              const esUltimo = i === catItems.length - 1;
              const itemDelay = catIdx * 0.06 + i * 0.04;

              return (
                <div
                  className="menu-item"
                  key={item.id}
                  onClick={() => onSelectCafe(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 12px",
                    marginBottom: esUltimo ? 0 : 2,
                    borderRadius: 12,
                    border: `1px solid transparent`,
                    cursor: "pointer",
                    animation: `fadeSlideUp 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) both`,
                    animationDelay: `${itemDelay}s`,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "88px",
                      height: "88px",
                      background: colors.surface.section,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Icono size={34} stroke={colors.brand.latte} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: colors.text.primary,
                        }}
                      >
                        {item.nombre}
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: colors.brand.latte,
                        }}
                      >
                        ${item.precio}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "12px",
                        color: colors.text.muted,
                        lineHeight: "1.4",
                      }}
                    >
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function IconDefault(props: { size?: number; stroke?: string }) {
  const { size = 32, stroke = "#8B6840" } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

import { useEffect } from "react";
import type { MenuItem } from "./menu";
import { etiquetaDe } from "./menu";
import { colors } from "../../services/colors";
import "./../../estilos/menugrid.css";

export default function MenuGrid({
  items,
  categorias,
  onSelectCafe,
  onSeccionVisible,
}: {
  items: MenuItem[];
  categorias: string[];
  onSelectCafe: (cafe: MenuItem) => void;
  onSeccionVisible: (cat: string) => void;
}) {
  useEffect(() => {
    if (!onSeccionVisible || categorias.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) onSeccionVisible(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    categorias.forEach((_, i) => {
      const el = document.getElementById(`seccion-${i}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categorias, onSeccionVisible]);

  return (
    <div style={{ padding: "0 16px 130px" }}>
      {categorias.map((cat, catIdx) => {
        const catItems = items.filter((m) => m.categoria === cat);
        if (catItems.length === 0) return null;

        return (
          <section
            key={cat}
            id={`seccion-${catIdx}`}
            style={{ paddingTop: 18, scrollMarginTop: 92 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.text.primary,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                {etiquetaDe(cat)}
              </h2>
              <span
                style={{
                  height: 1,
                  flex: 1,
                  background: colors.border.soft,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.text.muted,
                }}
              >
                {catItems.length}
              </span>
            </div>

            {catItems.map((item) => (
              <div
                className="menu-item"
                key={item.id}
                onClick={() => onSelectCafe(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  background: colors.surface.card,
                  borderRadius: 16,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    background: colors.surface.base,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: `1px solid ${colors.border.soft}`,
                  }}
                >
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <IconDefault size={30} stroke={colors.brand.latte} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      {item.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: colors.brand.espresso,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${item.precio}
                    </span>
                  </div>
                  {item.descripcion && (
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 12,
                        color: colors.text.muted,
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.descripcion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>
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
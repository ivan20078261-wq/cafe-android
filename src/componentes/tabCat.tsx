import { colors } from "../../services/colors";
import { etiquetaDe } from "./menu";

export default function TabCat({
  categorias,
  activa,
  onCambiar,
}: {
  categorias: string[];
  activa: string | null;
  onCambiar: (seccionId: string) => void;
}) {
  if (categorias.length === 0) return null;

  return (
    <div
      className="no-scrollbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        gap: 8,
        overflowX: "auto",
        background: colors.surface.base,
        padding: "12px 16px 10px",
        borderBottom: `1px solid ${colors.border.soft}`,
      }}
    >
      {categorias.map((cat, i) => {
        const seccionId = `seccion-${i}`;
        const esActivo = activa === seccionId;
        return (
          <button
            key={cat}
            onClick={() => onCambiar(seccionId)}
            style={{
              flexShrink: 0,
              border: "none",
              cursor: "pointer",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              background: esActivo ? colors.brand.espresso : colors.surface.card,
              color: esActivo ? colors.text.onDark : colors.text.secondary,
              transition: "background 0.2s, color 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {etiquetaDe(cat)}
          </button>
        );
      })}
    </div>
  );
}
import { useState } from "react";
import { colors } from "../../services/colors";
import type { MenuItem } from "./menu";
import type { Grupo } from "./SelectorModificadores";
import SelectorModificadores from "./SelectorModificadores";
import "./ProductModal.css";

export interface OrderItem {
  cafe: MenuItem;
  modificadores?: { grupo: string; opciones: { nombre: string; precio: number }[] }[];
  notas: string;
  precio: number;
  cantidad: number;
}

export default function ProductModal({
  cafe,
  onAdd,
  onClose,
}: {
  cafe: MenuItem;
  onAdd: (item: OrderItem) => void;
  onClose: () => void;
}) {
  const [notas, setNotas] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [modSelections, setModSelections] = useState<Record<number, number[]>>({});
  const [modGroups, setModGroups] = useState<Grupo[]>([]);

  const precioBase = cafe.precio;

  const precioAdicional = Object.entries(modSelections).reduce(
    (sum, [groupId, opcionIds]) => {
      const grupo = modGroups.find((g) => g.id === Number(groupId));
      if (!grupo) return sum;
      const adicional = opcionIds.reduce((s, oid) => {
        const op = grupo.opciones.find((o) => o.id === oid);
        return s + (op?.precio_adicional ?? 0);
      }, 0);
      return sum + adicional;
    },
    0,
  );

  const precioUnitario = precioBase + precioAdicional;
  const total = precioUnitario * cantidad;

  function handleModChange(
    selections: Record<number, number[]>,
    groups: Grupo[],
  ) {
    setModSelections(selections);
    setModGroups(groups);
  }

  function restar() {
    setCantidad((c) => Math.max(1, c - 1));
  }

  function sumar() {
    setCantidad((c) => Math.min(99, c + 1));
  }

  function handleAdd() {
    const modificadores = modGroups.map((g) => ({
      grupo: g.nombre,
      opciones: (modSelections[g.id] || []).map((oid) => {
        const op = g.opciones.find((o) => o.id === oid);
        return { nombre: op?.nombre ?? "", precio: op?.precio_adicional ?? 0 };
      }),
    })).filter((m) => m.opciones.length > 0);

    onAdd({
      cafe,
      ...(modificadores.length > 0 ? { modificadores } : {}),
      notas,
      precio: total,
      cantidad,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        width: "100%",
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        alignItems: "flex-end",
        zIndex: 1000,
        display: "flex",
      }}
    >
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.surface.base,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          width: "100%",
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          padding: "24px 24px 24px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            color: colors.text.muted,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div className="modal-scroll">
          {cafe.imagen_url && (
            <div
              style={{
                width: "auto",
                height: 200,
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <img
                src={cafe.imagen_url}
                alt={cafe.nombre}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}
          <h2
            style={{
              fontSize: 22,
              color: colors.text.primary,
              marginBottom: 4,
              paddingRight: 32,
            }}
          >
            {cafe.nombre}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: colors.text.muted,
              lineHeight: 1.4,
              marginBottom: 20,
            }}
          >
            {cafe.descripcion}
          </p>

          <SelectorModificadores
            productoId={cafe.id}
            onChange={handleModChange}
          />

          <div className="milk-section">
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: 8,
              }}
            >
              Cantidad
            </p>
            <div className="quantity-row">
              <button className="qty-btn" onClick={restar}>−</button>
              <span className="qty-value">{cantidad}</span>
              <button className="qty-btn" onClick={sumar}>+</button>
            </div>
          </div>

          <div className="milk-section">
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: 8,
              }}
            >
              Notas
            </p>
            <textarea
              className="notes-textarea"
              placeholder="Algún detalle extra…"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div>
            <p
              style={{
                fontSize: 13,
                color: colors.text.muted,
                margin: 0,
              }}
            >
              Total
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              ${total}
            </p>
          </div>
          <button
            className="add-btn"
            style={{
              background: colors.border.active,
              color: colors.text.onDark,
            }}
            onClick={handleAdd}
          >
            Agregar a la mesa
          </button>
        </div>
      </div>
    </div>
  );
}

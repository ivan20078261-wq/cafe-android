import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { colors } from "../../services/colors";

interface Opcion {
  id: number;
  nombre: string;
  precio_adicional: number;
}

interface Grupo {
  id: number;
  nombre: string;
  tipo: "select" | "multi";
  requerido: boolean;
  opciones: Opcion[];
}

interface Props {
  productoId: string;
  onChange: (selections: Record<number, number[]>, groups: Grupo[]) => void;
}

export type { Grupo, Opcion };

export default function SelectorModificadores({
  productoId,
  onChange,
}: Props) {
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [selections, setSelections] = useState<Record<number, number[]>>({});

  useEffect(() => {
    fetchModifiers();
  }, [productoId]);

  async function fetchModifiers() {
    const { data: rels } = await supabase
      .from("producto_modificador")
      .select("modificador_id")
      .eq("producto_id", productoId);

    if (!rels || rels.length === 0) {
      setGroups([]);
      setSelections({});
      onChange({}, []);
      return;
    }

    const modIds = rels.map((r) => r.modificador_id);

    const { data: mods } = await supabase
      .from("modificadores")
      .select("*")
      .in("id", modIds)
      .order("orden");

    if (!mods) return;

    const { data: opts } = await supabase
      .from("opciones_modificador")
      .select("*")
      .in("modificador_id", modIds)
      .order("orden");

    const groupsWithOpts: Grupo[] = mods.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      tipo: m.tipo,
      requerido: m.requerido,
      opciones: (opts || []).filter((o) => o.modificador_id === m.id),
    }));

    setGroups(groupsWithOpts);

    const init: Record<number, number[]> = {};
    for (const g of groupsWithOpts) {
      if (g.tipo === "select" && g.opciones.length > 0) {
        init[g.id] = [g.opciones[0].id];
      } else {
        init[g.id] = [];
      }
    }
    setSelections(init);
    onChange(init, groupsWithOpts);
  }

  function toggleOption(groupId: number, opcionId: number, tipo: string) {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      const next =
        tipo === "select"
          ? [opcionId]
          : current.includes(opcionId)
            ? current.filter((id) => id !== opcionId)
            : [...current, opcionId];
      const updated = { ...prev, [groupId]: next };
      onChange(updated, groups);
      return updated;
    });
  }

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((g) => (
        <div key={g.id} className="milk-section">
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text.secondary,
              marginBottom: 8,
            }}
          >
            {g.nombre}
            {g.requerido && (
              <span style={{ color: colors.text.muted, fontWeight: 400 }}>
                {" "}
                (obligatorio)
              </span>
            )}
          </p>
          {g.tipo === "select" ? (
            <div className="size-buttons">
              {g.opciones.map((o) => {
                const active = (selections[g.id] || []).includes(o.id);
                return (
                  <button
                    key={o.id}
                    className={`size-btn${active ? " size-btn--active" : ""}`}
                    style={{
                      background: active
                        ? colors.surface.base
                        : colors.surface.card,
                      color: colors.text.primary,
                      borderColor: active
                        ? colors.border.active
                        : "transparent",
                    }}
                    onClick={() => toggleOption(g.id, o.id, "select")}
                  >
                    {o.nombre}
                    {o.precio_adicional > 0
                      ? ` +$${o.precio_adicional}`
                      : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="milk-chips">
              {g.opciones.map((o) => {
                const active = (selections[g.id] || []).includes(o.id);
                return (
                  <button
                    key={o.id}
                    className="milk-chip"
                    style={{
                      background: active
                        ? colors.border.active
                        : colors.surface.card,
                      color: active
                        ? colors.text.onDark
                        : colors.text.primary,
                      borderColor: active
                        ? colors.border.active
                        : colors.border.default,
                    }}
                    onClick={() => toggleOption(g.id, o.id, "multi")}
                  >
                    {o.nombre}
                    {o.precio_adicional > 0
                      ? ` +$${o.precio_adicional}`
                      : ""}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

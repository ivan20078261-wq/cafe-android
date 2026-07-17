import { useEffect, useState } from "react";
import { colors } from "../../services/colors";
import "./tabcat.css";
import { supabase } from "../supabase";

export default function TabCat() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("categoria")
          .not("categoria", "is", null);

        if (error) {
          throw error;
        }

        const categoriasUnicas = [
          ...new Set(data.map((p) => p.categoria)),
        ].filter(Boolean);
        setCategorias(categoriasUnicas);
      } catch (err) {
        setError("Error al cargar categorías");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias();
  }, []); // El array vacío [] asegura que solo se ejecute una vez al montar el componente

  if (loading) {
    return (
      <div className="boxcat" style={{ backgroundColor: colors.surface.card }}>
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="boxcat" style={{ backgroundColor: colors.surface.card }}>
        {error}
      </div>
    );
  }

  return (
    <div className="boxcat">
      {categorias.map((categoria) => (
        <button
          key={categoria}
          className="categoria-button"
          style={{
            backgroundColor: colors.surface.card,
            width: "30%",
            borderRadius: 15,
          }}
        >
          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
        </button>
      ))}
    </div>
  );
}

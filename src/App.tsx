import { useState, useEffect } from "react";
import { useParams, Routes, Route } from "react-router-dom";
import { colors } from "../services/colors";
import { supabase } from "./supabase";
import "./App.css";
import MenuGrid from "./componentes/MenuGrid";
import ProductModal from "./componentes/ProductModal";
import ChatBarista from "./componentes/ChatBarista";
import type { OrderItem } from "./componentes/ProductModal";
import TabCat from "./componentes/tabCat";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
}

function VistaMenu() {
  const { comercio_slug, numero_mesa } = useParams();
  const mesa = numero_mesa ? parseInt(numero_mesa, 10) : null;
  const [productos, setProductos] = useState<MenuItem[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<MenuItem | null>(null);
  const [pedido, setPedido] = useState<OrderItem[]>([]);
  const [showPedido, setShowPedido] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [tituloComercio, setTituloComercio] = useState("Café Central");

  const totalPedido = pedido.reduce((s, i) => s + i.precio, 0);

  useEffect(() => {
    async function init() {
      if (!comercio_slug) return;

      const { data: comercio } = await supabase
        .from("comercios")
        .select("id, nombre")
        .eq("slug", comercio_slug)
        .single();

      if (comercio) {
        setTituloComercio(comercio.nombre || comercio_slug);

        const { data: items, error: errItems } = await supabase
          .from("productos")
          .select("*")
          .eq("comercio_id", comercio.id)
          .order("nombre", { ascending: true });

        if (errItems) {
          console.error("Error cargando productos:", errItems);
        } else if (items) {
          console.log("Productos cargados:", items.length);
          setProductos(
            items.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              descripcion: p.descripcion || "",
              precio: Number(p.precio_base),
              categoria: p.categoria,
              imagen: p.imagen || undefined,
            })),
          );
        }
      } else {
        console.error("Comercio no encontrado:", comercio_slug);
        setTituloComercio(
          comercio_slug === "cafe-central"
            ? "Café central"
            : comercio_slug === "panaderia-sol"
              ? "Panadería El Sol"
              : comercio_slug === "resto-verde"
                ? "Restó Verde"
                : "Comercio",
        );
      }
    }

    init();
  }, [comercio_slug]);

  useEffect(() => {
    const empresa =
      comercio_slug === "cafe-central"
        ? "Café Central"
        : comercio_slug === "panaderia-sol"
          ? "Panadería El Sol"
          : comercio_slug === "resto-verde"
            ? "Restó Verde"
            : comercio_slug || "Café Central";
    document.title = `Comandera Digital - ${empresa}`;
  }, [comercio_slug]);

  function handleAdd(item: OrderItem) {
    setPedido((prev) => [...prev, item]);
    setSelectedCafe(null);
    setShowPedido(true);
  }

  async function handleEnviar() {
    if (!mesa || pedido.length === 0 || enviando) return;

    setEnviando(true);
    try {
      const { data: comercio, error: errComercio } = await supabase
        .from("comercios")
        .select("id")
        .eq("slug", comercio_slug)
        .single();

      if (errComercio || !comercio)
        throw new Error("No se encontró el comercio");

      const { data: mesaData, error: errMesa } = await supabase
        .from("mesas")
        .select("id")
        .eq("comercio_id", comercio.id)
        .eq("numero_mesa", mesa)
        .single();

      if (errMesa || !mesaData)
        throw new Error(`No se encontró la mesa ${mesa}`);

      const items = pedido.map((item) => {
        const modificadores: string[] = [];
        if (item.modificadores) {
          for (const g of item.modificadores) {
            for (const o of g.opciones) {
              const txt =
                o.precio > 0 ? `${o.nombre} (+$${o.precio})` : o.nombre;
              modificadores.push(txt);
            }
          }
        }
        if (item.notas) modificadores.push(item.notas);

        const precioUnitario = Math.round(item.precio / item.cantidad);

        return {
          nombre: item.cafe.nombre,
          modificadores,
          precio: precioUnitario,
          cantidad: item.cantidad,
        };
      });

      const { error } = await supabase.from("pedidos").insert({
        comercio_id: comercio.id,
        mesa_id: mesaData.id,
        items,
        total: totalPedido,
        estado: "pendiente",
      });

      if (error) throw error;

      setPedido([]);
      setShowPedido(false);
      setEnviado(true);
      setTimeout(() => setEnviado(false), 2500);
    } catch (err) {
      console.error("Error al enviar pedido:", err);
      alert("Error al enviar el pedido. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.surface.base,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        width: "100%",
        padding: "0 8px",
        paddingBottom: pedido.length > 0 ? 80 : 0,
      }}
    >
      <div
        className="anim-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "8px",
          paddingTop: 16,
          paddingBottom: 14,
          borderBottom: `1px solid ${colors.border.soft}`,
        }}
      >
        <div>
          <h1
            style={{
              color: colors.text.primary,
              fontSize: "28px",
              letterSpacing: "0.02em",
              margin: 0,
            }}
            className="empresa"
          >
            {tituloComercio}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 6,
              paddingBottom: 6,
              borderBottom: `2px solid ${colors.brand.latte}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colors.brand.latte,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "13px",
                color: colors.brand.latte,
                letterSpacing: "0.12em",
                fontWeight: 500,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Especialidad & Origen
            </p>
          </div>
        </div>
        {mesa && (
          <div
            style={{
              background: colors.brand.espresso,
              borderRadius: "22px",
              padding: "4px 16px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(44,24,16,0.15)",
            }}
          >
            <span
              style={{
                color: colors.text.onDark,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              Mesa {mesa}
            </span>
          </div>
        )}
      </div>
      <div>
        <TabCat />
      </div>
      {productos.length > 0 ? (
        <MenuGrid items={productos} onSelectCafe={setSelectedCafe} />
      ) : (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: colors.text.muted,
            fontSize: 14,
          }}
        >
          Cargando menú...
        </div>
      )}
      {selectedCafe && (
        <ProductModal
          cafe={selectedCafe}
          onAdd={handleAdd}
          onClose={() => setSelectedCafe(null)}
        />
      )}

      {pedido.length > 0 && (
        <>
          {showPedido && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 900,
              }}
              onClick={() => setShowPedido(false)}
            >
              <div
                className="anim-fade-in-only"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  bottom: 72,
                  left: "50%",
                  transform: "translateX(-50%)",
                  maxWidth: 448,
                  width: "calc(100% - 32px)",
                  background: colors.surface.base,
                  borderRadius: 20,
                  padding: "20px 0 12px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  maxHeight: "50vh",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 11,
                }}
              >
                <div style={{ padding: "0 20px 12px" }}>
                  <h3
                    style={{
                      fontSize: 18,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Pedido
                  </h3>
                </div>
                <div style={{ overflowY: "auto", padding: "0 20px" }}>
                  {pedido.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom:
                          i < pedido.length - 1
                            ? `1px solid ${colors.border.default}`
                            : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: colors.text.primary,
                            margin: 0,
                          }}
                        >
                          {item.cafe.nombre}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: colors.text.muted,
                            margin: "2px 0 0",
                          }}
                        >
                          {item.modificadores
                            ? item.modificadores
                                .flatMap((g) => g.opciones.map((o) => o.nombre))
                                .join(" · ")
                            : ""}
                          {item.notas && ` · "${item.notas}"`}
                        </p>
                      </div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: colors.text.primary,
                          margin: "0 0 0 12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ${item.precio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            className="anim-fade-slide-up"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              transform: "translateX(-50%)",
              maxWidth: 480,
              width: "100%",
              background: colors.surface.base,
              borderTop: `1px solid ${colors.border.default}`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 1000,
              gap: 12,
              boxShadow: "0 -2px 12px rgba(44,24,16,0.06)",
            }}
          >
            <button
              onClick={() => setShowPedido((v) => !v)}
              style={{
                background: colors.surface.card,
                border: `1px solid ${colors.border.default}`,
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                color: colors.text.primary,
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.brand.espresso}, ${colors.brand.latte})`,
                  color: colors.text.onDark,
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {pedido.length}
              </span>
              Ver pedido
            </button>

            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              ${totalPedido}
            </p>

            <button
              onClick={handleEnviar}
              disabled={enviando || !mesa}
              style={{
                background: enviado
                  ? "#10B981"
                  : `linear-gradient(135deg, ${colors.brand.espresso}, ${colors.brand.latte})`,
                color: colors.text.onDark,
                border: "none",
                borderRadius: 12,
                padding: "10px 24px",
                fontSize: 15,
                fontWeight: 600,
                cursor: enviando || !mesa ? "not-allowed" : "pointer",
                opacity: !mesa ? 0.5 : 1,
                transition: "opacity 0.2s",
                letterSpacing: "0.03em",
                boxShadow: enviado ? "none" : "0 2px 8px rgba(44,24,16,0.2)",
              }}
            >
              {enviado ? "¡Enviado!" : enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </>
      )}

      <button
        className="anim-scale-in"
        onClick={() => setChatAbierto(true)}
        style={{
          position: "fixed",
          bottom: pedido.length > 0 ? 80 : 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.brand.espresso}, ${colors.brand.latte})`,
          color: colors.text.onDark,
          border: "none",
          boxShadow: "0 4px 16px rgba(44,24,16,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          zIndex: 1050,
          transition: "transform 0.15s",
        }}
      >
        ☕
      </button>

      {chatAbierto && (
        <ChatBarista items={productos} onClose={() => setChatAbierto(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/:comercio_slug/mesa/:numero_mesa" element={<VistaMenu />} />
    </Routes>
  );
}

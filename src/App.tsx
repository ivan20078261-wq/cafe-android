import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Routes, Route } from "react-router-dom";
import { colors } from "../services/colors";
import { supabase } from "./supabase";
import "./App.css";
import MenuGrid from "./componentes/MenuGrid";
import { categoriasDeItems, type MenuItem } from "./componentes/menu";
import ProductModal from "./componentes/ProductModal";
import TabCat from "./componentes/tabCat";
import ChatBarista from "./componentes/ChatBarista";
import type { OrderItem } from "./componentes/ProductModal";

const PASOS = [
  {
    estado: "pendiente",
    label: "Recibido",
    icono: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    estado: "preparando",
    label: "Preparando",
    icono: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
        <line x1="6" y1="17" x2="18" y2="17" />
      </svg>
    ),
  },
  {
    estado: "entregado",
    label: "Listo",
    icono: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
];

function nombreComercio(slug: string | undefined): string {
  if (!slug) return "Café Central";
  return (
    {
      "cafe-central": "Café Central",
      "panaderia-sol": "Panadería El Sol",
      "resto-verde": "Restó Verde",
    }[slug] ?? "Comercio"
  );
}

function VistaMenu() {
  const { comercio_slug, numero_mesa } = useParams();
  const mesa = numero_mesa ? parseInt(numero_mesa, 10) : null;
  const storageKey = `pedido_${comercio_slug}_${numero_mesa}`;
  const [productos, setProductos] = useState<MenuItem[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<MenuItem | null>(null);
  const [pedido, setPedido] = useState<OrderItem[]>([]);
  const [showPedido, setShowPedido] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [tituloComercio, setTituloComercio] = useState(
    nombreComercio(comercio_slug),
  );
  const [seccionActiva, setSeccionActiva] = useState<string | null>(
    "seccion-0",
  );
  const [pedidoId, setPedidoId] = useState<number | null>(() => {
    const prev = Number(localStorage.getItem(storageKey));
    return prev || null;
  });
  const [pedidoEstado, setPedidoEstado] = useState<string | null>(null);
  const [cargandoMenu, setCargandoMenu] = useState(true);
  const [errorMenu, setErrorMenu] = useState<string | null>(null);

  const categorias = useMemo(() => categoriasDeItems(productos), [productos]);
  const totalPedido = pedido.reduce((s, i) => s + i.precio, 0);
  const cantidadPedido = pedido.reduce((s, i) => s + i.cantidad, 0);

  const [comercioId, setComercioId] = useState<string | null>(null);
  const [llamadaMsg, setLlamadaMsg] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function init() {
      if (!comercio_slug) return;

      setCargandoMenu(true);
      setErrorMenu(null);

      const { data: comercio, error: errComercio } = await supabase
        .from("comercios")
        .select("id, nombre")
        .eq("slug", comercio_slug)
        .single();

      if (errComercio || !comercio) {
        if (!activo) return;
        setTituloComercio(nombreComercio(comercio_slug));
        setErrorMenu("No se encontró el comercio.");
        setCargandoMenu(false);
        return;
      }

      setTituloComercio(comercio.nombre || comercio_slug);

      const { data: items, error: errItems } = await supabase
        .from("productos")
        .select("*")
        .eq("comercio_id", comercio.id)
        .order("nombre", { ascending: true });

      if (!activo) return;

      if (errItems) {
        setErrorMenu("No se pudo cargar el menú. Intentá de nuevo.");
      } else if (items) {
        setProductos(
          items.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || "",
            precio: Number(p.precio_base),
            categoria: p.categoria,
            imagen_url: p.imagen_url
              ? `${p.imagen_url}?v=${Date.now()}`
              : undefined,
          })),
        );
      }
      setCargandoMenu(false);
      setComercioId(comercio.id);
    }

    init();
    return () => {
      activo = false;
    };
  }, [comercio_slug]);

  useEffect(() => {
    document.title = `Comandera Digital - ${nombreComercio(comercio_slug)}`;
  }, [comercio_slug]);

  useEffect(() => {
    if (!pedidoId) return;
    supabase
      .from("pedidos")
      .select("estado")
      .eq("id", pedidoId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.estado) setPedidoEstado(data.estado);
      });
  }, [pedidoId]);

  useEffect(() => {
    if (!pedidoId) return;
    const canal = supabase
      .channel(`pedido-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: `id=eq.${pedidoId}`,
        },
        (payload) => {
          setPedidoEstado(payload.new.estado);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [pedidoId]);

  const irASeccion = useCallback((seccionId: string) => {
    document.getElementById(seccionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const onSeccionVisible = useCallback((seccionId: string) => {
    setSeccionActiva(seccionId);
  }, []);

  function handleAdd(item: OrderItem) {
    setPedido((prev) => [...prev, item]);
    setSelectedCafe(null);
    setShowPedido(true);
  }

  function cambiarCantidad(index: number, delta: number) {
    setPedido((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nuevo = item.cantidad + delta;
        const cant = Math.max(1, Math.min(99, nuevo));
        const precioUnitario = item.precio / item.cantidad;
        return {
          ...item,
          cantidad: cant,
          precio: Math.round(precioUnitario * cant),
        };
      }),
    );
  }

  function quitarItem(index: number) {
    setPedido((prev) => prev.filter((_, i) => i !== index));
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

      const { data, error } = await supabase
        .from("pedidos")
        .insert({
          comercio_id: comercio.id,
          mesa_id: mesaData.id,
          items,
          total: totalPedido,
          estado: "pendiente",
        })
        .select("id")
        .single();

      if (error) throw error;

      setPedido([]);
      setShowPedido(false);
      setPedidoId(data.id);
      setPedidoEstado("pendiente");
      localStorage.setItem(storageKey, String(data.id));
      setEnviado(true);
      setTimeout(() => setEnviado(false), 2500);
    } catch (err) {
      console.error("Error al enviar pedido:", err);
      alert("Error al enviar el pedido. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciarMesa() {
    setPedidoId(null);
    setPedidoEstado(null);
    localStorage.removeItem(storageKey);
  }

  async function llamarMozo(tipo: "mozo" | "cuenta") {
    if (!comercioId || !mesa) return;
    const { error } = await supabase.from("llamadas_mozo").insert({
      comercio_id: comercioId,
      numero_mesa: mesa,
      tipo,
    });
    if (error) {
      console.error(error);
      setLlamadaMsg("No se pudo enviar. Intentá de nuevo.");
    } else {
      setLlamadaMsg(tipo === "mozo" ? "Avisamos al mozo." : "Pedimos la cuenta.");
    }
    setTimeout(() => setLlamadaMsg(null), 3000);
  }

  /* ── Pantalla de seguimiento (progress tracker) ─────────── */
  if (
    pedidoId &&
    pedidoEstado !== "entregado" &&
    pedidoEstado !== "cancelado"
  ) {
    const idxActual = Math.max(
      0,
      PASOS.findIndex((p) => p.estado === pedidoEstado),
    );
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.surface.base,
          maxWidth: 480,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            Mesa {numero_mesa} · Pedido #{pedidoId}
          </p>
          <div
            className="anim-scale-in"
            style={{ textAlign: "center", marginBottom: 36 }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: colors.brand.espresso,
                color: colors.text.onDark,
                fontSize: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: colors.shadow.md,
              }}
            >
              {PASOS[idxActual].icono}
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {PASOS[idxActual].label}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: colors.text.muted,
                margin: "8px 0 0",
                lineHeight: 1.5,
              }}
            >
              {pedidoEstado === "pendiente"
                ? "Recibimos tu pedido. Pronto empezamos a prepararlo."
                : "Estamos preparando tu pedido. Te avisamos cuando esté listo."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 40,
            }}
          >
            {PASOS.map((paso, i) => {
              const completado = i < idxActual;
              const activo = i === idxActual;
              return (
                <div
                  key={paso.estado}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {i > 0 && (
                      <div
                        style={{
                          height: 2,
                          flex: 1,
                          background:
                            i <= idxActual
                              ? colors.brand.espresso
                              : colors.border.default,
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: completado
                          ? colors.brand.espresso
                          : activo
                            ? colors.brand.espresso
                            : colors.surface.card,
                        color:
                          activo || completado
                            ? colors.text.onDark
                            : colors.text.muted,
                        border: activo
                          ? `2px solid ${colors.brand.latte}`
                          : completado
                            ? "none"
                            : `1px solid ${colors.border.strong}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                    >
                      {completado ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        paso.icono
                      )}
                    </div>
                    {i < PASOS.length - 1 && (
                      <div
                        style={{
                          height: 2,
                          flex: 1,
                          background:
                            i < idxActual
                              ? colors.brand.espresso
                              : colors.border.default,
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      fontWeight: activo || completado ? 700 : 500,
                      color:
                        activo || completado
                          ? colors.text.primary
                          : colors.text.muted,
                    }}
                  >
                    {paso.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (pedidoId && pedidoEstado === "cancelado") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.surface.base,
          maxWidth: 480,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="anim-scale-in" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            X
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Pedido cancelado
          </h1>
          <p
            style={{
              fontSize: 14,
              color: colors.text.muted,
              margin: "8px 0 0",
            }}
          >
            Tu pedido de la mesa {numero_mesa} fue cancelado.
          </p>
        </div>
      </div>
    );
  }

  /* ── Carta ─────────────────────────────────────────────── */
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
      }}
    >
      {/* Header compacto */}
      <div
        className="anim-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px 10px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            className="empresa"
            style={{ color: colors.text.primary, fontSize: 22, margin: 0 }}
          >
            {tituloComercio}
          </h1>
          <p
            style={{
              fontSize: 11,
              color: colors.text.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "2px 0 0",
            }}
          >
            Menú digital
          </p>
        </div>
        {mesa && (
          <div
            style={{
              background: colors.surface.card,
              borderRadius: 999,
              padding: "6px 14px",
              border: `1px solid ${colors.border.strong}`,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: colors.text.secondary,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Mesa {mesa}
            </span>
          </div>
        )}
      </div>

      {pedidoId && pedidoEstado === "entregado" && (
        <>
        <div
          className="anim-fade-slide-up"
          style={{
            marginInline: 16,
            borderRadius: 16,
            border: `1px solid #BFE9D0`,
            background: "#F0FDF4",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#166534",
                margin: 0,
              }}
            >
              Tu pedido fue entregado
            </p>
            <p style={{ fontSize: 12, color: "#15803D", margin: "2px 0 0" }}>
              ¡Que lo disfrutes! ¿Pedimos algo más?
            </p>
          </div>
          <button
            onClick={reiniciarMesa}
            style={{
              background: "#16A34A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Nuevo pedido
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={() => llamarMozo("mozo")}
            style={{
              flex: 1,
              padding: "12px 10px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #B45309, #92400E)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(180,83,9,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            Llamar al mozo
          </button>
          <button
            onClick={() => llamarMozo("cuenta")}
            style={{
              flex: 1,
              padding: "12px 10px",
              borderRadius: 14,
              border: "2px solid #16A34A",
              background: "#F0FDF4",
              color: "#166534",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(22,163,74,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            Pedir la cuenta
          </button>
        </div>
        {llamadaMsg && (
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#166534",
              textAlign: "center",
            }}
          >
            {llamadaMsg}
          </p>
        )}
        </>
      )}

      <TabCat
        categorias={categorias}
        activa={seccionActiva}
        onCambiar={irASeccion}
      />

      {errorMenu ? (
        <div style={{ padding: "80px 32px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: colors.surface.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15s1.5-2 4-2 4 2 4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: 17,
              color: colors.text.primary,
              margin: "0 0 6px",
            }}
          >
            No pudimos cargar el menú
          </h3>
          <p
            style={{
              fontSize: 14,
              color: colors.text.muted,
              margin: "0 auto 20px",
              maxWidth: 280,
            }}
          >
            {errorMenu}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: colors.brand.espresso,
              color: colors.text.onDark,
              border: "none",
              borderRadius: 12,
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      ) : cargandoMenu ? (
        <div style={{ padding: "16px 16px 0" }} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 72, height: 72, flexShrink: 0 }}
              />
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div
                  className="skeleton"
                  style={{ height: 16, width: "70%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "92%", marginTop: 10 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "48%", marginTop: 8 }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div style={{ padding: "80px 32px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: colors.surface.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: 17,
              color: colors.text.primary,
              margin: "0 0 6px",
            }}
          >
            Menú vacío
          </h3>
          <p
            style={{
              fontSize: 14,
              color: colors.text.muted,
              margin: 0,
              maxWidth: 260,
              marginInline: "auto",
            }}
          >
            Todavía no hay productos publicados. Preguntale a tu mozo.
          </p>
        </div>
      ) : (
        <MenuGrid
          items={productos}
          categorias={categorias}
          onSelectCafe={setSelectedCafe}
          onSeccionVisible={onSeccionVisible}
        />
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
                background: "rgba(28,25,23,0.35)",
                zIndex: 900,
              }}
              onClick={() => setShowPedido(false)}
            >
              <div
                className="anim-fade-in-only"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  bottom: 76,
                  left: "50%",
                  transform: "translateX(-50%)",
                  maxWidth: 448,
                  width: "calc(100% - 24px)",
                  background: colors.surface.base,
                  borderRadius: 20,
                  boxShadow: colors.shadow.lg,
                  maxHeight: "56vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 18px 12px",
                    borderBottom: `1px solid ${colors.border.soft}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Tu pedido
                  </h3>
                  <button
                    onClick={() => setShowPedido(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 14,
                      color: colors.text.muted,
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: 8,
                    }}
                  >
                    X
                  </button>
                </div>

                <div style={{ overflowY: "auto", padding: "6px 18px" }}>
                  {pedido.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 0",
                        borderBottom:
                          i < pedido.length - 1
                            ? `1px solid ${colors.border.soft}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: colors.surface.card,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.cafe.imagen_url ? (
                          <img
                            src={item.cafe.imagen_url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
                            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                          </svg>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: colors.text.primary,
                              margin: 0,
                            }}
                          >
                            {item.cafe.nombre}
                          </p>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: colors.text.primary,
                              margin: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ${item.precio}
                          </p>
                        </div>
                        {item.modificadores &&
                          item.modificadores.length > 0 && (
                            <p
                              style={{
                                fontSize: 11,
                                color: colors.text.muted,
                                margin: "2px 0 0",
                              }}
                            >
                              {item.modificadores
                                .flatMap((g) => g.opciones.map((o) => o.nombre))
                                .join(" · ")}
                            </p>
                          )}
                        {item.notas && (
                          <p
                            style={{
                              fontSize: 11,
                              color: colors.text.muted,
                              margin: 0,
                              fontStyle: "italic",
                            }}
                          >
                            "{item.notas}"
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <button
                          className="carrito-qty"
                          onClick={() => cambiarCantidad(i, -1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            border: `1px solid ${colors.border.strong}`,
                            background: colors.surface.card,
                            cursor: "pointer",
                            fontSize: 14,
                            color: colors.text.secondary,
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: colors.text.primary,
                            minWidth: 16,
                            textAlign: "center",
                          }}
                        >
                          {item.cantidad}
                        </span>
                        <button
                          className="carrito-qty"
                          onClick={() => cambiarCantidad(i, 1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            border: `1px solid ${colors.border.strong}`,
                            background: colors.surface.card,
                            cursor: "pointer",
                            fontSize: 14,
                            color: colors.text.secondary,
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => quitarItem(i)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            color: colors.text.muted,
                            padding: "4px",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Barra inferior */}
          <div
            className="anim-fade-slide-up"
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
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
              gap: 10,
              boxShadow: colors.shadow.bar,
            }}
          >
            <button
              onClick={() => setShowPedido((v) => !v)}
              style={{
                background: colors.surface.card,
                border: "none",
                borderRadius: 12,
                padding: "9px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: colors.text.primary,
              }}
            >
              <span
                key={cantidadPedido}
                className="anim-pop"
                style={{
                  background: colors.brand.espresso,
                  color: colors.text.onDark,
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {cantidadPedido}
              </span>
              Ver pedido
            </button>

            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              ${totalPedido}
            </p>

            <button
              onClick={handleEnviar}
              disabled={enviando}
              style={{
                background: enviado ? "#16A34A" : colors.brand.espresso,
                color: colors.text.onDark,
                border: "none",
                borderRadius: 12,
                padding: "11px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: enviando ? "not-allowed" : "pointer",
                opacity: enviando ? 0.7 : 1,
                transition: "background 0.2s",
                boxShadow: colors.shadow.sm,
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
          bottom: pedido.length > 0 ? 86 : 20,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: colors.brand.espresso,
          color: colors.text.onDark,
          border: "none",
          boxShadow: colors.shadow.fab,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          zIndex: 1050,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        </svg>
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

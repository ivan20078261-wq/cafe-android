import { supabase } from "../supabase";

const MISTRAL_FUNCTION = "ask-mistral";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke(MISTRAL_FUNCTION, {
      body: {
        model: options.model || "mistral-small-latest",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 300,
        requireAuth: false,
      },
    });

    if (error) {
      console.error("Error Mistral:", error);
      return null;
    }

    return data.content ?? null;
  } catch (err) {
    console.error("Error de red con Mistral:", err);
    return null;
  }
}

export async function chatBarista(
  mensajesHistorial: ChatMessage[],
  menuItems: {
    nombre: string;
    precio: number;
    descripcion: string;
    categoria?: string;
  }[],
): Promise<string | null> {
  const menu = menuItems
    .map(
      (m) =>
        `- ${m.nombre}: $${m.precio} — ${m.descripcion}${m.categoria ? ` [${m.categoria}]` : ""}`,
    )
    .join("\n");

  const mensajes: ChatMessage[] = [
    {
      role: "system",
      content: `Sos el barista virtual de Café Central. Recomendás cafés y comida del menú.
Menú disponible:
${menu}

Reglas:
- Solo recomendá cosas del menú
- Sé formal
- Si preguntan por precio, incluilo con el signo $ (ej: $75)
- Si no sabés algo, decí "consulte al personal"
- Usá español formal (de "usted")
- NO uses asteriscos ni markdown, escribí texto plano`,
    },
    ...mensajesHistorial,
  ];

  return await chat(mensajes, { temperature: 0.8, max_tokens: 150 });
}
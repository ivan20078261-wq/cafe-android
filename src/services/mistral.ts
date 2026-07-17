const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

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
  if (!MISTRAL_API_KEY) {
    console.error("Falta VITE_MISTRAL_API_KEY en .env");
    return null;
  }

  try {
    const res = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || "mistral-small-latest",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 300,
      }),
    });

    if (!res.ok) {
      console.error("Error Mistral:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.choices[0]?.message?.content?.trim() ?? null;
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

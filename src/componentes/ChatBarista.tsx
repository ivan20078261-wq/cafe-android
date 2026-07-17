import { useState, useRef, useEffect } from "react";
import { chatBarista } from "../services/mistral";
import "./ChatBarista.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function ChatBarista({ items, onClose }: { items: { nombre: string; precio: number; descripcion: string; categoria?: string }[]; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bienvenido. Soy el barista de Café Central. ¿En qué puedo ayudarlo?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const reply = await chatBarista(history, items);
    setLoading(false);

    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Disculpe, no pude procesar su consulta. ¿Podría repetirla?" },
      ]);
    }
  }

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">☕</div>
            <div>
              <h3 className="chat-title">Barista Virtual</h3>
              <p className="chat-subtitle">Siempre disponible para ayudarte</p>
            </div>
          </div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
              {msg.role === "assistant" ? parseMarkdown(msg.content) : msg.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble chat-bubble-bot chat-typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <input
            className="chat-input"
            placeholder="Escriba su consulta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

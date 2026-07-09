import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import { api } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Why are leaves turning yellow?",
  "Best crop for summer season?",
  "How to prevent fungus on tomatoes?",
  "What fertilizer for rice crop?",
  "How to improve crop yield?",
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Farmer Assistant. Ask me about crop diseases, fertilizers, best crops for your season, yield tips, and more!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chat(text.trim(), history);
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
      setSource(res.source === "groq" ? `Powered by Groq (${res.model})` : "Rule-based AI (add GROQ_API_KEY for enhanced responses)");
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the AI service. Please ensure the backend is running on port 5000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl py-10 px-4 h-[calc(100vh-80px)] flex flex-col">
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            <Sparkles className="h-4 w-4" />
            NLP · Transformers · Groq LLM
          </div>
          <h1 className="text-3xl font-bold">AI Farmer Assistant</h1>
          {source && <p className="text-xs text-muted-foreground mt-1">{source}</p>}
        </div>

        <Card className="flex-1 flex flex-col gradient-card border-0 shadow-medium overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-primary" : "bg-accent"
                  }`}>
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-background/80 border border-border/50 rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/50">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {messages.length <= 1 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-smooth"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-border/50 flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about crops, diseases, fertilizers..."
              className="h-12"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="gradient-primary text-white h-12 w-12 p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Chatbot;

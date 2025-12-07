"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    // Add user message to history
    const userMsg = { role: "user", content: query };
    setHistory(prev => [...prev, userMsg]);

    const currentQuery = query;
    setQuery(""); // Clear input immediately

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: currentQuery }),
      });

      const data = await res.json();

      if (data.success) {
        setHistory(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setHistory(prev => [...prev, { role: "assistant", content: "Error: " + data.error }]);
      }
    } catch (error) {
      setHistory(prev => [...prev, { role: "assistant", content: "Failed to send query." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-white border-2 border-black rounded-xl shadow-lg overflow-hidden flex flex-col h-[80vh]">

        {/* Header */}
        <div className="bg-white p-6 border-b-2 border-black">
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            🤖 AI Routing Agent
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Powered by Hugging Face & MCP (Weather + Database)
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {history.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">Ask me anything!</p>
              <p className="text-sm">"What is the weather in Tokyo?"</p>
              <p className="text-sm">"Show me all employees"</p>
            </div>
          )}

          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg border border-black ${msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                  }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-black p-4 rounded-lg border border-black animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t-2 border-black">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query..."
              className="flex-1 p-4 bg-white text-black rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

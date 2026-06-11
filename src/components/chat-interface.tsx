"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/actions/chat";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  lead_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

interface ChatInterfaceProps {
  leadId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherPartyName: string;
}

export function ChatInterface({ leadId, currentUserId, initialMessages, otherPartyName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to Realtime inserts for this lead
  useEffect(() => {
    const channel = supabase
      .channel(`chat_${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only append if it's not already in the state (optimistic UI could add it first)
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const tempBody = newMessage.trim();
    setNewMessage(""); // Clear input immediately for snappy UI
    setIsSending(true);

    try {
      const { data, error } = await sendMessage(leadId, tempBody);
      if (error) {
        toast.error(error);
        setNewMessage(tempBody);
      } else if (data) {
        // Optimistic update
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-lg font-semibold">Chat with {otherPartyName}</h2>
        <p className="text-xs text-slate-500">Messages are delivered by email when you&apos;re away.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_user_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-[#FF5F00] text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.body}
                </div>
                <span className="mt-1 text-[10px] text-slate-400">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#FF5F00] focus:outline-none focus:ring-1 focus:ring-[#FF5F00]"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5F00] text-white shadow-sm hover:bg-[#E05300] disabled:opacity-50 transition-colors"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 -ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

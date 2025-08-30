"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Loader } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { sendMessageToAI } from "@/lib/gemini";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface ChatPanelProps {
  addNode: (type: string) => void;
}

export const ChatPanel = ({ addNode }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! Describe your DAO, and I'll help you build it. Try 'Create a DAO with a token and voting'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendMessageToAI(input);
      const { response } = result;

      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === "addNode" && call.args.type) {
            addNode(call.args.type as string);
          }
        }
      }

      const aiText = response.text();
      const aiResponse: Message = { sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: Message = {
        sender: "ai",
        text: "Sorry, I encountered an error. Please check your API key and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "justify-end" : ""
              }`}
            >
              {msg.sender === "ai" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg px-3 py-2 max-w-xs ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              {msg.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your DAO..."
            className="pr-16"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
            disabled={isLoading}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
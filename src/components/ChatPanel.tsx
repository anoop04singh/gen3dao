"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface ChatPanelProps {
  addNode: (type: string) => void;
}

export const ChatPanel = ({ addNode }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hello! Describe your DAO, and I'll help you build it. Try 'Create a DAO with a token and voting'." },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    
    const addedNodes: string[] = [];
    if (input.toLowerCase().includes("token")) {
      addNode("token");
      addedNodes.push("Token");
    }
    if (input.toLowerCase().includes("voting")) {
      addNode("voting");
      addedNodes.push("Voting");
    }
    if (input.toLowerCase().includes("treasury")) {
      addNode("treasury");
      addedNodes.push("Treasury");
    }

    let aiText = "I'm not sure how to help with that. Try asking for a 'token', 'voting', or 'treasury' module.";
    if (addedNodes.length > 0) {
      aiText = `I've added a ${addedNodes.join(" and a ")} module to your canvas. You can click on them to configure their settings on the right.`;
    }

    const aiResponse: Message = { sender: "ai", text: aiText };

    setMessages((prev) => [...prev, userMessage, aiResponse]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
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
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-card"
      >
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your DAO..."
            className="pr-16"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIChat } from "@/hooks/useAIChat";

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = useAIChat();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="w-[340px] shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold">
                  DataDAO Support
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <ScrollArea className="h-[400px] px-4" ref={scrollRef}>
                <div className="space-y-4 pt-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[270px] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {message.sender === "ai" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {message.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              </ScrollArea>
              <CardFooter className="p-4 pt-2">
                <form
                  className="flex w-full items-center space-x-2"
                  onSubmit={handleSubmit}
                >
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
        {!isOpen && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

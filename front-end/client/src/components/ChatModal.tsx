import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@shared/schema";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userMessage },
      ];

      const response = await apiRequest("POST", "/api/chat", {
        messages: newMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 500,
      });

      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.choices && data.choices[0]?.message) {
        const message = data.choices[0].message;
        let content = message.content;
        
        if (!content && (message.tool_calls || message.function_call)) {
          const toolCall = message.tool_calls?.[0] || message.function_call;
          const functionName = toolCall.function?.name || toolCall.name || 'unknown';
          const functionArgs = toolCall.function?.arguments || toolCall.arguments || '{}';
          
          content = `I found relevant information about ${functionName}. Here's what I discovered:\n\n${functionArgs}`;
        }
        
        if (content) {
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: content,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      
      let errorMessage = "Unable to connect to the AI assistant. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("500")) {
          errorMessage = "The AI service is temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorMessage = "Authentication failed. Please contact support if this continues.";
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid request. Please try rephrasing your message.";
        }
      }
      
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: errorMessage,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setMessages([]);
      setInput("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col" data-testid="dialog-chat">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
          <DialogDescription>
            Ask questions about jobs or get career advice
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" data-testid="scroll-messages">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>Start a conversation with the AI assistant</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                data-testid={`message-${message.role}-${index}`}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            data-testid="input-chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            data-testid="button-send-message"
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

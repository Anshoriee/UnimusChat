import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Phone, Video, Info, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

interface ChatAreaProps {
  selectedChatId: string | null;
}

export function ChatArea({ selectedChatId }: ChatAreaProps) {
  const { user } = useAuth();
  const { socket, sendMessage } = useWebSocket();
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChatId, "messages"],
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      if (socket) {
        sendMessage({
          type: "message",
          data: messageData,
        });
      }
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chats", selectedChatId, "messages"] 
      });
    },
  });

  // WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "message":
          if (data.data.chatId === selectedChatId) {
            queryClient.invalidateQueries({ 
              queryKey: ["/api/chats", selectedChatId, "messages"] 
            });
          }
          break;
          
        case "typing":
          if (data.data.chatId === selectedChatId) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (data.data.isTyping) {
                newSet.add(data.data.userId);
              } else {
                newSet.delete(data.data.userId);
              }
              return newSet;
            });
          }
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, selectedChatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim(),
      messageType: "text",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (socket && selectedChatId) {
      sendMessage({
        type: "typing",
        data: {
          chatId: selectedChatId,
          isTyping: true,
        },
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendMessage({
          type: "typing",
          data: {
            chatId: selectedChatId,
            isTyping: false,
          },
        });
      }, 3000);
    }
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse-glow">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Pilih Chat</h3>
          <p className="text-muted-foreground text-lg">Pilih percakapan untuk mulai chat</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-gradient-to-br from-background to-background/95">
      {/* Chat Header - Modern Design */}
      <header className="bg-gradient-to-r from-secondary to-secondary/80 border-b border-secondary/20 p-5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12 border-4 border-white/30 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">C</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-white text-lg" data-testid="text-current-chat">
                Chat
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse-glow"></div>
                <p className="text-sm text-white/70">Online - Active now</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 transition-colors"
              data-testid="button-voice-call"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 transition-colors"
              data-testid="button-video-call"
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 transition-colors"
              data-testid="button-chat-info"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area - Custom Scrollbar */}
      <ScrollArea className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-primary/60" />
              </div>
              <p className="text-muted-foreground text-lg">Mulai percakapan</p>
              <p className="text-xs text-muted-foreground mt-1">Kirim pesan pertama untuk memulai</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex animate-fade-in",
                  message.senderId === user?.id ? "justify-end" : "justify-start"
                )}
                data-testid={`message-${message.id}`}
              >
                <div className={cn(
                  "max-w-xs lg:max-w-md",
                  message.senderId === user?.id ? "order-2" : "order-1"
                )}>
                  <div className={cn(
                    "rounded-2xl px-5 py-3 shadow-md transition-all hover:shadow-lg",
                    message.senderId === user?.id 
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-foreground rounded-bl-none dark:bg-secondary/30 dark:border-secondary/40"
                  )}>
                    <p className="text-sm leading-relaxed" data-testid={`text-message-content-${message.id}`}>
                      {message.content}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center mt-1.5 text-xs",
                    message.senderId === user?.id ? "justify-end text-muted-foreground" : "justify-start text-muted-foreground"
                  )}>
                    <span data-testid={`text-message-time-${message.id}`}>
                      {format(new Date(message.createdAt), "HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator - Modern */}
          {typingUsers.size > 0 && (
            <div className="flex items-center space-x-3 animate-fade-in" data-testid="typing-indicator">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">👤</AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 dark:bg-secondary/30 dark:border-secondary/40 shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input - Modern Footer */}
      <footer className="bg-gradient-to-t from-secondary/5 to-transparent border-t border-gray-200 dark:border-secondary/30 p-6">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 bg-white dark:bg-secondary/40 rounded-full border border-gray-200 dark:border-secondary/30 px-2 py-1 shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-transparent"
              data-testid="button-attach-file"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Ketik pesan..."
                data-testid="input-message"
                className="border-0 focus:ring-0 focus:outline-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-foreground dark:text-white"
              />
            </div>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-transparent"
              data-testid="button-emoji"
            >
              <Smile className="w-5 h-5" />
            </Button>
            
            <Button 
              type="submit" 
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              data-testid="button-send-message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}

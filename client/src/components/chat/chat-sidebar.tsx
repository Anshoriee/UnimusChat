import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Users, UserPlus, MessageCircle, Radio, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string | null;
  type: string;
  description: string | null;
  createdAt: string;
}

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"chats" | "broadcast" | "status">("chats");
  const [addContactPin, setAddContactPin] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    enabled: !!user,
  });

  const searchUserMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await fetch(`/api/users/search?pin=${pin}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    onSuccess: (foundUser) => {
      // Create direct chat with found user
      createChatMutation.mutate({
        name: foundUser.name,
        type: "direct",
        userPin: foundUser.pin,
      });
    },
  });

  const createChatMutation = useMutation({
    mutationFn: async ({ name, type, userPin }: { name: string; type: string; userPin?: string }) => {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = await res.json();
      
      if (userPin) {
        await fetch(`/api/chats/${chat.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userPin }),
        });
      }
      
      return chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setIsAddContactOpen(false);
      setAddContactPin("");
    },
  });

  const handleAddContact = () => {
    if (addContactPin.trim()) {
      searchUserMutation.mutate(addContactPin.trim());
    }
  };

  if (!user) return null;

  return (
    <aside className="w-96 bg-gradient-to-b from-secondary via-secondary/95 to-secondary border-r border-secondary/20 flex flex-col text-white shadow-xl">
      {/* User Profile Header with Gradient */}
      <div className="relative p-6 bg-gradient-to-br from-secondary to-secondary/80 rounded-b-2xl border-b border-secondary/30 animate-fade-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-14 h-14 border-4 border-white/30 shadow-lg">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg" data-testid="text-user-name">
                  {user.name}
                </h3>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse-glow"></div>
              </div>
              <p className="text-sm text-white/80 font-mono tracking-wider" data-testid="text-user-pin">
                {user.pin}
              </p>
              <p className="text-xs text-white/70" data-testid="text-user-role">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                  {user.role === "mahasiswa" ? "👨‍🎓 Mahasiswa" : user.role === "alumni" ? "🎓 Alumni" : "👨‍🏫 Dosen"}
                  {user.program && ` • ${user.program}`}
                </span>
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white backdrop-blur-sm transition-all duration-200"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <Users className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs with Modern Design */}
      <div className="border-b border-white/10 bg-secondary/50 backdrop-blur-sm">
        <nav className="flex gap-1 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-lg transition-all duration-200 text-white/70 hover:text-white",
              activeTab === "chats" && "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
            )}
            onClick={() => setActiveTab("chats")}
            data-testid="tab-chats"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-lg transition-all duration-200 text-white/70 hover:text-white",
              activeTab === "broadcast" && "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
            )}
            onClick={() => setActiveTab("broadcast")}
            data-testid="tab-broadcast"
          >
            <Radio className="w-4 h-4 mr-2" />
            Broadcast
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-lg transition-all duration-200 text-white/70 hover:text-white",
              activeTab === "status" && "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
            )}
            onClick={() => setActiveTab("status")}
            data-testid="tab-status"
          >
            <Clock className="w-4 h-4 mr-2" />
            Status
          </Button>
        </nav>
      </div>

      {/* Chat List - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60 p-4 text-center">
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm">Belum ada chat</p>
            <p className="text-xs mt-2 opacity-70">Tambahkan kontak untuk memulai</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "mx-3 my-2 p-4 rounded-xl cursor-pointer transition-all duration-200 animate-slide-in",
                "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
                selectedChatId === chat.id && "bg-gradient-to-r from-primary/40 to-primary/20 border-primary/50 ring-2 ring-primary/40 shadow-lg"
              )}
              onClick={() => onSelectChat(chat.id)}
              data-testid={`chat-item-${chat.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-all",
                  chat.type === "group" 
                    ? "bg-gradient-to-br from-accent to-primary" 
                    : "bg-gradient-to-br from-teal-400 to-blue-500"
                )}>
                  {chat.type === "group" ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate text-sm" data-testid={`text-chat-name-${chat.id}`}>
                    {chat.name || "Unnamed Chat"}
                  </h4>
                  <p className="text-xs text-white/60 truncate">
                    {chat.type === "group" ? "👥 Group Chat" : "💬 Direct Message"}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" title="Online"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Contact Button - Fixed at Bottom */}
      <div className="p-4 border-t border-white/10 bg-secondary/50 backdrop-blur-sm">
        <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
              data-testid="button-add-contact"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Kontak dengan PIN
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-secondary/95 to-secondary/85 border-secondary/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Tambah Kontak Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-pin" className="text-white/90">PIN Kontak</Label>
                <Input
                  id="contact-pin"
                  placeholder="Masukkan PIN (UNIMUS-XXXX)"
                  value={addContactPin}
                  onChange={(e) => setAddContactPin(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-primary focus:ring-primary"
                  data-testid="input-contact-pin"
                />
              </div>
              <Button 
                onClick={handleAddContact} 
                disabled={searchUserMutation.isPending || createChatMutation.isPending}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
                data-testid="button-search-user"
              >
                {searchUserMutation.isPending ? "Mencari..." : "Cari & Tambahkan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}

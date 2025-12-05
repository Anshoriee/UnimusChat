import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Plus, Clock, RefreshCw, Radio, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface StatusUpdate {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string;
  user?: {
    name: string;
    pin: string;
    avatar?: string;
  };
}

export function StatusPanel() {
  const { user } = useAuth();
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [statusContent, setStatusContent] = useState("");
  const [statusImage, setStatusImage] = useState<File | null>(null);

  const { data: statuses = [], refetch } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/status"],
    enabled: !!user,
  });

  const addStatusMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/status", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      setIsAddStatusOpen(false);
      setStatusContent("");
      setStatusImage(null);
    },
  });

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!statusContent.trim()) return;

    const formData = new FormData();
    formData.append("content", statusContent.trim());
    if (statusImage) {
      formData.append("image", statusImage);
    }

    addStatusMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatusImage(file);
    }
  };

  return (
    <aside className="w-96 bg-gradient-to-b from-background to-background/95 border-l border-gray-200 dark:border-secondary/30 flex flex-col shadow-lg">
      {/* Panel Header - Modern */}
      <div className="p-6 bg-gradient-to-r from-accent/80 to-accent/60 border-b border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Status & Info</h3>
              <p className="text-sm text-white/70">Expires in 24h</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-white hover:bg-white/20"
            data-testid="button-refresh-status"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-gradient-to-b from-background/50 to-transparent">
        <div className="p-6 space-y-6">
          {/* Add Status Button */}
          <Dialog open={isAddStatusOpen} onOpenChange={setIsAddStatusOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transition-all hover:shadow-xl"
                data-testid="button-add-status"
              >
                <Plus className="w-5 h-5 mr-2" />
                Posting Status Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-background to-background/95 border-gray-200 dark:border-secondary/30">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Bagikan Status</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStatus} className="space-y-5">
                <div>
                  <Label htmlFor="status-content" className="text-base font-semibold mb-3 block">Apa yang kamu lakukan?</Label>
                  <Textarea
                    id="status-content"
                    placeholder="Bagikan momen asik kamu... 📸✨"
                    value={statusContent}
                    onChange={(e) => setStatusContent(e.target.value)}
                    maxLength={280}
                    className="bg-white dark:bg-secondary/40 border-gray-200 dark:border-secondary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent min-h-24 resize-none"
                    data-testid="textarea-status-content"
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Status akan hilang otomatis dalam 24 jam</span>
                    <span className={statusContent.length > 260 ? "text-orange-500" : "text-muted-foreground"}>
                      {280 - statusContent.length} / 280
                    </span>
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="status-image" className="text-base font-semibold mb-3 block">Tambah Gambar</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer relative">
                    <Upload className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      {statusImage ? "✅ " + statusImage.name : "Pilih gambar atau drag-drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">Max 10 MB</p>
                    <Input
                      id="status-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-status-image"
                    />
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onClick={() => document.getElementById("status-image")?.click()}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!statusContent.trim() || addStatusMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white h-11 font-semibold transition-all"
                  data-testid="button-submit-status"
                >
                  {addStatusMutation.isPending ? "Posting..." : "Posting Status"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Status Updates List */}
          <div>
            <h4 className="font-bold text-foreground mb-4 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <span>Status Terkini</span>
            </h4>
            
            {statuses.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada status</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="group rounded-2xl bg-white dark:bg-secondary/30 border border-gray-200 dark:border-secondary/40 overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in"
                    data-testid={`status-item-${status.id}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <Avatar className="w-10 h-10 border-2 border-primary/30">
                          <AvatarImage src={status.user?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                            {status.user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {status.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(status.createdAt), { addSuffix: true, locale: id })}
                          </p>
                        </div>
                        <div className="px-2 py-1 bg-orange-100 dark:bg-orange-500/20 rounded-full">
                          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">24h</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {status.content}
                      </p>
                      
                      {status.imageUrl && (
                        <img
                          src={status.imageUrl}
                          alt="Status"
                          className="w-full rounded-lg mb-3 max-h-48 object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

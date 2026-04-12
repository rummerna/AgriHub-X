import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Send, Paperclip, Search, PenSquare, Loader2, Check, CheckCheck, Image as ImageIcon, X, MoreVertical, Archive, Trash2, Flag,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import Lightbox from "@/components/Lightbox";

interface Conversation {
  id: string;
  otherUserId: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  lastSenderId: string | null;
  unreadCount: number;
  isArchived: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string | null;
  type: string;
  imageUrls: string[];
  isRead: boolean;
  replyToId: string | null;
  createdAt: string;
}

const Messages = () => {
  const { supabaseUser, isLoggedIn } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSearch, setNewSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ user_id: string; full_name: string; avatar_url: string | null }[]>([]);
  const [attachImages, setAttachImages] = useState<string[]>([]);
  const [showAttach, setShowAttach] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const uid = supabaseUser?.id;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${uid},participant_2_id.eq.${uid}`)
      .order("last_message_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const otherIds = data.map((c: any) => c.participant_1_id === uid ? c.participant_2_id : c.participant_1_id);
    const { data: profiles } = await supabase.from("profiles_public" as any).select("user_id, full_name, avatar_url").in("user_id", otherIds);
    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    // Count unread
    const convIds = data.map((c: any) => c.id);
    const { data: unreadData } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .neq("sender_id", uid)
      .eq("is_read", false);

    const unreadMap = new Map<string, number>();
    unreadData?.forEach((m: any) => {
      unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
    });

    const convs: Conversation[] = data.map((c: any) => {
      const otherId = c.participant_1_id === uid ? c.participant_2_id : c.participant_1_id;
      const prof = profileMap.get(otherId);
      const isP1 = c.participant_1_id === uid;
      return {
        id: c.id,
        otherUserId: otherId,
        otherName: prof?.full_name || "Unknown",
        otherAvatar: prof?.avatar_url || null,
        lastMessage: c.last_message_text,
        lastMessageAt: c.last_message_at,
        lastSenderId: c.last_sender_id,
        unreadCount: unreadMap.get(c.id) || 0,
        isArchived: isP1 ? c.is_archived_by_1 : c.is_archived_by_2,
      };
    });

    setConversations(convs);
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Handle navigation state to open a specific conversation
  useEffect(() => {
    const state = location.state as { openConversation?: string } | null;
    if (state?.openConversation && conversations.length > 0 && !activeConv) {
      const conv = conversations.find((c) => c.id === state.openConversation);
      if (conv) openConv(conv);
    }
  }, [location.state, conversations]);

  // Real-time subscriptions
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel("messaging")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (activeConv) fetchMessages(activeConv.id);
        fetchConversations();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [uid, activeConv, fetchConversations]);

  // Fetch messages for conversation
  const fetchMessages = async (convId: string) => {
    setMsgLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.message_text,
          type: m.message_type,
          imageUrls: m.image_urls || [],
          isRead: m.is_read,
          replyToId: m.reply_to_id,
          createdAt: m.created_at,
        }))
      );

      // Mark unread as read
      const unreadIds = data.filter((m: any) => !m.is_read && m.sender_id !== uid).map((m: any) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
      }
    }
    setMsgLoading(false);
  };

  // Open conversation
  const openConv = (conv: Conversation) => {
    setActiveConv(conv);
    setShowNew(false);
    fetchMessages(conv.id);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!uid || !activeConv || (!text.trim() && attachImages.length === 0)) return;
    setSending(true);

    const msgType = attachImages.length > 0 ? "image" : "text";

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: uid,
      message_text: text.trim() || null,
      message_type: msgType,
      image_urls: attachImages.length > 0 ? attachImages : [],
    });

    if (!error) {
      await supabase.from("conversations").update({
        last_message_text: text.trim() || (attachImages.length > 0 ? "📷 Image" : ""),
        last_message_at: new Date().toISOString(),
        last_sender_id: uid,
      }).eq("id", activeConv.id);

      setText("");
      setAttachImages([]);
      setShowAttach(false);
    } else {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    }
    setSending(false);
  };

  // Search users for new conversation
  const searchUsers = async (q: string) => {
    setNewSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .ilike("full_name", `%${q}%`)
      .neq("user_id", uid!)
      .limit(10);
    setSearchResults(data || []);
  };

  // Start new conversation
  const startConversation = async (otherUserId: string) => {
    if (!uid) return;

    // Check if conversation exists
    const existing = conversations.find((c) => c.otherUserId === otherUserId);
    if (existing) { openConv(existing); return; }

    // Create - ensure participant_1 < participant_2 for uniqueness
    const [p1, p2] = uid < otherUserId ? [uid, otherUserId] : [otherUserId, uid];

    const { data, error } = await supabase
      .from("conversations")
      .insert({ participant_1_id: p1, participant_2_id: p2 })
      .select()
      .single();

    if (error) {
      // May already exist
      const { data: existing2 } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant_1_id.eq.${p1},participant_2_id.eq.${p2}),and(participant_1_id.eq.${p2},participant_2_id.eq.${p1})`)
        .single();
      if (existing2) {
        await fetchConversations();
        const conv = conversations.find((c) => c.otherUserId === otherUserId);
        if (conv) openConv(conv);
      }
      return;
    }

    await fetchConversations();
    setShowNew(false);
    // Find the new conv
    const prof = searchResults.find((p) => p.user_id === otherUserId);
    if (data) {
      openConv({
        id: data.id,
        otherUserId,
        otherName: prof?.full_name || "Unknown",
        otherAvatar: prof?.avatar_url || null,
        lastMessage: null,
        lastMessageAt: data.created_at,
        lastSenderId: null,
        unreadCount: 0,
        isArchived: false,
      });
    }
  };

  // Archive conversation
  const archiveConv = async (conv: Conversation) => {
    const isP1 = conv.otherUserId !== uid;
    const update = isP1
      ? { is_archived_by_1: !conv.isArchived }
      : { is_archived_by_2: !conv.isArchived };
    // Determine which participant we are
    const { data: convData } = await supabase.from("conversations").select("participant_1_id").eq("id", conv.id).single();
    if (convData) {
      const field = convData.participant_1_id === uid ? "is_archived_by_1" : "is_archived_by_2";
      await supabase.from("conversations").update({ [field]: !conv.isArchived }).eq("id", conv.id);
    }
    fetchConversations();
    if (activeConv?.id === conv.id) setActiveConv(null);
  };

  // Delete conversation
  const deleteConv = async (conv: Conversation) => {
    await supabase.from("conversations").delete().eq("id", conv.id);
    fetchConversations();
    if (activeConv?.id === conv.id) { setActiveConv(null); setMessages([]); }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConvs = conversations.filter((c) => {
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (filter === "archived" && !c.isArchived) return false;
    if (filter === "all" && c.isArchived) return false;
    if (search && !c.otherName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-display font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Please sign in to access your messages.</p>
      </div>
    );
  }

  // CHAT VIEW
  if (activeConv) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col" style={{ height: "calc(100vh - 130px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => { setActiveConv(null); setMessages([]); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {activeConv.otherAvatar ? (
            <img src={activeConv.otherAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
              {activeConv.otherName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm">{activeConv.otherName}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => archiveConv(activeConv)}>
                <Archive className="w-4 h-4 mr-2" /> {activeConv.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteConv(activeConv)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {msgLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === uid;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                      isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {/* Images */}
                    {msg.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {msg.imageUrls.map((url, idx) => (
                          <button
                            key={url}
                            onClick={() => setLightbox({ images: msg.imageUrls, idx })}
                            className="rounded-lg overflow-hidden"
                          >
                            <img src={url} alt="" className="max-w-[200px] max-h-[150px] object-cover rounded-lg" />
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                      <span className={`text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMine && (
                        msg.isRead
                          ? <CheckCheck className="w-3 h-3 text-blue-300" />
                          : <Check className="w-3 h-3 text-primary-foreground/60" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attachment preview */}
        {showAttach && (
          <div className="border-t border-border pt-2 pb-1">
            <ImageUpload
              bucket="chat-images"
              folder={uid || "unknown"}
              maxImages={5}
              images={attachImages}
              onChange={setAttachImages}
            />
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttach(!showAttach)}
            className={showAttach ? "text-primary" : ""}
          >
            {showAttach ? <X className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
          </Button>
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || (!text.trim() && attachImages.length === 0)}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {lightbox && (
          <Lightbox
            images={lightbox.images}
            initialIndex={lightbox.idx}
            open
            onClose={() => setLightbox(null)}
          />
        )}
      </div>
    );
  }

  // NEW CONVERSATION VIEW
  if (showNew) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setShowNew(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-bold">New Message</h1>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={newSearch}
            onChange={(e) => searchUsers(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-1">
          {searchResults.map((user) => (
            <button
              key={user.user_id}
              onClick={() => startConversation(user.user_id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {user.full_name?.charAt(0) || "?"}
                </div>
              )}
              <span className="font-medium text-sm">{user.full_name}</span>
            </button>
          ))}
          {newSearch.length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No users found</p>
          )}
        </div>
      </div>
    );
  }

  // INBOX VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <Button size="icon" variant="outline" onClick={() => setShowNew(true)}>
          <PenSquare className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "unread", "archived"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredConvs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No conversations</p>
          <p className="text-sm">Start a new message to connect with other users</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredConvs.map((conv) => (
            <div
              key={conv.id}
              onClick={() => openConv(conv)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
            >
              {conv.otherAvatar ? (
                <img src={conv.otherAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {conv.otherName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{conv.otherName}</p>
                  <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {conv.lastSenderId === uid && <span className="text-muted-foreground">You: </span>}
                    {conv.lastMessage || "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Context actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => archiveConv(conv)}>
                    <Archive className="w-4 h-4 mr-2" /> {conv.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteConv(conv)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;

"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Notification } from "@/lib/types";
import { HeroSignalVisual } from "@/components/branding/hero-signal-visual";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setNotifications((data as Notification[]) ?? []);
      setLoading(false);
    }
    load();

    // Realtime
    const channel = supabase
      .channel("notifications-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unread.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-3">
            <div>
              <p className="hud-chip">Notification Center</p>
              <h1 className="page-title mt-2">Notifications</h1>
            </div>

            {unreadCount > 0 ? (
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                <CheckCheck size={14} /> Tout marquer comme lu
              </Button>
            ) : null}
          </div>

          <HeroSignalVisual
            tag="Live feed"
            title="Alertes en temps reel"
            icon={Bell}
            accent="violet"
            chips={[`${unreadCount} non lues`, `${notifications.length} total`]}
          />
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="game-panel rounded-[1.35rem] border border-[#d9cfbd] py-16 text-center">
          <Bell size={48} className="mx-auto mb-4 text-[#8c8576]" />
          <p className="text-sm text-[#676258]">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`game-panel rounded-[1.05rem] border p-4 transition ${
                n.read ? "border-[#ded6c7]" : "border-[#cbb992] bg-[linear-gradient(150deg,#fffaf0,#f8f1de)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 rounded-[0.8rem] border p-2 ${n.read ? "border-[#d8d1c4] bg-[#f5f1e8] text-[#8a8375]" : "border-[#cbb992] bg-[#f5e5bf] text-[#6f5622]"}`}>
                  <Bell size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#2b303a]">{n.title}</p>
                  <p className="text-sm text-[#676258]">{n.body}</p>
                  <p className="mt-1 text-xs text-[#8b8374]">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="rounded p-1.5 text-[#8a8375] hover:text-[#6f5622]" title="Marquer comme lu">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="rounded p-1.5 text-[#8a8375] hover:text-red-600" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

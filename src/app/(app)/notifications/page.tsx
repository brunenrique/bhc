
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bell, CheckCheck, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import NotificationItem from "@/components/notifications/notification-item";
import { useNotifications } from "@/hooks/useNotifications";
import { registerFcmToken } from "@/services/notificationService";
import { auth } from "@/lib/firebase"; // Caminho corrigido aqui

export default function NotificationsPage() {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (Notification.permission === 'granted' && auth.currentUser?.uid) {
      registerFcmToken(auth.currentUser.uid);
    } else if (Notification.permission === 'default' && auth.currentUser?.uid) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          registerFcmToken(auth.currentUser!.uid);
        }
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Bell className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
              {unreadCount} Nova(s)
            </span>
          )}
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <CheckCheck className="mr-2 h-4 w-4" /> Marcar Todas como Lidas
            </Button>
            <Button variant="outline" asChild>
                <Link href="/settings?tab=notifications">
                    <span className="inline-flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Config. de Notificações
                    </span>
                </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-sm border-t border-zinc-200 mt-4 pt-4">
        <CardHeader>
          <CardTitle className="font-headline">Notificações Recentes</CardTitle>
          <CardDescription>Mantenha-se atualizado com alertas e mensagens importantes.</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3 divide-y divide-zinc-200">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhuma notificação</h3>
              <p className="mt-1 text-sm text-muted-foreground">Você está em dia!</p>
            </div>
          )}
        </CardContent>
        {notifications.length > 0 && (
            <CardFooter className="border-t pt-4 flex justify-end">
                <Button variant="destructive" className="bg-destructive/90 hover:bg-destructive text-destructive-foreground">
                    <Trash2 className="mr-2 h-4 w-4" /> Limpar Notificações Lidas
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

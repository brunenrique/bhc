
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bell, CheckCheck, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import NotificationItem from "@/components/notifications/notification-item";
import { useNotifications } from "@/hooks/useNotifications";
import { registerFcmToken } from "@/services/notificationService";
import useAuth from "@/hooks/use-auth";
import { APP_ROUTES } from "@/lib/routes";

export default function NotificationsPage() {
  const { notifications } = useNotifications();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (Notification.permission === 'granted' && user.uid) {
      registerFcmToken(user.uid);
    } else if (Notification.permission === 'default' && user.uid) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          registerFcmToken(user.uid!);
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
                <Link href={`${APP_ROUTES.settings}?tab=notifications`}>
                    <Settings className="mr-2 h-4 w-4" /> Config. de Notificações
                </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Notificações Recentes</CardTitle>
          <CardDescription>Mantenha-se atualizado com alertas e mensagens importantes.</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
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

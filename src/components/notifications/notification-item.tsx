
"use client";

import React, { useEffect, useState } from 'react'; // Import React
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, X, ExternalLink, AlertTriangle, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface Notification {
  id: string;
  type: "task_assigned" | "appointment_reminder" | "assessment_completed" | "system_update" | "new_patient_waiting" | "generic";
  message: string;
  date: string; // ISO date string
  read: boolean;
  link?: string;
}

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItemComponent({ notification }: NotificationItemProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (notification.date) {
      setTimeAgo(formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: ptBR }));
    } else {
      setTimeAgo('Data inválida');
    }
  }, [notification.date]);


  const getIcon = () => {
    switch (notification.type) {
      case "task_assigned": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "appointment_reminder": return <Bell className="h-5 w-5 text-blue-500" />;
      case "assessment_completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "system_update": return <Info className="h-5 w-5 text-purple-500" />;
      case "new_patient_waiting": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card
      className={cn(
        "shadow-sm transition-all duration-200 ease-in-out",
      notification.read ? "bg-card opacity-70 hover:opacity-100" : "bg-secondary/50 hover:bg-secondary/70",
      "border-l-4",
      notification.read ? "border-transparent" : 
        notification.type === "task_assigned" || notification.type === "new_patient_waiting" ? "border-yellow-500" :
        notification.type === "appointment_reminder" ? "border-blue-500" :
        notification.type === "assessment_completed" ? "border-green-500" :
        "border-primary"
    )}
      role="alert"
      tabIndex={0}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
          <div className="flex-1">
            <p className={cn("text-sm", notification.read ? "text-muted-foreground" : "font-medium text-foreground")}>
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo || 'Calculando...'}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1.5">
            {notification.link && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 px-2 text-accent"
                aria-label="Ver detalhes"
              >
                <Link href={notification.link}>
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver
                  </span>
                </Link>
              </Button>
            )}
            {!notification.read && (
              <Button variant="outline" size="sm" className="h-7 px-2" aria-label="Marcar como lida">
                <span>
                  <Check className="mr-1 h-3.5 w-3.5" /> Marcar como lida
                </span>
              </Button>
            )}
             {notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                aria-label="Dispensar notificação"
              >
                <span>
                  <X className="mr-1 h-3.5 w-3.5" /> Dispensar
                </span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const NotificationItem = React.memo(NotificationItemComponent);
export default NotificationItem;

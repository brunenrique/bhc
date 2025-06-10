
"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import dynamic from 'next/dynamic';
import { useAppStore } from "@/store/appStore";

const ChatWindow = dynamic(() => import('./ChatWindow').then(mod => mod.ChatWindow), { ssr: false });

export function FloatingChatButton() {
  const { isChatWindowOpen, toggleChatWindow, activeChatId } = useAppStore();
  
  const currentChatId = "geral"; 
  const chatName = "Chat Interno Geral";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all"
          onClick={() => {
            toggleChatWindow();
          }}
          aria-label="Abrir chat interno"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </div>
      {isChatWindowOpen && activeChatId === currentChatId && (
        <ChatWindow 
          chatId={currentChatId} 
          chatName={chatName}
        />
      )}
    </>
  );
}

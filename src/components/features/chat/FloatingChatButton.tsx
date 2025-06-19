"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import dynamic from 'next/dynamic';
import { useAppStore } from "@/store/appStore";

const ChatWindow = dynamic(() => import('./ChatWindow').then(mod => mod.ChatWindow), { ssr: false });

export function FloatingChatButton() {
  const { isChatWindowOpen, toggleChatWindow, activeChatId } = useAppStore();
  
  const currentChatId = "geral"; // For this example, we always use 'geral'
  const chatName = "Chat Interno Geral";

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all"
        onClick={() => {
          // If toggling to open, ensure 'geral' is the active chat
          // If toggling to close, the store will handle activeChatId
          toggleChatWindow();
        }}
        aria-label="Abrir chat interno"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>
      {/* ChatWindow visibility is now controlled by isChatWindowOpen from the store */}
      {/* We render ChatWindow if any chat is supposed to be open, 
          and it internally checks if its specific chatId matches activeChatId */}
      {isChatWindowOpen && activeChatId === currentChatId && (
        <ChatWindow 
          chatId={currentChatId} 
          chatName={chatName}
        />
      )}
    </>
  );
}
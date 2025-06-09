"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import dynamic from 'next/dynamic';

// Dynamically import ChatWindow to avoid SSR issues if it uses client-only hooks heavily
const ChatWindow = dynamic(() => import('./ChatWindow').then(mod => mod.ChatWindow), { ssr: false });


export function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // In a real app, this would interact with a Zustand store
  // to manage chat state, open windows, etc.

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all"
          onClick={() => setIsChatOpen(prev => !prev)}
          aria-label="Abrir chat interno"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </div>
      {isChatOpen && (
        <ChatWindow 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          // This would be a specific chat or user ID
          chatId="geral" 
          chatName="Chat Interno Geral"
        />
      )}
    </>
  );
}

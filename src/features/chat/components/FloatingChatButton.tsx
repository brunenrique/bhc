
"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Users, MessageCircle } from "lucide-react";
import dynamic from 'next/dynamic';
import { useAppStore } from "@/store/appStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, Chat } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const ChatWindow = dynamic(() => import('./ChatWindow').then(mod => mod.ChatWindow), { ssr: false });

export function FloatingChatButton() {
  const { 
    isChatSelectorOpen, 
    toggleChatSelector, 
    openChat, 
    activeChat,
    mockUsersForChat 
  } = useAppStore();
  const { user: currentUser } = useAuth();

  const handleOpenChat = (chat: Chat) => {
    openChat(chat);
  };

  // Filter out the current user from the list of users to chat with
  const otherUsers = mockUsersForChat.filter(u => u.id !== currentUser?.id);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }

  return (
    <>
      <Popover open={isChatSelectorOpen} onOpenChange={(isOpen) => {
        // This ensures that if Popover is closed by clicking outside,
        // the store state is updated. toggleChatSelector handles activeChat closing.
        if (!isOpen && isChatSelectorOpen) {
            useAppStore.setState({ isChatSelectorOpen: false });
        }
      }}>
        <PopoverTrigger asChild>
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all"
              onClick={toggleChatSelector}
              aria-label="Abrir seletor de chat"
            >
              <MessageSquare className="h-7 w-7" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2 mb-2 mr-1" side="top" align="end">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-1.5 text-sm h-auto"
              onClick={() => handleOpenChat({ id: 'general', name: 'Chat Geral', type: 'general' })}
            >
              <Users className="mr-2 h-4 w-4" />
              Chat Geral
            </Button>
            {otherUsers.map((chatUser) => (
              <Button 
                key={chatUser.id} 
                variant="ghost" 
                className="w-full justify-start px-2 py-1.5 text-sm h-auto"
                onClick={() => {
                  // Create a consistent private chat ID
                  const participants = [currentUser?.id || 'anon', chatUser.id].sort();
                  const privateChatId = `private_${participants.join('_')}`;
                  handleOpenChat({ 
                    id: privateChatId, 
                    name: `Chat com ${chatUser.name}`, 
                    type: 'private', 
                    participants: [currentUser?.id || 'anon', chatUser.id],
                    avatarUrl: chatUser.avatarUrl 
                  })
                }}
              >
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage src={chatUser.avatarUrl} alt={chatUser.name} data-ai-hint="person avatar" />
                  <AvatarFallback className="text-xs">{getInitials(chatUser.name)}</AvatarFallback>
                </Avatar>
                {chatUser.name}
              </Button>
            ))}
             {otherUsers.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground text-center">Nenhum outro usuário disponível para chat privado (mock).</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {activeChat && (
        <ChatWindow />
      )}
    </>
  );
}

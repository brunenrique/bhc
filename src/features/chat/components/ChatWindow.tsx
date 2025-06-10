
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, UserCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from '@/store/appStore';
import type { ChatMessage } from '@/types';
import { useAuth } from "@/hooks/useAuth";


export function ChatWindow() {
  const { 
    activeChat,
    closeActiveChat, 
    messagesByChatId, 
    addMessage,
  } = useAppStore();
  
  const { user: currentUser } = useAuth();
  const messages = activeChat ? messagesByChatId[activeChat.id] || [] : [];
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !activeChat) return;
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser?.name || "Eu", 
      avatar: currentUser?.avatarUrl,
      text: newMessage,
      timestamp: new Date(),
    };
    addMessage(activeChat.id, message);
    setNewMessage("");

    // Simulate a bot reply for demo purposes
    if (activeChat.id !== 'general' && activeChat.type === 'private') {
        setTimeout(() => {
            const recipientName = activeChat.name.replace('Chat com ', '');
            addMessage(activeChat.id, {
                id: (Date.now()+1).toString(),
                sender: recipientName, // Simulate reply from the other user
                avatar: activeChat.avatarUrl,
                text: `Recebi sua mensagem! (Resposta simulada de ${recipientName})`,
                timestamp: new Date()
            });
        }, 1200);
    } else if (activeChat.id === 'general') {
         setTimeout(() => {
            addMessage(activeChat.id, {
                id: (Date.now()+1).toString(),
                sender: 'Bot PsiGuard',
                avatar: 'https://placehold.co/40x40.png?text=BG',
                text: 'Sua mensagem no chat geral foi recebida! (Esta é uma resposta automática de demonstração)',
                timestamp: new Date()
            });
        }, 1000);
    }


  }, [newMessage, activeChat, addMessage, currentUser]);
  
  if (!activeChat) return null;

  return (
    <Card className="fixed bottom-20 right-6 w-80 h-[450px] shadow-xl z-50 flex flex-col bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {activeChat.type === 'private' && activeChat.avatarUrl && (
            <Avatar className="h-7 w-7">
              <AvatarImage src={activeChat.avatarUrl} alt={activeChat.name} data-ai-hint="person avatar" />
              <AvatarFallback>{getInitials(activeChat.name.replace('Chat com ', ''))}</AvatarFallback>
            </Avatar>
          )}
           {activeChat.type === 'general' && (
            <Users className="h-5 w-5 text-primary" />
          )}
          <CardTitle className="text-base font-headline">{activeChat.name}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={closeActiveChat} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === (currentUser?.name || "Eu") ? 'justify-end' : ''}`}>
                {msg.sender !== (currentUser?.name || "Eu") && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={msg.avatar} alt={msg.sender} data-ai-hint="person avatar" />
                    <AvatarFallback className="text-xs">{getInitials(msg.sender) || <UserCircle />}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.sender === (currentUser?.name || "Eu") ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === (currentUser?.name || "Eu") ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === (currentUser?.name || "Eu") && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={msg.avatar} alt={msg.sender} data-ai-hint="person avatar" />
                    <AvatarFallback className="text-xs">{getInitials(msg.sender) || <UserCircle />}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input 
            type="text" 
            placeholder="Digite uma mensagem..." 
            className="flex-1 h-9" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="h-9 w-9">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

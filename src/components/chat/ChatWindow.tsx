"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: string; // 'me' or user ID/name
  avatar?: string;
  text: string;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatName: string;
}

export function ChatWindow({ isOpen, onClose, chatId, chatName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock messages - in a real app, these would come from a store/backend
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { id: '1', sender: 'Dra. Aline', text: 'Olá! Alguém viu o prontuário do paciente X?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { id: '2', sender: 'me', text: 'Acho que está com a secretária.', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
        { id: '3', sender: 'Secretaria', text: 'Confirmado, está aqui. Precisa de algo?', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
      ]);
    }
  }, [isOpen, chatId]);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const message: Message = {
      id: Date.now().toString(),
      sender: "me", // Assuming 'me' is the current user
      text: newMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate a reply for demo
    setTimeout(() => {
       setMessages(prev => [...prev, {
         id: (Date.now()+1).toString(),
         sender: 'Bot PsiGuard',
         text: 'Sua mensagem foi recebida! (Esta é uma resposta automática de demonstração)',
         timestamp: new Date()
       }]);
    }, 1000);
  };
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-20 right-6 w-80 h-[450px] shadow-xl z-50 flex flex-col bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <CardTitle className="text-base font-headline">{chatName}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                {msg.sender !== 'me' && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={msg.avatar} alt={msg.sender} data-ai-hint="person avatar" />
                    <AvatarFallback>{getInitials(msg.sender) || <UserCircle />}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'me' && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={msg.avatar} alt={msg.sender} data-ai-hint="person avatar" />
                    <AvatarFallback>{getInitials(msg.sender) || <UserCircle />}</AvatarFallback>
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

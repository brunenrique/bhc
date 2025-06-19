
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, X, Edit2, Brain, Workflow, ListTree, Wand2 } from 'lucide-react'; // Changed BarChartSteps to Workflow
import { useClinicalStore } from '@/stores/clinicalStore';
import type { ClinicalTab, ClinicalTabType } from '@/types/clinicalTypes';
import { cn } from '@/shared/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getTabIcon = (type: ClinicalTabType) => {
  switch (type) {
    case 'formulation': return <Brain className="h-3.5 w-3.5 mr-1.5" />;
    case 'chain': return <Workflow className="h-3.5 w-3.5 mr-1.5" />; // Changed BarChartSteps to Workflow
    case 'matrix': return <ListTree className="h-3.5 w-3.5 mr-1.5" />; 
    case 'hexaflex': return <Wand2 className="h-3.5 w-3.5 mr-1.5" />; 
    default: return <Brain className="h-3.5 w-3.5 mr-1.5" />;
  }
};

export default function TabsBar() {
  const { tabs, activeTabId, setActiveTab, addTab, removeTab, renameTab } = useClinicalStore();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTab = (type: ClinicalTabType) => {
    let titlePrefix = "";
    switch (type) {
        case 'formulation': titlePrefix = "Formulação"; break;
        case 'chain': titlePrefix = "Análise C."; break;
        case 'matrix': titlePrefix = "Matriz"; break;
        case 'hexaflex': titlePrefix = "Hexaflex"; break;
        default: titlePrefix = "Nova Aba";
    }
    const newTabId = addTab(type, `${titlePrefix} (Nova)`);
    // setActiveTab(newTabId); // addTab now sets active
  };

  const handleRenameStart = (tab: ClinicalTab) => {
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const handleRenameConfirm = () => {
    if (editingTabId && editingTitle.trim()) {
      renameTab(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
    setEditingTitle('');
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleRenameConfirm();
    } else if (event.key === 'Escape') {
      setEditingTabId(null);
      setEditingTitle('');
    }
  };

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % tabs.length;
      setActiveTab(tabs[next].id);
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prev].id);
    }
  };

  return (
    <div className="bg-muted/50 border-b sticky top-0 z-20 px-2 py-1.5">
      <div className="flex items-center space-x-1 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center p-0 rounded-md h-8",
              activeTabId === tab.id ? "bg-primary/10 text-primary ring-1 ring-primary/50" : "hover:bg-accent/5 text-muted-foreground"
            )}
          >
            {editingTabId === tab.id ? (
              <Input
                ref={inputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={handleRenameKeyDown}
                className="h-full text-xs px-2 py-1 rounded-l-md border-primary focus-visible:ring-primary"
                style={{minWidth: '100px', maxWidth: '200px'}}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                role="tab"
                aria-selected={activeTabId === tab.id}
                aria-controls="conteudo-tab"
                className={cn(
                    "h-full text-xs px-2.5 py-1 rounded-none rounded-l-md font-medium flex-grow text-left truncate",
                    activeTabId === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab.id)}
                onDoubleClick={() => handleRenameStart(tab)}
                onKeyDown={(e) => handleKeyNavigation(e, tabs.findIndex(t => t.id === tab.id))}
                title={tab.title}
                style={{maxWidth: '180px'}}
              >
                {getTabIcon(tab.type)}
                {tab.title}
              </Button>
            )}
             <Button
                variant="ghost"
                size="icon"
                className="h-full w-6 rounded-none p-0 hover:bg-transparent"
                onClick={() => handleRenameStart(tab)}
                aria-label={`Editar nome da aba ${tab.title}`}
                title="Renomear Aba"
              >
                <Edit2 className="h-3 w-3 opacity-50 hover:opacity-100" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-6 rounded-none rounded-r-md p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"
                  disabled={tabs.length <= 1}
                  aria-label={`Remover aba ${tab.title}`}
                  title="Remover Aba"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Aba?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover a aba "{tab.title}"? Todo o conteúdo desta aba será perdido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeTab(tab.id)} className="bg-destructive hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm font-medium h-8 flex-shrink-0 ml-1"
              title="Adicionar Nova Aba"
            >
              <span className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Nova Aba
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Novo Quadro Analítico</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAddTab('formulation')}>
              {getTabIcon('formulation')} Mapa de Formulação (ABC)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('chain')} disabled> {/* Disabled for now */}
              {getTabIcon('chain')} Análise em Cadeia (DBT)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('matrix')} disabled> {/* Disabled for now */}
              {getTabIcon('matrix')} Matriz da ACT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTab('hexaflex')} disabled> {/* Disabled for now */}
              {getTabIcon('hexaflex')} Hexaflex (ACT)
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => handleAddTab('custom')}>Outro (Personalizado)</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

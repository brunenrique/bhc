"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClinicalStore } from '@/stores/clinicalStore';

interface ABCFormProps {
  initialTitle?: string;
  initialBehavior?: string;
}

const ABCForm: React.FC<ABCFormProps> = ({ initialTitle, initialBehavior }) => {
  const { isABCFormOpen, closeABCForm, editingCardId } = useClinicalStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState<string>(initialTitle ?? "");
  const [behavior, setBehavior] = useState<string>(initialBehavior ?? "");

  useEffect(() => {
    setDialogOpen(isABCFormOpen); // Sincroniza com o store
  }, [isABCFormOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeABCForm(); // Chama a ação do store para fechar
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {editingCardId ? 'Editar Card ABC (Simplificado)' : 'Novo Card ABC (Simplificado)'}
          </DialogTitle>
          <DialogDescription>
            ABC Form Test
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="abc-title" className="text-sm font-medium">Título</label>
            <input
              id="abc-title"
              className="border rounded p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="abc-behavior" className="text-sm font-medium">Comportamento</label>
            <input
              id="abc-behavior"
              className="border rounded p-2"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <DialogClose asChild>
            <div className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full">Cancelar</Button>
            </div>
          </DialogClose>
          <Button
            type="button"
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
            onClick={closeABCForm}
          >
            {editingCardId ? 'Salvar (Simples)' : 'Adicionar (Simples)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ABCForm;

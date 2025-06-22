'use client';

import WaitingListForm from '@/components/forms/waiting-list-form';
import { UserPlus2 } from 'lucide-react';

export default function AddToWaitingListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus2 className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Adicionar à Lista de Espera</h1>
      </div>
      <WaitingListForm />
    </div>
  );
}

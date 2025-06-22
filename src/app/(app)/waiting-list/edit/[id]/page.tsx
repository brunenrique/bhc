'use client';

import { useEffect, useState } from 'react';
import WaitingListForm, { WaitingListFormValues } from '@/components/forms/waiting-list-form';
import { getWaitingListEntryById } from '@/services/waitingListService';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCog } from 'lucide-react';

export default function EditWaitingListPage() {
  const params = useParams();
  const entryId = params.id as string;
  const [initialData, setInitialData] = useState<WaitingListFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntry() {
      if (entryId) {
        const entry = await getWaitingListEntryById(entryId);
        if (entry) {
          setInitialData({
            patientName: entry.name,
            contactPhone: entry.contactPhone || '',
            contactEmail: entry.contactEmail || '',
            requestedPsychologistId: entry.requestedPsychologistId || 'any',
            priority: entry.priority,
            notes: entry.notes || '',
          });
        }
        setLoading(false);
      }
    }
    fetchEntry();
  }, [entryId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserCog className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Carregando Dados...</h1>
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="space-y-6 text-center py-10">
        <UserCog className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-3xl font-headline font-bold text-destructive">
          Entrada não Encontrada
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WaitingListForm initialData={initialData} entryId={entryId} />
    </div>
  );
}

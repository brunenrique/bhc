// src/components/patients/PatientActiveTrilhas.tsx

'use client'; // Se estiver usando App Router

import { useEffect, useState } from 'react';
import { getPacienteTrilhasAtivas, updateTrilhaProgresso, updateTrilhaObservacoes, getTrilhaById } from '../../services/trilhasService'; // Importar serviços e getTrilhaById
import { TrilhaAtivaPaciente, TrilhaTerapeutica, EtapaTrilha } from '../../types/trilhas'; // Importar tipos

interface PatientActiveTrilhasProps {
  patientId: string;
  currentUserId: string; // UID do usuário logado para permissões/ações
  currentUserRole: string; // Papel do usuário logado para permissões de UI
}

const PatientActiveTrilhas: React.FC<PatientActiveTrilhasProps> = ({ patientId, currentUserId, currentUserRole }) => {
  const [activeTrilhas, setActiveTrilhas] = useState<(TrilhaAtivaPaciente & { detalhes?: TrilhaTerapeutica | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para carregar as trilhas ativas do paciente
  useEffect(() => {
    const fetchActiveTrilhas = async () => {
      try {
        setLoading(true);
        const trilhasAtivas = await getPacienteTrilhasAtivas(patientId);

        // Para cada trilha ativa, buscar os detalhes da trilha original
        const trilhasWithDetails = await Promise.all(trilhasAtivas.map(async (trilhaAtiva) => {
          const detalhes = await getTrilhaById(trilhaAtiva.trilhaId);
          return { ...trilhaAtiva, detalhes };
        }));

        setActiveTrilhas(trilhasWithDetails.filter(t => t.detalhes !== undefined)); // Filtrar caso a trilha original não seja encontrada ou seja null
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar trilhas ativas:", err);
        setError("Erro ao carregar trilhas ativas.");
        setLoading(false);
      }
    };

    if (patientId) {
      fetchActiveTrilhas();
    }
  }, [patientId]); // Refetch se o patientId mudar

  // Função para marcar/desmarcar etapa
  const handleToggleEtapa = async (trilhaAtiva: TrilhaAtivaPaciente & { detalhes?: TrilhaTerapeutica | null }, etapaId: string) => {
    // Implementar lógica de permissão: Apenas admin ou psicólogo dono do paciente pode marcar
     if (currentUserRole !== 'admin' && currentUserRole !== 'psychologist') {
       console.warn("Permissão negada: Somente admin ou psicólogo pode atualizar o progresso.");
       // Mostrar um toast ou mensagem para o usuário
       return;
     }

    // Verificar se o usuário logado é o psicólogo responsável pelo paciente (se aplicável, dependendo da sua lógica de isPatientOwner no frontend)
    // No momento, a regra de segurança do Firestore já garante isso, mas pode haver lógica adicional no frontend.

    const isCompleted = trilhaAtiva.etapasConcluidas.includes(etapaId);
    const novasEtapasConcluidas = isCompleted
      ? trilhaAtiva.etapasConcluidas.filter(id => id !== etapaId)
      : [...trilhaAtiva.etapasConcluidas, etapaId];

    try {
      await updateTrilhaProgresso(patientId, trilhaAtiva.id!, novasEtapasConcluidas);

      // Atualizar o estado local
      setActiveTrilhas(prevTrilhas =>
        prevTrilhas.map(t =>
          t.id === trilhaAtiva.id ? { ...t, etapasConcluidas: novasEtapasConcluidas } : t
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
       setError("Erro ao atualizar progresso da trilha.");
       // Reverter o estado local em caso de erro, ou buscar novamente
       // fetchActiveTrilhas(); // Opção mais segura mas menos performática
    }
  };

   // Função para salvar observações (debounce ou onBlur para melhor UX)
   const handleSaveObservacoes = async (trilhaAtivaId: string, observacoes: string) => {
       if (currentUserRole !== 'admin' && currentUserRole !== 'psychologist') {
           console.warn("Permissão negada: Somente admin ou psicólogo pode adicionar observações.");
           // Mostrar um toast ou mensagem para o usuário
           return;
       }
       try {
           await updateTrilhaObservacoes(patientId, trilhaAtivaId, observacoes);
            // Atualizar o estado local (opcional, dependendo de como você gerencia o input)
             setActiveTrilhas(prevTrilhas =>
               prevTrilhas.map(t =>
                 t.id === trilhaAtivaId ? { ...t, observacoesClinicas: observacoes } : t
               )
             );
           console.log("Observações salvas!"); // Feedback para o usuário
       } catch (error) {
           console.error("Erro ao salvar observações:", error);
            setError("Erro ao salvar observações.");
       }
   };


  if (loading) {
    return <div>Carregando trilhas ativas...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trilhas Terapêuticas Ativas</h2>

      {activeTrilhas.length === 0 && (
        <p>Nenhuma trilha terapêutica ativa para este paciente.</p>
      )}

      {/* Botão para atribuir nova trilha (implementar modal) */}
      { (currentUserRole === 'admin' || currentUserRole === 'psychologist') && (
           <button className="btn btn-primary" onClick={() => alert("Implementar modal de atribuição de trilha")}>
               Atribuir Nova Trilha
           </button>
      )}


      {activeTrilhas.map(trilhaAtiva => {
        const trilhaDetalhes = trilhaAtiva.detalhes;
        if (!trilhaDetalhes) {
          // Tratar caso onde os detalhes da trilha não foram encontrados (embora filtremos acima)
          return <div key={trilhaAtiva.id}>Erro: Detalhes da trilha não encontrados para {trilhaAtiva.trilhaId}</div>;
        }

        const progresso = Math.round((trilhaAtiva.etapasConcluidas.length / trilhaDetalhes.etapas.length) * 100);

        return (
          <div key={trilhaAtiva.id} className="border p-4 rounded-md shadow-sm">
            <h3 className="text-xl font-medium">{trilhaDetalhes.titulo}</h3>
            <p className="text-sm text-gray-600 mb-3">Atribuída em: {trilhaAtiva.atribuidaEm.toDate().toLocaleDateString()}</p> {/* Formatar data */}
            <p className="text-sm text-gray-600 mb-4">Progresso: {isNaN(progresso) ? 0 : progresso}%</p> {/* Tratar divisão por zero */}
             {/* Barra de progresso visual (usar um componente de UI como de shadcn/ui) */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${isNaN(progresso) ? 0 : progresso}%` }}></div>
            </div>


            <div className="space-y-2">
              <h4 className="font-semibold">Etapas:</h4>
              {trilhaDetalhes.etapas.map(etapa => (
                <div key={etapa.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={trilhaAtiva.etapasConcluidas.includes(etapa.id)}
                    onChange={() => handleToggleEtapa(trilhaAtiva, etapa.id)}
                    className="mr-2"
                     disabled={currentUserRole !== 'admin' && currentUserRole !== 'psychologist'} // Desabilita checkbox para outros papéis
                  />
                  <label className={`flex-1 ${trilhaAtiva.etapasConcluidas.includes(etapa.id) ? 'line-through text-gray-500' : ''}`}>
                     <strong>{etapa.titulo}:</strong> {etapa.objetivo}
                     {etapa.tipo && <span className="ml-2 text-xs px-1 py-0.5 bg-gray-200 rounded">{etapa.tipo}</span>}
                     {etapa.recursoExtra && <a href={etapa.recursoExtra} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline text-sm">Recurso</a>}
                   </label>
                </div>
              ))}
            </div>

            <div className="mt-4">
               <label htmlFor={`observacoes-${trilhaAtiva.id}`} className="block text-sm font-medium text-gray-700">Observações Clínicas:</label>
               <textarea
                 id={`observacoes-${trilhaAtiva.id}`}
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 rows={3}
                 value={trilhaAtiva.observacoesClinicas || ''}
                 onChange={(e) => {
                    // Atualizar estado local para feedback imediato
                     setActiveTrilhas(prevTrilhas =>
                        prevTrilhas.map(t =>
                           t.id === trilhaAtiva.id ? { ...t, observacoesClinicas: e.target.value } : t
                        )
                     );
                 }}
                  onBlur={(e) => handleSaveObservacoes(trilhaAtiva.id!, e.target.value)} // Salva ao perder o foco
                  disabled={currentUserRole !== 'admin' && currentUserRole !== 'psychologist'} // Desabilita textarea para outros papéis
               ></textarea>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default PatientActiveTrilhas;

import { db } from '../lib/firebase'; // Assumindo que seu initializeApp está aqui
import { collection, addDoc, getDocs, query, where, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore'; // Importar getDoc
import { TrilhaTerapeutica, TrilhaAtivaPaciente } from '../types/trilhas';

// Função para criar uma nova trilha terapêutica
export const createTrilha = async (
  trilhaData: Omit<TrilhaTerapeutica, 'id' | 'criadaEm'>, // ID e criadaEm serão gerados no backend
  userId: string // UID do usuário criando a trilha
): Promise<string> => {
  try {
    const trilhasCollectionRef = collection(db, 'trilhas');
    const novaTrilhaRef = await addDoc(trilhasCollectionRef, {
      ...trilhaData,
      criadaPor: userId,
      criadaEm: Timestamp.now(),
    });
    console.log("Nova trilha criada com ID:", novaTrilhaRef.id);
    return novaTrilhaRef.id;
  } catch (error) {
    console.error("Erro ao criar trilha:", error);
    throw error;
  }
};

// Função para obter trilhas terapêuticas (públicas ou pessoais)
export const getTrilhas = async (userId: string, userRole: string): Promise<TrilhaTerapeutica[]> => {
  try {
    const trilhasCollectionRef = collection(db, 'trilhas');
    let q = query(trilhasCollectionRef);

    // Lógica de permissão baseada no papel
    if (userRole === 'psychologist') {
      // Psicólogos podem ver trilhas públicas E as que eles criaram
       const publicQuery = query(trilhasCollectionRef, where('publico', '==', true));
       const publicSnapshot = await getDocs(publicQuery);
       const publicTrilhas = publicSnapshot.docs.map(doc => ({ ...doc.data() as TrilhaTerapeutica, id: doc.id, criadaEm: doc.data().criadaEm as Timestamp }));

       const personalQuery = query(trilhasCollectionRef, where('criadaPor', '==', userId));
       const personalSnapshot = await getDocs(personalQuery);
       const personalTrilhas = personalSnapshot.docs.map(doc => ({ ...doc.data() as TrilhaTerapeutica, id: doc.id, criadaEm: doc.data().criadaEm as Timestamp }));

       // Combinar e remover duplicatas (caso uma trilha pública tenha sido criada pelo user, embora publico: true + criadaPor: user é ok)
       const combinedTrilhas = [...publicTrilhas, ...personalTrilhas.filter(pt => !publicTrilhas.some(ptl => ptl.id === pt.id))];
       return combinedTrilhas;

    } else if (userRole === 'admin') {
      // Admins podem ver todas as trilhas
      q = query(trilhasCollectionRef); // Sem filtros adicionais
      const querySnapshot = await getDocs(q);
      const trilhas: TrilhaTerapeutica[] = querySnapshot.docs.map(doc => ({ ...doc.data() as TrilhaTerapeutica, id: doc.id, criadaEm: doc.data().criadaEm as Timestamp }));
      return trilhas;
    } else {
      // Secretários e Scheduling não vêem trilhas nesta lógica inicial
      return [];
    }


  } catch (error) {
    console.error("Erro ao obter trilhas:", error);
    throw error;
  }
};

// Função para atribuir uma trilha a um paciente
export const assignTrilhaToPaciente = async (
  trilhaId: string,
  pacienteId: string,
  assignedByUserId: string
): Promise<string> => {
  try {
    const trilhasAtivasCollectionRef = collection(db, `pacientes/${pacienteId}/trilhasAtivas`);
    const novaTrilhaAtivaRef = await addDoc(trilhasAtivasCollectionRef, {
      trilhaId: trilhaId,
      pacienteId: pacienteId, // Redundante, mas útil para consultas e tipagem
      atribuidaPor: assignedByUserId,
      atribuidaEm: Timestamp.now(),
      etapasConcluidas: [], // Começa sem etapas concluídas
      observacoesClinicas: '', // Observações iniciais vazias
    } as TrilhaAtivaPaciente); // Casting para garantir a tipagem

    console.log(`Trilha ${trilhaId} atribuída ao paciente ${pacienteId} com ID ativo: ${novaTrilhaAtivaRef.id}`);
    return novaTrilhaAtivaRef.id;
  } catch (error) {
    console.error("Erro ao atribuir trilha ao paciente:", error);
    throw error;
  }
};

// Função para obter as trilhas ativas de um paciente
export const getPacienteTrilhasAtivas = async (pacienteId: string): Promise<TrilhaAtivaPaciente[]> => {
  try {
    const trilhasAtivasCollectionRef = collection(db, `pacientes/${pacienteId}/trilhasAtivas`);
    const q = query(trilhasAtivasCollectionRef);
    const querySnapshot = await getDocs(q);
    const trilhasAtivas: TrilhaAtivaPaciente[] = querySnapshot.docs.map(doc => ({ ...doc.data() as TrilhaAtivaPaciente, id: doc.id, atribuidaEm: doc.data().atribuidaEm as Timestamp }));
    return trilhasAtivas;
  } catch (error) {
    console.error("Erro ao obter trilhas ativas do paciente:", error);
    throw error;
  }
};

// Função para atualizar o progresso de uma trilha ativa (marcar etapas como concluídas)
export const updateTrilhaProgresso = async (
  pacienteId: string,
  trilhaAtivaId: string,
  etapasConcluidas: string[] // Array com os IDs das etapas concluídas
): Promise<void> => {
  try {
    const trilhaAtivaDocRef = doc(db, `pacientes/${pacienteId}/trilhasAtivas`, trilhaAtivaId);
    await updateDoc(trilhaAtivaDocRef, {
      etapasConcluidas: etapasConcluidas,
    });
    console.log(`Progresso da trilha ativa ${trilhaAtivaId} do paciente ${pacienteId} atualizado.`);
  } catch (error) {
    console.error("Erro ao atualizar progresso da trilha ativa:", error);
    throw error;
  }
};

// Função para atualizar observações de uma trilha ativa
export const updateTrilhaObservacoes = async (
  pacienteId: string,
  trilhaAtivaId: string,
  observacoes: string
): Promise<void> => {
  try {
    const trilhaAtivaDocRef = doc(db, `pacientes/${pacienteId}/trilhasAtivas`, trilhaAtivaId);
    await updateDoc(trilhaAtivaDocRef, {
      observacoesClinicas: observacoes,
    });
    console.log(`Observações da trilha ativa ${trilhaAtivaId} do paciente ${pacienteId} atualizadas.`);
  } catch (error) {
    console.error("Erro ao atualizar observações da trilha ativa:", error);
    throw error;
  }
};

// Função para obter uma trilha terapêutica pelo ID
export const getTrilhaById = async (trilhaId: string): Promise<TrilhaTerapeutica | null> => {
  try {
    const trilhaDocRef = doc(db, 'trilhas', trilhaId);
    const trilhaSnapshot = await getDoc(trilhaDocRef);

    if (trilhaSnapshot.exists()) {
      // É importante incluir o ID do documento nos dados retornados
      // e tratar o timestamp
      const data = trilhaSnapshot.data();
      return { ...data as TrilhaTerapeutica, id: trilhaSnapshot.id, criadaEm: data.criadaEm as Timestamp };
    } else {
      console.log(`Trilha com ID ${trilhaId} não encontrada.`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao obter trilha com ID ${trilhaId}:`, error);
    throw error;
  }
};


// Futuras funções:
// - updateTrilha(trilhaId: string, updatedData: Partial<TrilhaTerapeutica>): Promise<void>
// - deleteTrilha(trilhaId: string): Promise<void>
// - removeTrilhaAtiva(pacienteId: string, trilhaAtivaId: string): Promise<void>
// - Funções para visualizar indicadores (ex: % de conclusão por paciente/trilha) - exigiria agregação ou queries mais avançadas/Cloud Functions

import { Timestamp } from 'firebase/firestore';

// Define os tipos de abordagem terapêutica
export type AbordagemTerapeutica = "TCC" | "ACT" | "DBT" | "Psicoeducação" | string; // Adicione 'string' para flexibilidade se necessário

// Define a estrutura de uma etapa dentro de uma trilha
export interface EtapaTrilha {
  id: string; // ID único da etapa (pode ser gerado no frontend ou backend)
  titulo: string;
  objetivo: string;
  tipo?: "psicoeducacao" | "tarefa" | "discussao" | string; // Tipos de etapa
  recursoExtra?: string; // Link ou referência a um documento/recurso
}

// Define a estrutura de um documento na coleção 'trilhas'
export interface TrilhaTerapeutica {
  id: string; // ID do documento no Firestore
  titulo: string;
  descricao: string;
  criadaPor: string; // UID do psicólogo/admin que criou
  publico: boolean; // Indica se a trilha é pública (disponível para outros usarem/copiarem)
  abordagem: AbordagemTerapeutica;
  tags: string[]; // Tags para busca e categorização (ex: ["ansiedade", "depressão"])
  etapas: EtapaTrilha[]; // Array de etapas
  criadaEm: Timestamp; // Timestamp da criação
}

// Define a estrutura de um documento na subcoleção 'pacientes/{pacienteId}/trilhasAtivas'
export interface TrilhaAtivaPaciente {
  id?: string; // Firestore document ID for this active trail instance (optional, useful for updates/deletes)
  trilhaId: string; // Referência ao ID da trilha original na coleção 'trilhas'
  pacienteId: string; // Referência ao ID do paciente (redundante na subcoleção, mas útil para tipagem e clareza)
  atribuidaPor: string; // UID do psicólogo que atribuiu
  atribuidaEm: Timestamp;
  etapasConcluidas: string[]; // Array de IDs das etapas concluídas
  observacoesClinicas?: string; // Observações gerais sobre a aplicação da trilha para este paciente
  // Pode adicionar um campo para observações por etapa se necessário, ex:
  // observacoesPorEtapa?: { [etapaId: string]: string };
}

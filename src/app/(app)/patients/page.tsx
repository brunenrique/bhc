"use client";
import { PatientListTable } from "@/features/patients/components/PatientListTable";
import { PatientFormDialog } from "@/features/patients/components/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2, Users as UsersIcon } from "lucide-react"; // Renomeado Users para UsersIcon
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Patient, Prontuario, ProcedimentoAnaliseEntry } from "@/types";
import { cacheService } from '@/services/cacheService';
import { useAuth } from "@/hooks/useAuth"; 
import { hasPermission } from "@/lib/permissions";
import { subDays, formatISO } from 'date-fns';

const createPastDate = (days: number): string => subDays(new Date(), days).toISOString();

// Helper para criar entradas de procedimento/análise mockadas
const createMockProcedimentoAnalise = (patientName: string, baseDate: Date): ProcedimentoAnaliseEntry[] => [
    {
        entryId: `proc-${patientName.replace(/\s+/g, '_')}-1-${Date.now()}`,
        date: subDays(baseDate, 10).toISOString(),
        content: `<p>Primeira sessão com ${patientName}. O paciente apresentou queixas de ansiedade social e dificuldade em iniciar novas amizades. Demonstra receio de julgamento e isolamento.</p><p>Exploramos a origem desses sentimentos e definimos o foco inicial da terapia.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
    {
        entryId: `proc-${patientName.replace(/\s+/g, '_')}-2-${Date.now()}`,
        date: subDays(baseDate, 5).toISOString(),
        content: `<p>Sessão de acompanhamento. ${patientName} relatou um pequeno avanço ao participar de um evento social curto, apesar da ansiedade. Discutimos estratégias de enfrentamento e respiração.</p><p>Exploramos crenças centrais sobre si mesmo e sobre os outros.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
     {
        entryId: `proc-${patientName.replace(/\s+/g, '_')}-3-${Date.now()}`,
        date: baseDate.toISOString(),
        content: `<p>Sessão atual. ${patientName} parece mais à vontade. Conversamos sobre a importância da exposição gradual. Agendamos tarefa de casa: iniciar uma breve conversa com um colega de trabalho.</p><p>Reforçamos os progressos e validamos os sentimentos de desconforto inicial.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
];


export const mockPatientsData: Patient[] = [
  { 
    id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: createPastDate(10), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { 
        nomeCompleto: 'Ana Beatriz Silva', cpf: '111.222.333-44', dataNascimento: '1990-05-15', sexo: 'Feminino', estadoCivil: 'Solteira', racaCor: 'Branca', possuiFilhos: false, situacaoProfissional: 'Empregada', profissao: 'Designer Gráfica', escolaridade: 'Ensino Superior Completo', renda: 'R$ 4.500,00', enderecoCasa: 'Rua das Flores, 123, Apto 4B, Primavera, Cidade Jardim - SP, CEP 01234-567', tipoMoradia: 'Apartamento Alugado', telefone: '(11) 98765-4321', contatoEmergencia: 'Maria Silva (Mãe) - (11) 98765-0000'
      },
      entradaUnidade: { dataEntrada: createPastDate(10), descricaoEntrada: 'Paciente encaminhada pela UBS Jardim das Rosas com queixa de ansiedade social e isolamento persistente. Relata dificuldade em manter relacionamentos e iniciar novas amizades desde a adolescência.' },
      demandaQueixaPrincipal: 'Ansiedade social, dificuldade em fazer amizades, medo de julgamento em interações sociais, crises de pânico esporádicas em multidões e sensação de inadequação.',
      procedimentosAnalise: createMockProcedimentoAnalise('Ana Beatriz Silva', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia focada em TCC para reestruturação cognitiva, desenvolvimento de habilidades sociais e exposição gradual a situações sociais temidas. Considerar avaliação para comorbidades.',
      localAssinatura: 'Centro',
      signatureStatus: 'signed',
      signatureDetails: { hash: 'mockhash_ana_pront_001', signerInfo: 'Dr. Exemplo Silva (Psicólogo)', signedAt: createPastDate(2), verificationCode: 'VERIFY-ANA-001' }
    }
  }, 
  { 
    id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: createPastDate(5), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Bruno Almeida Costa', cpf: '222.333.444-55', dataNascimento: '1985-11-20', sexo: 'Masculino', estadoCivil: 'Casado', racaCor: 'Parda', possuiFilhos: true, quantosFilhos: 1, situacaoProfissional: 'Autônomo', profissao: 'Desenvolvedor Web', escolaridade: 'Pós-graduação', renda: 'R$ 7.200,00', enderecoCasa: 'Av. Principal, 789, Centro, Cidade Nova - RJ, CEP 20000-123', tipoMoradia: 'Casa Própria', telefone: '(21) 91234-5678', contatoEmergencia: 'Juliana Costa (Esposa) - (21) 91234-0001'
      },
      entradaUnidade: { dataEntrada: createPastDate(5), descricaoEntrada: 'Busca por acompanhamento psicológico devido a estresse no trabalho e dificuldades em equilibrar vida pessoal e profissional.' },
      demandaQueixaPrincipal: 'Estresse crônico relacionado ao ambiente de trabalho, dificuldades de gestão de tempo, pressão por resultados, irritabilidade e impacto na dinâmica familiar.',
      procedimentosAnalise: createMockProcedimentoAnalise('Bruno Almeida Costa', new Date()),
      conclusaoEncaminhamentoGeral: 'Acompanhamento focado em desenvolvimento de habilidades de coping, organização, assertividade no ambiente profissional e técnicas de relaxamento. Terapia de casal sugerida a médio prazo.',
      localAssinatura: 'Centro',
      signatureStatus: 'pending_govbr_signature',
      signatureDetails: { hash: 'mockhash_bruno_pront_002' }
    }
  },
  { 
    id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: createPastDate(0), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Carla Dias Oliveira', cpf: '333.444.555-66', dataNascimento: '2000-02-10', sexo: 'Feminino', estadoCivil: 'Solteira', racaCor: 'Preta', possuiFilhos: false, situacaoProfissional: 'Estudante', profissao: 'N/A (Estudante Universitária - Psicologia)', escolaridade: 'Ensino Superior Incompleto', renda: 'Bolsa de estudos + Ajuda familiar (aprox. 1.5 SM)', enderecoCasa: 'Rua dos Estudantes, Bloco C, Apto 101, Universitário, Belo Horizonte - MG, CEP 30123-000', tipoMoradia: 'República Estudantil', telefone: '(31) 95555-5555', contatoEmergencia: 'Sra. Neuza Dias (Mãe) - (31) 95555-0002'
      },
      entradaUnidade: { dataEntrada: createPastDate(0), descricaoEntrada: 'Primeira avaliação. Encaminhada pela coordenação do curso por dificuldades de adaptação e baixo rendimento acadêmico.' },
      demandaQueixaPrincipal: 'Dificuldades de concentração, baixo rendimento escolar, procrastinação, ansiedade em relação às avaliações e sentimentos de não pertencimento no ambiente universitário.',
      procedimentosAnalise: createMockProcedimentoAnalise('Carla Dias Oliveira', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de processo de avaliação psicológica para investigar hipóteses diagnósticas (TDAH, ansiedade). Elaborar plano de intervenção com foco em estratégias de estudo, manejo da ansiedade e desenvolvimento de habilidades sociais no contexto acadêmico.',
      localAssinatura: 'Fazendinha',
      signatureStatus: 'none'
    }
  },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: createPastDate(20), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { 
        nomeCompleto: 'Daniel Farias Lima', cpf: '444.555.666-77', dataNascimento: '1992-07-22', sexo: 'Masculino', estadoCivil: 'Divorciado', racaCor: 'Branca', possuiFilhos: true, quantosFilhos: 2, situacaoProfissional: 'Empregado', profissao: 'Engenheiro Civil', escolaridade: 'Ensino Superior Completo', renda: 'R$ 9.800,00', enderecoCasa: 'Alameda dos Pinheiros, 45, Casa 2, Ecoville, Curitiba - PR, CEP 80000-456', tipoMoradia: 'Casa Alugada', telefone: '(41) 94444-0000', contatoEmergencia: 'Laura Farias (Irmã) - (41) 94444-0003'
      },
      entradaUnidade: { dataEntrada: createPastDate(20), descricaoEntrada: 'Busca espontânea por apoio para lidar com luto recente (perda da esposa) e dificuldades na adaptação à nova rotina com os filhos.' },
      demandaQueixaPrincipal: 'Processo de luto pela perda da esposa. Tristeza profunda, insônia, dificuldade em retomar rotina, sobrecarga com responsabilidades parentais e isolamento social.',
      procedimentosAnalise: createMockProcedimentoAnalise('Daniel Farias Lima', new Date()),
      conclusaoEncaminhamentoGeral: 'Terapia de apoio focada no processo de luto, validação de sentimentos, desenvolvimento de estratégias de enfrentamento para a nova realidade familiar e resgate da funcionalidade diária. Acompanhamento do impacto do luto nos filhos será monitorado.',
      localAssinatura: 'Centro',
      signatureStatus: 'signed',
      signatureDetails: { hash: 'mockhash_daniel_pront_004', signerInfo: 'Dr. Exemplo Silva (Psicólogo)', signedAt: createPastDate(15), verificationCode: 'VERIFY-DANIEL-004' }
    }
  },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: createPastDate(45), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Eduarda Gomes Ferreira', cpf: '555.666.777-88', dataNascimento: '1998-03-30', sexo: 'Feminino', estadoCivil: 'Namorando', racaCor: 'Amarela', possuiFilhos: false, situacaoProfissional: 'Desempregada', profissao: 'Recém-formada em Marketing', escolaridade: 'Ensino Superior Completo', renda: 'Seguro-desemprego + Ajuda familiar (aprox. 2 SM)', enderecoCasa: 'Rua das Acácias, 1010, Bairro Petrópolis, Porto Alegre - RS, CEP 90000-789', tipoMoradia: 'Mora com os pais', telefone: '(51) 93333-1111', contatoEmergencia: 'Roberto Ferreira (Pai) - (51) 93333-0004'
      },
      entradaUnidade: { dataEntrada: createPastDate(45), descricaoEntrada: 'Encaminhada por médico psiquiatra para avaliação e acompanhamento de quadro depressivo recorrente.' },
      demandaQueixaPrincipal: 'Humor deprimido, perda de interesse em atividades, fadiga, alterações no sono e apetite. Histórico de episódios depressivos anteriores, com ideação suicida em um deles (sem plano ativo atualmente). Dificuldade em buscar emprego.',
      procedimentosAnalise: createMockProcedimentoAnalise('Eduarda Gomes Ferreira', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia com foco em ativação comportamental, reestruturação cognitiva e manejo de sintomas depressivos. Acompanhamento multiprofissional (psiquiatra) mantido. Avaliação de risco e plano de segurança serão elaborados.',
      localAssinatura: 'Fazendinha',
      signatureStatus: 'none'
    }
  },
  { id: '6', name: 'Felipe Nogueira Moreira', email: 'felipe.moreira@example.com', phone: '(61) 92222-1111', dateOfBirth: '1995-09-12', createdAt: createPastDate(15), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Felipe Nogueira Moreira', cpf: '666.777.888-99', dataNascimento: '1995-09-12', sexo: 'Masculino', estadoCivil: 'Solteiro', racaCor: 'Indígena', possuiFilhos: false, situacaoProfissional: 'Servidor Público', profissao: 'Analista Administrativo', escolaridade: 'Ensino Superior Completo', renda: 'R$ 6.000,00', enderecoCasa: 'SQN 205, Bloco J, Apto 303, Asa Norte, Brasília - DF, CEP 70000-001', tipoMoradia: 'Apartamento Funcional', telefone: '(61) 92222-1111', contatoEmergencia: 'Beatriz Moreira (Irmã) - (61) 92222-0005'
      },
      entradaUnidade: { dataEntrada: createPastDate(15), descricaoEntrada: 'Busca por orientação devido a conflitos interpessoais no ambiente de trabalho e dificuldade em lidar com hierarquia.' },
      demandaQueixaPrincipal: 'Indecisão sobre escolha profissional, pressão familiar e receio de fazer a escolha errada. (NOTA: Manter este exemplo de Demanda original, mas dados de identificação atualizados).',
      procedimentosAnalise: createMockProcedimentoAnalise('Felipe Nogueira Moreira', new Date()),
      conclusaoEncaminhamentoGeral: 'Processo de orientação vocacional utilizando testes de interesse e aptidão, além de sessões de reflexão sobre valores e mercado de trabalho. (NOTA: Manter este exemplo de Conclusão original).',
      localAssinatura: 'Fazendinha',
      signatureStatus: 'pending_govbr_signature',
      signatureDetails: { hash: 'mockhash_felipe_pront_006' }
    }
  },
  { id: '7', name: 'Gabriela Martins Azevedo', email: 'gabriela.azevedo@example.com', phone: '(71) 91111-2222', dateOfBirth: '1993-01-25', createdAt: createPastDate(60), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Gabriela Martins Azevedo', cpf: '777.888.999-00', dataNascimento: '1993-01-25', sexo: 'Feminino', estadoCivil: 'União Estável', racaCor: 'Parda', possuiFilhos: true, quantosFilhos: 1, situacaoProfissional: 'Empregada', profissao: 'Professora', escolaridade: 'Mestrado', renda: 'R$ 5.500,00', enderecoCasa: 'Rua da Esperança, 77, Cond. Sol Nascente, Pituba, Salvador - BA, CEP 40000-111', tipoMoradia: 'Apartamento Próprio', telefone: '(71) 91111-2222', contatoEmergencia: 'Pedro Azevedo (Companheiro) - (71) 91111-0006'
      },
      entradaUnidade: { dataEntrada: createPastDate(60), descricaoEntrada: 'Busca por terapia de casal. Relata crise conjugal após o nascimento do primeiro filho e dificuldades na divisão de tarefas.' },
      demandaQueixaPrincipal: 'Conflitos frequentes no relacionamento, dificuldades de comunicação, insatisfação geral com a dinâmica conjugal e sobrecarga percebida nas responsabilidades domésticas e com o bebê.',
      procedimentosAnalise: createMockProcedimentoAnalise('Gabriela Martins Azevedo', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia de casal focada em melhorar a comunicação, identificar padrões disfuncionais, renegociar papéis e construir estratégias de resolução de conflitos e fortalecimento do vínculo.',
      localAssinatura: 'Centro',
      signatureStatus: 'none'
    }
  },
  { id: '8', name: 'Hugo Pereira da Silva', email: 'hugo.pereira@example.com', phone: '(81) 90000-3333', dateOfBirth: '1988-08-05', createdAt: createPastDate(3), updatedAt: new Date().toISOString(), assignedTo: 'other-psy-uid', // Atribuído a outro psicólogo
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Hugo Pereira da Silva', cpf: '888.999.000-11', dataNascimento: '1988-08-05', sexo: 'Masculino', estadoCivil: 'Solteiro', racaCor: 'Branca', possuiFilhos: false, situacaoProfissional: 'Autônomo', profissao: 'Fotógrafo', escolaridade: 'Curso Técnico', renda: 'Variável (aprox. R$ 3.000,00)', enderecoCasa: 'Rua dos Coqueiros, 88, Boa Viagem, Recife - PE, CEP 50000-222', tipoMoradia: 'Apartamento Alugado', telefone: '(81) 90000-3333', contatoEmergencia: 'Fátima Pereira (Mãe) - (81) 90000-0007'
      },
      entradaUnidade: { dataEntrada: createPastDate(3), descricaoEntrada: 'Avaliação neuropsicológica solicitada por neurologista devido a queixas de memória e atenção após um TCE leve.' },
      demandaQueixaPrincipal: 'Queixas de memória recente, dificuldade de concentração e organização após traumatismo cranioencefálico leve ocorrido há 3 meses. Impacto percebido no trabalho.',
      procedimentosAnalise: createMockProcedimentoAnalise('Hugo Pereira da Silva', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de processo de avaliação neuropsicológica para investigar as funções cognitivas (atenção, memória, funções executivas). Encaminhamento para reabilitação neuropsicológica conforme resultados.',
      localAssinatura: 'Centro', // Mesmo se for outro psicólogo, ele atende no Centro
      signatureStatus: 'signed',
      signatureDetails: { hash: 'mockhash_hugo_pront_008', signerInfo: 'Dr. Outro Exemplo (Psicólogo)', signedAt: createPastDate(1), verificationCode: 'VERIFY-HUGO-008' }
    }
  }, 
  { id: '9', name: 'Isabela Santos Rocha', email: 'isabela.santos@example.com', phone: '(91) 98888-4444', dateOfBirth: '2002-12-12', createdAt: createPastDate(90), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Isabela Santos Rocha', cpf: '999.000.111-22', dataNascimento: '2002-12-12', sexo: 'Feminino', estadoCivil: 'Solteira', racaCor: 'Parda', possuiFilhos: false, situacaoProfissional: 'Estudante', profissao: 'N/A (Cursinho pré-vestibular)', escolaridade: 'Ensino Médio Completo', renda: 'Dependente dos pais', enderecoCasa: 'Passagem das Mangueiras, 99, Guamá, Belém - PA, CEP 66000-333', tipoMoradia: 'Casa dos pais', telefone: '(91) 98888-4444', contatoEmergencia: 'Antônio Rocha (Pai) - (91) 98888-0008'
      },
      entradaUnidade: { dataEntrada: createPastDate(90), descricaoEntrada: 'Busca espontânea por terapia para autoconhecimento e manejo de ansiedade pré-vestibular.' },
      demandaQueixaPrincipal: 'Busca por autoconhecimento, desenvolvimento pessoal, manejo de ansiedade relacionada aos estudos e pressão do vestibular. Questionamentos sobre futuro e propósito.',
      procedimentosAnalise: createMockProcedimentoAnalise('Isabela Santos Rocha', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia com foco em exploração de valores, crenças, metas pessoais e desenvolvimento de técnicas de manejo de ansiedade. Utilização de técnicas de psicologia positiva e TCC.',
      localAssinatura: 'Fazendinha',
      signatureStatus: 'none'
    }
  },
  { id: '10', name: 'Lucas Mendes Oliveira', email: 'lucas.mendes@example.com', phone: '(12) 97777-5555', dateOfBirth: '1975-06-18', createdAt: createPastDate(120), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { 
        nomeCompleto: 'Lucas Mendes Oliveira', cpf: '000.111.222-33', dataNascimento: '1975-06-18', sexo: 'Masculino', estadoCivil: 'Viúvo', racaCor: 'Branca', possuiFilhos: true, quantosFilhos: 1, situacaoProfissional: 'Aposentado', profissao: 'Engenheiro Mecânico (Aposentado)', escolaridade: 'Ensino Superior Completo', renda: 'Aposentadoria (aprox. 4 SM)', enderecoCasa: 'Av. da Saudade, 1001, Vila Ema, São José dos Campos - SP, CEP 12200-444', tipoMoradia: 'Casa Própria', telefone: '(12) 97777-5555', contatoEmergencia: 'Sofia Oliveira (Filha) - (12) 97777-0009'
      },
      entradaUnidade: { dataEntrada: createPastDate(120), descricaoEntrada: 'Encaminhado pelo geriatra por sintomas de apatia e isolamento social após aposentadoria e viuvez.' },
      demandaQueixaPrincipal: 'Dificuldades de adaptação à aposentadoria e viuvez, sentimentos de solidão, apatia, baixa autoconfiança e perda de propósito.',
      procedimentosAnalise: createMockProcedimentoAnalise('Lucas Mendes Oliveira', new Date()),
      conclusaoEncaminhamentoGeral: 'Terapia breve com foco em desenvolver resiliência, habilidades de adaptação à nova fase da vida, ressignificar crenças limitantes e explorar novos interesses e atividades sociais.',
      localAssinatura: 'Centro',
      signatureStatus: 'pending_govbr_signature',
      signatureDetails: { hash: 'mockhash_lucas_pront_010' }
    }
  },
  // Novos pacientes para aumentar a variedade
  { 
    id: '11', name: 'Mariana Ferreira Lima', email: 'mariana.lima@example.com', phone: '(11) 96666-1111', dateOfBirth: '1999-08-20', createdAt: createPastDate(7), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { nomeCompleto: 'Mariana Ferreira Lima', cpf: '123.456.789-10', dataNascimento: '1999-08-20', sexo: 'Feminino', estadoCivil: 'Solteira', racaCor: 'Branca', possuiFilhos: false, situacaoProfissional: 'Estagiária', profissao: 'Estagiária de RH', escolaridade: 'Superior Incompleto', renda: 'Bolsa-auxílio', enderecoCasa: 'Rua Nova, 12, Centro, São Paulo - SP', tipoMoradia: 'Apartamento Alugado', telefone: '(11) 96666-1111', contatoEmergencia: 'Carlos Lima (Pai) - (11) 96666-0010' },
      entradaUnidade: { dataEntrada: createPastDate(7), descricaoEntrada: 'Busca por apoio devido a dificuldades de relacionamento interpessoal no ambiente de estágio.' },
      demandaQueixaPrincipal: 'Dificuldade em se impor, expressar opiniões e lidar com feedback negativo no trabalho. Sente-se constantemente ansiosa antes de interações com colegas e superiores.',
      procedimentosAnalise: createMockProcedimentoAnalise('Mariana Ferreira Lima', new Date()),
      conclusaoEncaminhamentoGeral: 'Foco em desenvolvimento de assertividade, habilidades de comunicação e manejo da ansiedade social no contexto profissional. Técnicas de TCC.',
      localAssinatura: 'Centro', signatureStatus: 'none'
    }
  },
  { 
    id: '12', name: 'Rafael Souza Campos', email: 'rafael.campos@example.com', phone: '(21) 95555-2222', dateOfBirth: '1980-03-10', createdAt: createPastDate(30), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
    prontuario: {
      identificacao: { nomeCompleto: 'Rafael Souza Campos', cpf: '987.654.321-00', dataNascimento: '1980-03-10', sexo: 'Masculino', estadoCivil: 'Casado', racaCor: 'Parda', possuiFilhos: true, quantosFilhos: 2, situacaoProfissional: 'Empregado', profissao: 'Gerente de Vendas', escolaridade: 'MBA', renda: 'R$ 12.000,00', enderecoCasa: 'Av. Atlântica, 456, Copacabana, Rio de Janeiro - RJ', tipoMoradia: 'Apartamento Próprio', telefone: '(21) 95555-2222', contatoEmergencia: 'Fernanda Campos (Esposa) - (21) 95555-0011' },
      entradaUnidade: { dataEntrada: createPastDate(30), descricaoEntrada: 'Indicado por colega de trabalho para manejo de estresse e prevenção de burnout.' },
      demandaQueixaPrincipal: 'Níveis elevados de estresse, dificuldade para "desligar" do trabalho, insônia frequente e sensação de esgotamento físico e mental. Preocupação com burnout.',
      procedimentosAnalise: createMockProcedimentoAnalise('Rafael Souza Campos', new Date()),
      conclusaoEncaminhamentoGeral: 'Intervenção focada em psicoeducação sobre estresse e burnout, técnicas de relaxamento, mindfulness, estabelecimento de limites e planejamento de atividades de lazer e autocuidado.',
      localAssinatura: 'Fazendinha', signatureStatus: 'signed', signatureDetails: { hash: 'mockhash_rafael_pront_012', signerInfo: 'Dra. Modelo Souza (Psicóloga)', signedAt: createPastDate(25), verificationCode: 'VERIFY-RAFAEL-012' }
    }
  },
   { 
    id: '13', name: 'Sofia Albuquerque Melo', email: 'sofia.melo@example.com', phone: '(81) 94444-3333', dateOfBirth: '2005-11-05', createdAt: createPastDate(14), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { nomeCompleto: 'Sofia Albuquerque Melo', cpf: '102.938.475-61', dataNascimento: '2005-11-05', sexo: 'Feminino', estadoCivil: 'Solteira', racaCor: 'Preta', possuiFilhos: false, situacaoProfissional: 'Estudante (Ensino Médio)', profissao: 'N/A', escolaridade: 'Ensino Médio Incompleto', renda: 'Dependente dos pais', enderecoCasa: 'Rua das Gameleiras, 789, Casa Amarela, Recife - PE', tipoMoradia: 'Casa dos pais', telefone: '(81) 94444-3333', contatoEmergencia: 'Clara Albuquerque (Mãe) - (81) 94444-0012' },
      entradaUnidade: { dataEntrada: createPastDate(14), descricaoEntrada: 'Trazida pelos pais devido a isolamento social, recusa em ir à escola e automutilação (arranhões superficiais).' },
      demandaQueixaPrincipal: 'Isolamento social progressivo, recusa escolar, episódios de automutilação (arranhões), humor irritadiço e comunicação escassa com a família. Pais relatam preocupação com possível cyberbullying.',
      procedimentosAnalise: createMockProcedimentoAnalise('Sofia Albuquerque Melo', new Date()),
      conclusaoEncaminhamentoGeral: 'Avaliação inicial de risco. Necessário estabelecer vínculo terapêutico e investigar possíveis gatilhos (cyberbullying, dinâmica familiar, questões de autoimagem). Terapia familiar e individual indicadas. Comunicação com a escola.',
      localAssinatura: 'Centro', signatureStatus: 'none'
    }
  },
  { 
    id: '14', name: 'Jorge Benício Andrade', email: 'jorge.andrade@example.com', phone: '(71) 93333-4444', dateOfBirth: '1968-01-15', createdAt: createPastDate(90), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
    prontuario: {
      identificacao: { nomeCompleto: 'Jorge Benício Andrade', cpf: '504.302.109-87', dataNascimento: '1968-01-15', sexo: 'Masculino', estadoCivil: 'Divorciado', racaCor: 'Parda', possuiFilhos: true, quantosFilhos: 3, situacaoProfissional: 'Aposentado por invalidez', profissao: 'Ex-motorista', escolaridade: 'Ensino Fundamental Completo', renda: 'Aposentadoria INSS', enderecoCasa: 'Travessa da Paz, 15, Liberdade, Salvador - BA', tipoMoradia: 'Casa Própria (Herança)', telefone: '(71) 93333-4444', contatoEmergencia: 'Maria Andrade (Filha) - (71) 93333-0013' },
      entradaUnidade: { dataEntrada: createPastDate(90), descricaoEntrada: 'Encaminhado pelo CAPS por queixas de dores crônicas sem causa física aparente e humor deprimido.' },
      demandaQueixaPrincipal: 'Dores crônicas difusas (principalmente costas e pernas), humor deprimido, anedonia, desesperança e dificuldades de sono. Limitações funcionais devido às dores. Relata que "a vida perdeu a graça".',
      procedimentosAnalise: createMockProcedimentoAnalise('Jorge Benício Andrade', new Date()),
      conclusaoEncaminhamentoGeral: 'Abordagem multidisciplinar (psicologia e fisioterapia/clínica da dor). Foco terapêutico em manejo da dor crônica, reestruturação cognitiva de crenças sobre a dor e incapacidade, ativação comportamental gradual e resgate de atividades prazerosas.',
      localAssinatura: 'Fazendinha', signatureStatus: 'pending_govbr_signature', signatureDetails: { hash: 'mockhash_jorge_pront_014' }
    }
  }
];

export default function PatientsPage() {
  const { user, isLoading: authIsLoading } = useAuth(); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const mapMockPsychologistIdToReal = useCallback((mockPatientsList: Patient[], currentUserId: string, currentUserRole: UserRole, currentUserName: string): Patient[] => {
    if (currentUserRole !== 'psychologist') {
      return mockPatientsList;
    }
    return mockPatientsList.map(p => {
      if (currentUserName === 'Dr. Exemplo Silva' && p.assignedTo === 'psy1') {
        return { ...p, assignedTo: currentUserId };
      }
      if (currentUserName === 'Dra. Modelo Souza' && p.assignedTo === 'psy2') {
        return { ...p, assignedTo: currentUserId };
      }
      if (currentUserName === 'Dr. Convidado' && p.assignedTo === 'other-psy-uid') {
        return { ...p, assignedTo: currentUserId };
      }
      return p;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPatients = async () => {
      if (!user) { 
        setIsLoadingData(true); 
        return;
      }
      setIsLoadingData(true);
      let dataToSet: Patient[];
      try {
        const cachedPatients = await cacheService.patients.getList();
        if (cachedPatients && cachedPatients.length > 0) {
          dataToSet = mapMockPsychologistIdToReal(cachedPatients, user.id, user.role, user.name);
        } else {
          const initialMocks = [...mockPatientsData]; // Use a copy
          dataToSet = mapMockPsychologistIdToReal(initialMocks, user.id, user.role, user.name);
          await cacheService.patients.setList(dataToSet); // Persist potentially modified mocks
        }
      } catch (error) {
        // console.warn("Error loading patients from cache or mapping IDs:", error);
        const initialMocksOnError = [...mockPatientsData]; // Use a fresh copy on error
        dataToSet = mapMockPsychologistIdToReal(initialMocksOnError, user.id, user.role, user.name);
      }
      
      if (isMounted) {
        setPatients(dataToSet);
        setIsLoadingData(false);
      }
    };

    if (!authIsLoading) { // Ensure user object is resolved before loading patients
        loadPatients();
    }
    return () => { isMounted = false; };
  }, [user, authIsLoading, mapMockPsychologistIdToReal]); 


  const handleNewPatient = useCallback(() => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  }, []);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    setPatients(prev => {
        const updated = prev.filter(p => p.id !== patientId);
        cacheService.patients.setList(updated);
        return updated;
    });
  }, []);

  const handleSavePatient = useCallback(async (patientDataFromForm: Partial<Patient>) => {
    setPatients(prevPatients => {
        let updatedPatientsList;
        let patientToSave: Patient;

        if (selectedPatient && patientDataFromForm.id) { 
        patientToSave = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
        updatedPatientsList = prevPatients.map(p => p.id === patientToSave.id ? patientToSave : p);
        } else { 
        const newPatientBase = { 
            ...patientDataFromForm, 
            id: `mock-${Date.now()}`, 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString(),
        };
        if (user?.role === 'psychologist') {
            patientToSave = { ...newPatientBase, assignedTo: user.id } as Patient;
        } else {
            patientToSave = newPatientBase as Patient; 
        }
        updatedPatientsList = [patientToSave, ...prevPatients];
        }
        cacheService.patients.setList(updatedPatientsList);
        return updatedPatientsList;
    });
    
    if (selectedPatient && patientDataFromForm.id) {
      const updatedPatientDetail = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
      await cacheService.patients.setDetail(updatedPatientDetail.id, updatedPatientDetail);
    }

    setIsFormOpen(false);
    setSelectedPatient(null);
  }, [selectedPatient, user]);

 const filteredPatients = useMemo(() => {
    if (!user) return []; 

    let patientsToFilter = patients;
    
    // If the user is a psychologist, they see patients assigned to them OR matching mock IDs for their name.
    if (user.role === 'psychologist') {
      patientsToFilter = patients.filter(p => {
        return p.assignedTo === user.id ||
               (user.name === 'Dr. Exemplo Silva' && p.assignedTo === 'psy1') ||
               (user.name === 'Dra. Modelo Souza' && p.assignedTo === 'psy2') ||
               (user.name === 'Dr. Convidado' && p.assignedTo === 'other-psy-uid');
      });
    }
    // For other roles (admin, secretary), they see all patients from the `patients` state.
    // The `patients` state itself should have already been processed by `mapMockPsychologistIdToReal`
    // if the logged-in user was one of the mock psychologists.
    
    return patientsToFilter.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [patients, searchTerm, user]);


  const canCreatePatient = hasPermission(user?.role, 'CREATE_EDIT_CLINICAL_NOTES') || 
                           hasPermission(user?.role, 'ACCESS_ADMIN_PANEL_SETTINGS');


  if (isLoadingData || authIsLoading || !user) { 
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Pacientes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar paciente..." 
              className="pl-8 w-full sm:w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canCreatePatient && (
            <Button onClick={handleNewPatient} className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Paciente
            </Button>
          )}
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Gerencie os registros dos seus pacientes. Adicione, edite ou visualize informações.
      </p>
      
      {filteredPatients.length === 0 && !isLoadingData ? ( 
        <div className="text-center py-10 text-muted-foreground">
          <UsersIcon className="mx-auto h-12 w-12 mb-2 opacity-50" /> 
          Nenhum paciente encontrado para os filtros atuais
          {user?.role === 'psychologist' && " ou atribuído a você"}.
        </div>
      ) : (
        <PatientListTable 
          patients={filteredPatients} 
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
        />
      )}

      {isFormOpen && (
        <PatientFormDialog
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            patient={selectedPatient}
            onSave={handleSavePatient}
        />
      )}
    </div>
  );
}

    
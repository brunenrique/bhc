
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, CalendarDays, Users, ClipboardList, FileText, Settings, MessageSquare, ListTodo, Info, HelpCircle, BookOpenText,
  Edit, PlusCircle, Search, Download, Fingerprint, UploadCloud, Eye, Trash2, ExternalLink, UserCheck, UserX, CalendarX2, CalendarCheck2, FileSignature, BarChart3, CaseSensitive, Bot,
  FileText as FileTextIconLucide, BookMarked, ShieldCheck, ShieldX, ShieldAlert, Edit3,
} from "lucide-react";
import Image from "next/image";

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BookOpenText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Guia de Uso da Plataforma PsiGuard</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Bem-vindo(a) ao PsiGuard! Este guia irá ajudá-lo(a) a navegar e utilizar as funcionalidades da plataforma.
      </p>

      <Accordion type="multiple" defaultValue={["intro"]} className="w-full space-y-4">
        
        <AccordionItem value="intro" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Introdução e Conceitos Gerais
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p>O PsiGuard foi desenvolvido para auxiliar psicólogos e clínicas na gestão de pacientes, agendamentos, documentação e muito mais, de forma segura e eficiente.</p>
              <h4>Navegação Principal:</h4>
              <p>Utilize o menu lateral (à esquerda) para acessar as principais seções da plataforma. Ícones representam cada funcionalidade.</p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Dica!</AlertTitle>
                <AlertDescription>
                  A maioria das tabelas permite ordenação clicando nos cabeçalhos e busca para filtrar resultados.
                </AlertDescription>
              </Alert>
              <h4>Confidencialidade:</h4>
              <p>Em áreas como "Detalhes do Paciente", informações sensíveis podem estar ocultas por padrão. Use o botão <Badge variant="outline"><Eye className="h-3 w-3 mr-1"/> Ver Confidencial</Badge> para exibi-las.</p>
               <h4>Modo Offline:</h4>
              <p>A plataforma detecta quando você está offline. Algumas funcionalidades, como agendamentos, podem ser salvas localmente e sincronizadas quando a conexão for restaurada. Um indicador <Badge variant="destructive"><UploadCloud className="h-3 w-3 mr-1"/> Offline</Badge> aparecerá no topo.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dashboard" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
             <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" /> Dashboard
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p>O Dashboard oferece uma visão geral e rápida da sua clínica.</p>
              <ul>
                <li><strong>Cards de Resumo:</strong> Exibem estatísticas chave como "Pacientes Ativos", "Sessões Hoje" e "Avaliações Pendentes".</li>
                <li><strong>Gráficos:</strong> Visualizações de "Sessões Semanais", "Taxa de Ocupação" e "Problemas Prevalentes" (dados de exemplo).</li>
              </ul>
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Nota sobre Dados</AlertTitle>
                <AlertDescription>
                  Atualmente, muitos dados do dashboard são simulados para demonstração.
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="scheduling" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Agendamentos e Lista de Espera
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <h4>Calendário de Sessões:</h4>
              <ol>
                <li>Clique em uma data no calendário para ver as sessões agendadas para aquele dia.</li>
                <li>Para agendar uma nova sessão, clique no botão <Badge><PlusCircle className="h-3 w-3 mr-1"/> Nova Sessão</Badge>.</li>
                <li>Preencha os detalhes do paciente, psicólogo, data, horários, status e recorrência (se aplicável).</li>
                <li>Para editar uma sessão existente, clique no ícone <Edit className="h-3 w-3 inline-block"/> ao lado da sessão na lista do dia ou diretamente no evento do calendário.</li>
              </ol>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Sessões Recorrentes</AlertTitle>
                <AlertDescription>
                  Ao criar uma sessão com recorrência (diária, semanal, mensal), o sistema criará automaticamente as próximas ocorrências.
                </AlertDescription>
              </Alert>
              
              <h4 className="mt-4">Lista de Espera:</h4>
               <p>Acesse a seção "Lista de Espera" através do menu lateral ou rolando para baixo na página de Agendamentos.</p>
              <ol>
                <li>Para adicionar um paciente à lista, clique em <Badge><PlusCircle className="h-3 w-3 mr-1"/> Adicionar à Lista</Badge>.</li>
                <li>Preencha nome, contato, preferências e o motivo.</li>
                <li>Na tabela da lista de espera, você pode:
                    <ul>
                        <li><Badge variant="outline"><CalendarPlus className="h-3 w-3 mr-1"/> Agendar Sessão</Badge>: Move o paciente da lista para um novo agendamento.</li>
                        <li><Badge variant="outline"><Edit className="h-3 w-3 mr-1"/> Editar Entrada</Badge>: Modifica os dados da entrada.</li>
                        <li>Alterar o status (Aguardando, Contatado, Agendado, Arquivado).</li>
                        <li><Badge variant="destructive"><Trash2 className="h-3 w-3 mr-1"/> Remover da Lista</Badge>.</li>
                    </ul>
                </li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="patients" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
             <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Pacientes
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <h4>Gerenciando Pacientes:</h4>
              <ol>
                <li>Use a barra de <Badge><Search className="h-3 w-3 mr-1"/> Busca</Badge> para encontrar pacientes por nome ou email.</li>
                <li>Para adicionar um novo paciente, clique em <Badge><PlusCircle className="h-3 w-3 mr-1"/> Novo Paciente</Badge> e preencha o formulário.</li>
                <li>Na lista, clique no menu de ações (<MoreHorizontal className="h-3 w-3 inline-block"/>) para <Badge variant="outline"><Eye className="h-3 w-3 mr-1"/>Ver Detalhes</Badge>, <Badge variant="outline"><Edit className="h-3 w-3 mr-1"/>Editar</Badge> ou <Badge variant="destructive"><Trash2 className="h-3 w-3 mr-1"/>Excluir</Badge> um paciente.</li>
              </ol>
              
              <h4>Detalhes do Paciente:</h4>
              <p>Ao clicar em "Ver Detalhes", você acessa a página completa do paciente, com várias abas:</p>
              <ul>
                <li><Badge variant="secondary"><FileTextIconLucide className="h-3 w-3 mr-1"/>Evolução Sessões</Badge>: Local para registrar as anotações da sessão atual. Use o editor rico em texto. Para editar estas notas ou dados do prontuário, clique no botão <Badge><Edit className="h-3 w-3 mr-1"/>Editar Paciente e Prontuário</Badge> no topo da página do paciente. Notas salvas aqui são adicionadas ao histórico no Prontuário Psicológico.</li>
                <li><Badge variant="secondary"><BookMarked className="h-3 w-3 mr-1"/>Prontuário</Badge>: Visualiza o Prontuário Psicológico consolidado do paciente.
                    <ul>
                        <li>A seção "Procedimento/Análise" é preenchida automaticamente com o histórico das "Evoluções das Sessões".</li>
                        <li>Botões para <Badge variant="outline"><Download className="h-3 w-3 mr-1"/>Exportar para PDF (Simulado)</Badge> e gerenciar assinaturas (simulado).</li>
                    </ul>
                </li>
                 <li><Badge variant="secondary"><CaseSensitive className="h-3 w-3 mr-1"/>Estudo de Caso</Badge>: Um espaço para anotações mais aprofundadas sobre o caso. Edite também através do botão <Badge><Edit className="h-3 w-3 mr-1"/>Editar Paciente e Prontuário</Badge>.</li>
                <li><Badge variant="secondary"><ListChecks className="h-3 w-3 mr-1"/>PTI</Badge>: Plano Terapêutico Individual, com metas e progresso.</li>
                <li><Badge variant="secondary"><FileSignature className="h-3 w-3 mr-1"/>Escalas</Badge>: Histórico de avaliações e questionários respondidos pelo paciente.</li>
                <li><Badge variant="secondary"><BarChart3 className="h-3 w-3 mr-1"/>Análise Gráfica</Badge>: Gráfico da evolução do paciente com base nas escalas respondidas.</li>
              </ul>
               <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Editando Dados do Paciente e Prontuário</AlertTitle>
                <AlertDescription>
                  Para modificar os dados cadastrais do paciente, a "Descrição da Demanda/Queixa Geral", a "Conclusão/Encaminhamento Geral", as "Evoluções da Sessão" ou as "Notas do Estudo de Caso", clique no botão <Badge><Edit className="h-3 w-3 mr-1"/>Editar Paciente e Prontuário</Badge> localizado no topo da página de detalhes do paciente.
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="assessments" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Avaliações
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <h4>Criando e Gerenciando Avaliações:</h4>
              <ol>
                <li>Acesse a aba <Badge><ClipboardList className="h-3 w-3 mr-1"/>Criar/Editar Avaliação</Badge>.</li>
                <li>Selecione um modelo de avaliação ou escolha "Avaliação Personalizada" e defina um título.</li>
                <li>Selecione o paciente.</li>
                <li>Clique em <Badge><Save className="h-3 w-3 mr-1"/> Salvar e Gerar Link</Badge>. Isso salva a avaliação e cria um link para o paciente responder.</li>
                <li>(Simulado) Clique em <Badge><Send className="h-3 w-3 mr-1"/> Enviar Link ao Paciente</Badge> para marcar a avaliação como enviada.</li>
                <li>O paciente acessa o link (ex: <code>/take-assessment?assessmentId=...</code>) e responde.</li>
                <li>Na aba <Badge><ListChecks className="h-3 w-3 mr-1"/>Resultados</Badge>, você pode ver o status das avaliações. Para avaliações concluídas, clique em <Badge variant="outline"><Eye className="h-3 w-3 mr-1"/> Ver Resultados</Badge> no menu de ações.</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="documents" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Documentos e Recursos
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p>Gerencie documentos importantes, como formulários, relatórios e recursos para pacientes.</p>
              <ol>
                <li>Para adicionar um novo documento, clique em <Badge><UploadCloud className="h-3 w-3 mr-1"/> Novo Documento</Badge> e selecione o arquivo.</li>
                <li>Os documentos são organizados por categorias em formato de acordeão.</li>
                <li>Use a barra de <Badge><Search className="h-3 w-3 mr-1"/> Busca</Badge> para encontrar documentos rapidamente.</li>
                <li>No menu de ações (<MoreHorizontal className="h-3 w-3 inline-block"/>) de cada documento, você pode:
                    <ul>
                        <li><Badge variant="outline"><Download className="h-3 w-3 mr-1"/> Download Original</Badge>.</li>
                        <li>Gerenciar Assinatura GOV.BR (Simulado):
                            <ul>
                                <li><Badge variant="outline"><Fingerprint className="h-3 w-3 mr-1"/> Iniciar Assinatura</Badge>: Prepara o documento para assinatura.</li>
                                <li><Badge variant="outline"><UploadCloud className="h-3 w-3 mr-1"/> Upload Doc. Assinado</Badge>: Para "enviar" o arquivo .p7s ou PDF assinado.</li>
                                <li><Badge variant="outline"><Eye className="h-3 w-3 mr-1"/> Ver Detalhes Assinatura</Badge>: Mostra informações da assinatura simulada.</li>
                            </ul>
                        </li>
                        <li><Badge variant="destructive"><Trash2 className="h-3 w-3 mr-1"/> Excluir Documento</Badge>.</li>
                    </ul>
                </li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="whatsapp" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Lembretes WhatsApp
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p>Facilite o envio de lembretes de consulta para seus pacientes.</p>
              <ol>
                <li>Filtre as consultas por proximidade (Todas, Próximas 24h, Próximas 48h) ou busque por nome/telefone.</li>
                <li>Clique em <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1"/> Lembrete</Badge> ao lado da consulta desejada.</li>
                <li>No diálogo:
                    <ul>
                        <li>Escolha um <Badge>Modelo de Mensagem</Badge> ou escreva uma mensagem personalizada. Os placeholders (ex: <code>{"{{paciente_primeiro_nome}}"}</code>) serão preenchidos automaticamente.</li>
                        <li>Clique em <Badge variant="outline"><Mailbox className="h-3 w-3 mr-1"/>Gerar Link WhatsApp</Badge>.</li>
                        <li>Copie o link gerado ou clique em <Badge><ExternalLink className="h-3 w-3 mr-1"/>Abrir no WhatsApp</Badge> para enviar a mensagem (requer WhatsApp Web/Desktop conectado).</li>
                    </ul>
                </li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="settings" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="p-4 hover:no-underline text-lg">
            <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Configurações
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p>Ajuste suas informações de perfil e preferências da plataforma.</p>
              <ul>
                <li>Altere seu nome e email.</li>
                <li>(Simulado) Altere sua foto de perfil.</li>
                <li>Gerencie preferências de notificação (ex: Notificações por Email).</li>
                <li>Clique em <Badge><Save className="h-3 w-3 mr-1"/>Salvar Alterações</Badge> para aplicar.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}

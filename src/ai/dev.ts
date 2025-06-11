
import { config } from 'dotenv';
config();

import './flows/generate-session-insights'; // Importação do fluxo de insights de sessão
import './flows/analyze-complaints-flow'; 
import './flows/analyze-correlation-flow'; 
import './flows/summarize-clinical-notes-flow'; // Adicionado o novo fluxo

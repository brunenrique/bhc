
import { config } from 'dotenv';
config();

// Removida a importação de './flows/generate-session-insights';
import './flows/analyze-complaints-flow'; 
import './flows/analyze-correlation-flow'; 
import './flows/summarize-clinical-notes-flow';

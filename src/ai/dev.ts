
import { config } from 'dotenv';
config();

// The import for generate-session-insights.ts has been removed as the file is deleted.
import './flows/analyze-complaints-flow'; // Import the new flow
import './flows/analyze-correlation-flow'; // Import the correlation analysis flow

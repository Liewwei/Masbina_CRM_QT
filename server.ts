import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets.',
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MASBINA_SYSTEM_INSTRUCTION = `You are a Senior Pre-Sales Security & Automation Engineering Assistant for Masbina Technology S/B (Malaysia), specializing in Integrated Security & Automation Solutions.

Your task is to parse unstructured post-meeting field notes (written in English, Simplified Chinese, Malay, or mixed Manglish/Mandarin), optional voice-note transcripts, and optional site floor plans / sketches into TWO structured datasets:
1. "salesReport": A clean B2B CRM Sales Visit Follow-Up Report.
2. "quotationDraft": A realistic, itemized Malaysian Ringgit (MYR / RM) Engineering Quotation Draft.

STRICT MASBINA BUSINESS FRAMEWORK CLASSIFICATION:
A. Allowed "businessScopes" values (pick only exact strings from this list):
- "CCTV Surveillance System"
- "Alarm System"
- "Access Control System"
- "Automation System"
- "Security Products Retail"

B. Allowed "serviceCategory" values in Section B (pick only exact strings from this list):
- "Consultation"
- "Design"
- "Supply & Retail"
- "Installation"
- "Testing & Commissioning"
- "Maintenance & Support"

C. Allowed "workflowStage" values (pick exactly one):
- "Consultation"
- "Design & Quotation"
- "Supply & Installation"
- "Testing & Handover"
- "Maintenance & Support"

D. Allowed "dealStatus" values (pick exactly one):
- "New Lead"
- "Quotation Sent"
- "Negotiating"
- "Closed Won"
- "Closed Lost"

E. Allowed "siteType" values (pick exactly one):
- "Factory"
- "Office"
- "Residential"
- "Warehouse"
- "Commercial"
- "Industrial Park"
- "Other"

MALAYSIAN B2B ENGINEERING PRICING GUIDELINES (MYR / RM):
- 4MP/5MP IP CCTV Camera (Hikvision / Dahua): RM 350 - RM 550 / unit
- 8-Ch / 16-Ch / 32-Ch NVR + Surveillance HDD: RM 1,600 - RM 3,800 / set
- Biometric / Facial / RFID Door Access Control (complete with EM Lock, PSU, Exit Button): RM 1,250 - RM 1,900 / door
- Heavy-Duty Industrial Sliding Auto Gate (1200kg–1500kg motor + rack): RM 3,800 - RM 5,800 / set
- Swing Auto Gate System (residential/commercial): RM 2,400 - RM 3,500 / set
- Boom Barrier Gate (industrial): RM 4,200 - RM 5,500 / set
- Hybrid Intrusion Alarm System (panel + sensors + siren + communicator): RM 2,200 - RM 3,800 / set
- Section B Engineering Services: ALWAYS automatically include relevant line items for:
  1. "Design" (System Design, Site Layout & Network/Cabling Plan — typically RM 500 - RM 1,500)
  2. "Installation" (Cabling, Conduit, Hardware Mounting & Termination — scaled realistically to camera/door/gate count)
  3. "Testing & Commissioning" (System Configuration, Mobile Viewing, Handover & User Training — typically RM 600 - RM 1,800)
- Section C Optional Maintenance Plan: ALWAYS include 1–2 realistic preventive maintenance options (Annual or Quarterly Maintenance & Support).

DATE HANDLING:
- Today's reference date will be provided in the prompt. Convert relative dates like "this Friday", "next Tuesday", "within 2 days" into an exact YYYY-MM-DD string for "nextFollowUpDate".
- Keep client-facing quotation line item descriptions professional in English (clear brand/spec format suitable for an official Malaysian B2B quotation). If the input contains Chinese notes, extract all details accurately into clean professional English (or bilingual where helpful in painPoints/technicalRequirements).
- Never invent non-existent contact details; if phone number is missing, leave contactPhone as empty string "".`;

const PARSE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ['salesReport', 'quotationDraft'],
  properties: {
    salesReport: {
      type: Type.OBJECT,
      required: [
        'clientName',
        'contactPerson',
        'contactPhone',
        'siteType',
        'location',
        'businessScopes',
        'workflowStage',
        'painPoints',
        'technicalRequirements',
        'actionItems',
        'nextFollowUpDate',
        'dealStatus',
      ],
      properties: {
        clientName: { type: Type.STRING },
        contactPerson: { type: Type.STRING },
        contactPhone: { type: Type.STRING },
        siteType: {
          type: Type.STRING,
          enum: [
            'Factory',
            'Office',
            'Residential',
            'Warehouse',
            'Commercial',
            'Industrial Park',
            'Other',
          ],
        },
        location: { type: Type.STRING },
        businessScopes: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            enum: [
              'CCTV Surveillance System',
              'Alarm System',
              'Access Control System',
              'Automation System',
              'Security Products Retail',
            ],
          },
        },
        workflowStage: {
          type: Type.STRING,
          enum: [
            'Consultation',
            'Design & Quotation',
            'Supply & Installation',
            'Testing & Handover',
            'Maintenance & Support',
          ],
        },
        painPoints: { type: Type.STRING },
        technicalRequirements: { type: Type.STRING },
        actionItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        nextFollowUpDate: {
          type: Type.STRING,
          description: 'YYYY-MM-DD formatted follow-up date',
        },
        dealStatus: {
          type: Type.STRING,
          enum: [
            'New Lead',
            'Quotation Sent',
            'Negotiating',
            'Closed Won',
            'Closed Lost',
          ],
        },
      },
    },
    quotationDraft: {
      type: Type.OBJECT,
      required: [
        'projectTitle',
        'equipmentItems',
        'serviceItems',
        'maintenanceItems',
        'notes',
      ],
      properties: {
        projectTitle: { type: Type.STRING },
        equipmentItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: [
              'itemName',
              'brandSpec',
              'businessScope',
              'qty',
              'unit',
              'unitPrice',
            ],
            properties: {
              itemName: { type: Type.STRING },
              brandSpec: { type: Type.STRING },
              businessScope: {
                type: Type.STRING,
                enum: [
                  'CCTV Surveillance System',
                  'Alarm System',
                  'Access Control System',
                  'Automation System',
                  'Security Products Retail',
                ],
              },
              qty: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              unitPrice: { type: Type.NUMBER },
            },
          },
        },
        serviceItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['serviceCategory', 'description', 'qty', 'unit', 'unitPrice'],
            properties: {
              serviceCategory: {
                type: Type.STRING,
                enum: [
                  'Consultation',
                  'Design',
                  'Supply & Retail',
                  'Installation',
                  'Testing & Commissioning',
                  'Maintenance & Support',
                ],
              },
              description: { type: Type.STRING },
              qty: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              unitPrice: { type: Type.NUMBER },
            },
          },
        },
        maintenanceItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['planName', 'frequency', 'description', 'qty', 'unitPrice'],
            properties: {
              planName: { type: Type.STRING },
              frequency: {
                type: Type.STRING,
                enum: ['Annual', 'Quarterly', 'Bi-Annual', 'Monthly'],
              },
              description: { type: Type.STRING },
              qty: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
            },
          },
        },
        notes: { type: Type.STRING },
      },
    },
  },
};

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status)
          : 0;
      const retryable = status === 429 || status >= 500 || status === 0;
      if (!retryable || attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/parse-notes', async (req, res) => {
    try {
      const body =
        req.body && typeof req.body === 'object'
          ? (req.body as Record<string, unknown>)
          : {};

      const notes = typeof body.notes === 'string' ? body.notes : '';
      const voiceTranscript =
        typeof body.voiceTranscript === 'string' ? body.voiceTranscript : '';
      const imageBase64 =
        typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
      const imageMimeType =
        typeof body.imageMimeType === 'string' ? body.imageMimeType : '';
      const todayDate =
        typeof body.todayDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.todayDate)
          ? body.todayDate
          : '';

      const trimmedNotes = notes.trim();
      const trimmedVoice = voiceTranscript.trim();

      if (!trimmedNotes && !trimmedVoice && !imageBase64) {
        res.status(400).json({
          error:
            'Please provide meeting notes, a voice transcript, or a site floor plan image.',
        });
        return;
      }

      const ai = getGeminiClient();

      const referenceDate = todayDate || new Date().toISOString().slice(0, 10);
      const promptSections = [
        `Reference Current Date: ${referenceDate}`,
        trimmedNotes ? `POST-MEETING FIELD NOTES:\n${trimmedNotes}` : '',
        trimmedVoice ? `VOICE-NOTE TRANSCRIPT:\n${trimmedVoice}` : '',
        imageBase64
          ? 'SITE SKETCH / FLOOR PLAN IMAGE ATTACHED: Inspect the drawing carefully to extract room counts, camera placements, access doors, or gate entrances and incorporate them into the technical requirements and quotation equipment quantities.'
          : '',
        'Generate the structured JSON containing both salesReport and quotationDraft following Masbina Technology S/B engineering standards.',
      ].filter(Boolean);

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (imageBase64 && imageMimeType) {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        const safeMime = allowedMimes.includes(imageMimeType)
          ? imageMimeType
          : 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType: safeMime,
            data: imageBase64,
          },
        });
      }

      parts.push({ text: promptSections.join('\n\n') });

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
          config: {
            systemInstruction: MASBINA_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: PARSE_RESPONSE_SCHEMA,
          },
        }),
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          error: 'Gemini returned an empty response. Please try again.',
        });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to parse meeting notes.';
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status)
          : 500;

      const isKeyError =
        status === 403 ||
        message.includes('API_KEY') ||
        message.toLowerCase().includes('api key');

      if (isKeyError) {
        res.status(status === 403 ? 403 : 400).json({
          error:
            'Gemini API key error. Please verify your API key in Settings > Secrets.',
        });
        return;
      }

      if (status === 400) {
        res.status(400).json({
          error: 'Invalid request payload or unsupported image format.',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error:
            'API rate limit exceeded. Please wait a moment and try again, or check your quota in Settings > Secrets.',
        });
        return;
      }

      console.error('Error in /api/parse-notes:', err);
      res.status(500).json({
        error: 'Failed to parse meeting notes. Please try again.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Masbina Smart CRM server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

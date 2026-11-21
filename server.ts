import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { formatCctvCatalogForPrompt } from './src/data/priceCatalog.ts';

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

${formatCctvCatalogForPrompt()}

OTHER MALAYSIAN B2B ENGINEERING PRICING GUIDELINES (MYR / RM — FOR NON-CCTV ITEMS):
- Biometric / Facial / RFID Door Access Control (complete with EM Lock, PSU, Exit Button): RM 1,250 - RM 1,900 / door
- Heavy-Duty Industrial Sliding Auto Gate (1200kg–1500kg motor + rack): RM 3,800 - RM 5,800 / set
- Swing Auto Gate System (residential/commercial): RM 2,400 - RM 3,500 / set
- Boom Barrier Gate (industrial): RM 4,200 - RM 5,500 / set
- Hybrid Intrusion Alarm System (panel + sensors + siren + communicator): RM 2,200 - RM 3,800 / set
- Section B Engineering Services: ALWAYS automatically include relevant line items for:
  1. "Design" (for CCTV, use the exact catalog rates RM 250–RM 800 / Lot; for multi-system projects scale accordingly up to RM 1,500)
  2. "Installation" (for CCTV, ALWAYS bill per camera point using RM 250 / RM 280 / RM 320 per Point with unit "Points" and qty matching total cameras; add non-CCTV installation items if doors/gates/alarms are requested)
  3. "Testing & Commissioning" (for CCTV, use the exact catalog rates RM 300–RM 850 / Lot; scale up to RM 1,800 for multi-system projects)
- Section C Optional Maintenance Plan: ALWAYS include 1–2 realistic preventive maintenance options (for CCTV, apply RM 600/yr Small, RM 1,100/yr Medium, or RM 2,200/yr Industrial Quarterly).

MULTIMODAL DOCUMENT & SITE IMAGE ANALYSIS:
- When a PDF document (tender, BOQ, engineering specification, quotation comparison, floor plan), text/CSV/Markdown document, or site image/photo is attached, thoroughly read EVERY page, table, callout, and visual detail.
- Extract all client details, site location, camera/door/gate/alarm quantities, technical specifications, cable/conduit/installation requirements, and target deadlines.
- Map EVERY identified CCTV hardware, engineering service (Design, Installation per point, Testing & Commissioning), and preventive maintenance item directly to Masbina Technology S/B's exact MYR Standard Price Catalog above so both "salesReport" and "quotationDraft" are accurate and ready to issue.
- LARGE TENDER / BOQ CONSOLIDATION RULE: For large multi-page tender or BOQ documents, consolidate repetitive or minor sub-components (such as screws, connectors, RJ45 plugs, patch cords, brackets, fasteners, conduit accessories) into clean grouped line items, and keep "equipmentItems" within at most 25 clear, high-impact items so the structured JSON response is always complete and never truncated.

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

const INLINE_MULTIMODAL_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const TEXT_DOCUMENT_MIMES = new Set([
  'text/plain',
  'text/csv',
  'text/markdown',
]);

const MAX_BASE64_PAYLOAD_CHARS = 22 * 1024 * 1024; // ~16 MB decoded binary safety cap
const MAX_DECODED_TEXT_CHARS = 200_000;

function resolveUploadMimeType(rawMime: string, fileName: string): string {
  const mime = rawMime.trim().toLowerCase();
  if (INLINE_MULTIMODAL_MIMES.has(mime) || TEXT_DOCUMENT_MIMES.has(mime)) {
    return mime;
  }
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.pdf')) return 'application/pdf';
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  if (lowerName.endsWith('.csv')) return 'text/csv';
  if (lowerName.endsWith('.md')) return 'text/markdown';
  if (lowerName.endsWith('.txt')) return 'text/plain';
  return mime;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    const aiConfigured = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim(),
    );
    res.json({ ok: true, status: 'ok', aiConfigured });
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
      const fileBase64 =
        typeof body.fileBase64 === 'string' && body.fileBase64.trim()
          ? body.fileBase64.trim()
          : typeof body.imageBase64 === 'string'
            ? body.imageBase64.trim()
            : '';
      const rawFileMimeType =
        typeof body.fileMimeType === 'string' && body.fileMimeType.trim()
          ? body.fileMimeType.trim()
          : typeof body.imageMimeType === 'string'
            ? body.imageMimeType.trim()
            : '';
      const fileName =
        typeof body.fileName === 'string'
          ? body.fileName.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 140)
          : '';
      const todayDate =
        typeof body.todayDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.todayDate)
          ? body.todayDate
          : '';

      const trimmedNotes = notes.trim();
      const trimmedVoice = voiceTranscript.trim();

      if (!trimmedNotes && !trimmedVoice && !fileBase64) {
        res.status(400).json({
          error:
            'Please provide meeting notes, a voice transcript, or upload a document/site image.',
        });
        return;
      }

      if (fileBase64 && fileBase64.length > MAX_BASE64_PAYLOAD_CHARS) {
        res.status(400).json({
          error: 'Uploaded file exceeds the 15 MB limit. Please upload a smaller file.',
        });
        return;
      }

      const resolvedMime = fileBase64
        ? resolveUploadMimeType(rawFileMimeType, fileName)
        : '';

      const isInlineMultimodal =
        Boolean(fileBase64) && INLINE_MULTIMODAL_MIMES.has(resolvedMime);
      const isTextDocument =
        Boolean(fileBase64) &&
        (TEXT_DOCUMENT_MIMES.has(resolvedMime) ||
          /\.(txt|csv|md)$/i.test(fileName));

      if (fileBase64 && !isInlineMultimodal && !isTextDocument) {
        res.status(400).json({
          error:
            'Unsupported file format. Please upload PDF, TXT, CSV, MD, PNG, JPG, or WEBP.',
        });
        return;
      }

      const ai = getGeminiClient();

      const referenceDate = todayDate || new Date().toISOString().slice(0, 10);
      const safeDocLabel = fileName || (resolvedMime === 'application/pdf' ? 'document.pdf' : 'attachment');

      let decodedDocumentBlock = '';
      if (isTextDocument) {
        const decodedText = Buffer.from(fileBase64, 'base64')
          .toString('utf8')
          .slice(0, MAX_DECODED_TEXT_CHARS)
          .trim();
        if (decodedText) {
          decodedDocumentBlock = `=== UPLOADED DOCUMENT (${safeDocLabel}) ===\n${decodedText}`;
        }
      }

      const attachmentHint = isInlineMultimodal
        ? resolvedMime === 'application/pdf'
          ? `UPLOADED PDF DOCUMENT (${safeDocLabel}): Read all pages, BOQ tables, scope specifications, drawings, client details, quantities, and timelines thoroughly, and map all items to Masbina's MYR price catalog.`
          : `SITE SKETCH / FLOOR PLAN / PHOTO ATTACHED (${safeDocLabel}): Inspect the image carefully to extract room counts, camera placements, access doors, or gate entrances and incorporate them into the technical requirements and quotation equipment quantities.`
        : '';

      const promptSections = [
        `Reference Current Date: ${referenceDate}`,
        trimmedNotes ? `POST-MEETING FIELD NOTES:\n${trimmedNotes}` : '',
        trimmedVoice ? `VOICE-NOTE TRANSCRIPT:\n${trimmedVoice}` : '',
        decodedDocumentBlock,
        attachmentHint,
        'Generate the structured JSON containing both salesReport and quotationDraft following Masbina Technology S/B engineering standards and exact MYR catalog pricing.',
      ].filter(Boolean);

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (isInlineMultimodal) {
        parts.push({
          inlineData: {
            mimeType: resolvedMime,
            data: fileBase64,
          },
        });
      }

      parts.push({ text: promptSections.join('\n\n') });

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: MASBINA_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: PARSE_RESPONSE_SCHEMA,
            maxOutputTokens: 32768,
          },
        }),
      );

      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        res.status(422).json({
          error:
            'The uploaded document was too long and the AI output reached its token limit. Please upload only the BOQ / Scope of Work pages or paste the key requirements.',
        });
        return;
      }

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          error: 'Gemini returned an empty response. Please try again.',
        });
        return;
      }

      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleanedText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected parsing error.';
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
          error: `Invalid request or unsupported document format: ${message}`,
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
        error: `Failed to parse document: ${message}`,
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

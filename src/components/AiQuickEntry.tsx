import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  CrmRecord,
  EngineeringQuotation,
  Language,
  ParsedMeetingResponse,
} from '../types/masbina.ts';
import {
  UI_TEXT,
  getScopeLabel,
  getServiceLabel,
  getSiteTypeLabel,
  getStageLabel,
  getStatusLabel,
} from '../data/i18n.ts';
import {
  DEFAULT_TERMS_AND_CONDITIONS,
  addDaysISO,
  computeQuotationTotals,
  formatRM,
  generateNextQuoteRef,
  getTodayISO,
} from '../data/seedData.ts';
import {
  CCTV_QUOTATION_PRESETS,
  type CctvQuotationPreset,
  createQuotationFromCctvPreset,
} from '../data/priceCatalog.ts';

interface AiQuickEntryProps {
  lang: Language;
  existingQuotations: EngineeringQuotation[];
  onSaveGeneratedBundle: (record: CrmRecord, quotation: EngineeringQuotation) => void;
  onCreatePresetQuotation: (quotation: EngineeringQuotation) => void;
  onOpenCrmRecord: (recordId: string) => void;
  onOpenQuotation: (quotationId: string) => void;
  preparedBy?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type AttachmentKind = 'image' | 'pdf' | 'text';

interface UploadedAttachment {
  kind: AttachmentKind;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  typeLabel: string;
  fileBase64: string;
  imagePreviewUrl: string | null;
}

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED_UPLOAD_ATTR =
  'application/pdf,text/plain,text/csv,text/markdown,image/png,image/jpeg,image/webp,.pdf,.txt,.csv,.md,.png,.jpg,.jpeg,.webp';

function classifyUploadFile(file: File): {
  kind: AttachmentKind;
  mimeType: string;
  typeLabel: string;
} | null {
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();

  if (
    mime === 'image/png' ||
    mime === 'image/jpeg' ||
    mime === 'image/webp' ||
    /\.(png|jpe?g|webp)$/i.test(name)
  ) {
    const resolvedMime =
      mime === 'image/png' || name.endsWith('.png')
        ? 'image/png'
        : mime === 'image/webp' || name.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';
    const typeLabel =
      resolvedMime === 'image/png'
        ? 'PNG'
        : resolvedMime === 'image/webp'
          ? 'WEBP'
          : 'JPG';
    return { kind: 'image', mimeType: resolvedMime, typeLabel };
  }

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return { kind: 'pdf', mimeType: 'application/pdf', typeLabel: 'PDF' };
  }

  if (mime === 'text/csv' || name.endsWith('.csv')) {
    return { kind: 'text', mimeType: 'text/csv', typeLabel: 'CSV' };
  }

  if (mime === 'text/markdown' || name.endsWith('.md')) {
    return { kind: 'text', mimeType: 'text/markdown', typeLabel: 'MD' };
  }

  if (mime === 'text/plain' || name.endsWith('.txt')) {
    return { kind: 'text', mimeType: 'text/plain', typeLabel: 'TXT' };
  }

  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AiQuickEntry({
  lang,
  existingQuotations,
  onSaveGeneratedBundle,
  onCreatePresetQuotation,
  onOpenCrmRecord,
  onOpenQuotation,
  preparedBy,
}: AiQuickEntryProps) {
  const t = UI_TEXT[lang];

  const [aiStatus, setAiStatus] = useState<'checking' | 'connected' | 'missing'>(
    'checking',
  );
  const [notes, setNotes] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [attachment, setAttachment] = useState<UploadedAttachment | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'report' | 'quotation'>('report');
  const [lastResult, setLastResult] = useState<{
    record: CrmRecord;
    quotation: EngineeringQuotation;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { aiConfigured?: boolean }) => {
        if (!cancelled) {
          setAiStatus(data.aiConfigured ? 'connected' : 'missing');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAiStatus('missing');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClear = () => {
    setNotes('');
    setVoiceTranscript('');
    setAttachment(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const classified = classifyUploadFile(file);
    if (!classified) {
      setErrorMsg(
        lang === 'en'
          ? 'Unsupported file type. Please upload PDF, TXT, CSV, MD, PNG, JPG, or WEBP.'
          : '不支持的文件格式，请上传 PDF、TXT、CSV、MD、PNG、JPG 或 WEBP 文件。',
      );
      e.target.value = '';
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMsg(
        lang === 'en'
          ? 'File must be smaller than 15 MB.'
          : '上传文件大小不能超过 15 MB。',
      );
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx !== -1) {
        setAttachment({
          kind: classified.kind,
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: classified.mimeType,
          typeLabel: classified.typeLabel,
          fileBase64: dataUrl.slice(commaIdx + 1),
          imagePreviewUrl: classified.kind === 'image' ? dataUrl : null,
        });
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleVoiceDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSpeechNotice(t.dictateUnsupported);
      return;
    }

    setSpeechNotice(null);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-MY';

    recognition.onresult = (event) => {
      let appended = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          appended += `${event.results[i][0].transcript} `;
        }
      }
      if (appended.trim()) {
        setVoiceTranscript((prev) => (prev ? `${prev}\n${appended.trim()}` : appended.trim()));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleGenerate = async () => {
    if (!notes.trim() && !voiceTranscript.trim() && !attachment?.fileBase64) {
      setErrorMsg(
        lang === 'en'
          ? 'Enter field notes, a voice transcript, or upload a document/site image first.'
          : '请先输入拜访记录、粘贴语音文本或上传工程文档/现场图片。',
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/parse-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          voiceTranscript,
          fileBase64: attachment?.fileBase64 ?? null,
          fileMimeType: attachment?.fileMimeType ?? null,
          fileName: attachment?.fileName ?? null,
          todayDate: getTodayISO(),
        }),
      });

      const data = (await response.json()) as ParsedMeetingResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      const nowIso = new Date().toISOString();
      const crmId = `crm-${crypto.randomUUID()}`;
      const quoteId = `qt-${crypto.randomUUID()}`;
      const quoteRef = generateNextQuoteRef(existingQuotations);

      const newRecord: CrmRecord = {
        id: crmId,
        clientName: data.salesReport.clientName || 'Unnamed Client',
        contactPerson: data.salesReport.contactPerson || '',
        contactPhone: data.salesReport.contactPhone || '',
        siteType: data.salesReport.siteType || 'Other',
        location: data.salesReport.location || '',
        businessScopes:
          data.salesReport.businessScopes?.length > 0
            ? data.salesReport.businessScopes
            : ['CCTV Surveillance System'],
        workflowStage: data.salesReport.workflowStage || 'Design & Quotation',
        painPoints: data.salesReport.painPoints || '',
        technicalRequirements: data.salesReport.technicalRequirements || '',
        actionItems: data.salesReport.actionItems || [],
        nextFollowUpDate: data.salesReport.nextFollowUpDate || addDaysISO(3),
        dealStatus: data.salesReport.dealStatus || 'New Lead',
        rawNotes: [notes, voiceTranscript].filter(Boolean).join('\n\n'),
        linkedQuotationId: quoteId,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const newQuotation: EngineeringQuotation = {
        id: quoteId,
        quoteRef,
        linkedCrmId: crmId,
        clientName: newRecord.clientName,
        contactPerson: newRecord.contactPerson,
        contactPhone: newRecord.contactPhone,
        siteLocation: newRecord.location,
        projectTitle:
          data.quotationDraft.projectTitle ||
          `Security & Automation Proposal for ${newRecord.clientName}`,
        preparedBy: preparedBy || 'Masbina Engineering Sales Team',
        issueDate: getTodayISO(),
        validityDate: addDaysISO(30),
        equipmentItems: (data.quotationDraft.equipmentItems || []).map((item) => ({
          id: `eq-${crypto.randomUUID()}`,
          itemName: item.itemName,
          brandSpec: item.brandSpec || 'Standard Industrial Spec',
          businessScope: item.businessScope || 'CCTV Surveillance System',
          qty: Number(item.qty) || 1,
          unit: item.unit || 'Units',
          unitPrice: Number(item.unitPrice) || 0,
        })),
        serviceItems: (data.quotationDraft.serviceItems || []).map((item) => ({
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: item.serviceCategory || 'Installation',
          description: item.description,
          qty: Number(item.qty) || 1,
          unit: item.unit || 'Lot',
          unitPrice: Number(item.unitPrice) || 0,
        })),
        maintenanceItems: (data.quotationDraft.maintenanceItems || []).map((item) => ({
          id: `mt-${crypto.randomUUID()}`,
          planName: item.planName,
          frequency: item.frequency || 'Annual',
          description: item.description,
          qty: Number(item.qty) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
        includeMaintenanceInTotal: false,
        discountType: 'fixed',
        discountValue: 0,
        sstRate: 8,
        termsAndConditions: [...DEFAULT_TERMS_AND_CONDITIONS],
        notes: data.quotationDraft.notes || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      onSaveGeneratedBundle(newRecord, newQuotation);
      setLastResult({ record: newRecord, quotation: newQuotation });
      setActivePreviewTab('report');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to process meeting notes.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const previewTotals = lastResult
    ? computeQuotationTotals(lastResult.quotation)
    : null;

  const handleInstantCctvPreset = (preset: CctvQuotationPreset) => {
    const newQuotation = createQuotationFromCctvPreset(preset, {
      quoteRef: generateNextQuoteRef(existingQuotations),
      issueDate: getTodayISO(),
      validityDate: addDaysISO(30),
      termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
      preparedBy: preparedBy || 'Masbina Engineering Sales Team',
    });
    onCreatePresetQuotation(newQuotation);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Live Gemini Connection Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t.quickEntryTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            {t.quickEntrySubtitle}
          </p>
        </div>

        {aiStatus !== 'checking' && (
          <div
            role="status"
            className={`inline-flex items-center gap-1.5 self-start rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
              aiStatus === 'connected'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {aiStatus === 'connected' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{t.aiStatusConnected}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>{t.aiStatusMissing}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Instant CCTV Quotation Presets Bar */}
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600 shrink-0" />
              <h2 className="text-xs font-semibold text-slate-900">
                {t.instantCctvPresetsLabel}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.instantCctvPresetsHint}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CCTV_QUOTATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleInstantCctvPreset(preset)}
                className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-800 hover:border-blue-300 hover:bg-blue-100/80 transition-colors whitespace-nowrap"
              >
                <span>{lang === 'zh' ? preset.labelZh : preset.labelEn}</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-stretch">
        {/* Left Column: Input Console */}
        <section className="xl:col-span-6 flex flex-col rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">
              {t.rawNotesLabel}
            </h2>
            {(notes || voiceTranscript || attachment) && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.clearBtn}
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-slate-200">
            {/* Primary Notes Textarea */}
            <div className="p-5">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={7}
                placeholder={t.rawNotesPlaceholder}
                className="w-full resize-y rounded-md border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Voice-Note Transcript / Dictation Section */}
            <div className="p-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  {t.voiceTabLabel}
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isListening
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      {t.dictateStop}
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-blue-600" />
                      {t.dictateStart}
                    </>
                  )}
                </button>
              </div>
              {speechNotice && (
                <p className="text-xs text-amber-700">{speechNotice}</p>
              )}
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                rows={3}
                placeholder={t.voicePlaceholder}
                className="w-full resize-y rounded-md border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Document & Site Image Upload */}
            <div className="p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.imageUploadLabel}
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.imageUploadHint}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_UPLOAD_ATTR}
                  onChange={handleFileChange}
                  className="hidden"
                  id="site-document-upload"
                />
                <label
                  htmlFor="site-document-upload"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                  {t.attachFileBtn}
                </label>
              </div>

              {attachment && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {attachment.kind === 'image' && attachment.imagePreviewUrl ? (
                      <img
                        src={attachment.imagePreviewUrl}
                        alt="Uploaded site image"
                        referrerPolicy="no-referrer"
                        className="h-14 w-20 rounded border border-slate-200 object-cover bg-white shrink-0"
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded border ${
                          attachment.kind === 'pdf'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-blue-200 bg-blue-50 text-blue-700'
                        }`}
                      >
                        {attachment.typeLabel === 'CSV' ? (
                          <FileSpreadsheet className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                        <span className="mt-0.5 font-mono text-[9px] font-bold leading-none">
                          {attachment.typeLabel}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">
                        {attachment.fileName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums">
                        {attachment.typeLabel} · {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.removeImage}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 space-y-3">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.generatingBtn}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.generateBtn}
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Live Structured Output Preview */}
        <section className="xl:col-span-6 flex flex-col rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActivePreviewTab('report')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  activePreviewTab === 'report'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.tabReportPreview}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('quotation')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  activePreviewTab === 'quotation'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.tabQuotePreview}
              </button>
            </div>

            {lastResult && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {t.savedToWorkspace}
              </span>
            )}
          </div>

          <div className="flex-1 p-5">
            {isLoading ? (
              <div className="space-y-4 py-4" aria-busy="true">
                <div className="h-5 w-2/5 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" />
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-20 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ) : !lastResult ? (
              <div className="flex h-full flex-col justify-between py-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {t.outputEmptyTitle}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                    {t.outputEmptyDesc}
                  </p>
                </div>

                {/* Masbina Knowledge Base Reference Table */}
                <div className="mt-8 border-t border-slate-200 pt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {lang === 'en' ? '01. Business Scopes' : '01. 主要业务范围'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {lang === 'en'
                        ? 'CCTV Surveillance System · Alarm System · Access Control System · Automation System · Security Products Retail'
                        : '闭路电视监控系统 · 防盗报警系统 · 门禁及出入管理系统 · 自动化系统 · 保安系统产品零售'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {lang === 'en' ? '02. Engineering Services' : '02. 工程服务分类'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {lang === 'en'
                        ? 'Consultation · Design · Supply & Retail · Installation · Testing & Commissioning · Maintenance & Support'
                        : '客户咨询 · 系统设计 · 产品供应及零售 · 工程安装 · 测试与系统调试 · 定期维护及技术支援'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {lang === 'en' ? '03. CRM Pipeline Stages' : '03. 工程跟进阶段'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {lang === 'en'
                        ? 'Consultation → Design & Quotation → Supply & Installation → Testing & Handover → Maintenance & Support'
                        : '客户需求分析 → 系统设计与报价 → 产品供应与现场施工 → 测试验收与交付 → 定期维护与售后'}
                    </p>
                  </div>
                </div>
              </div>
            ) : activePreviewTab === 'report' ? (
              <div className="space-y-5">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {lastResult.record.clientName}
                    </h3>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {lastResult.quotation.quoteRef}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                    <span>{lastResult.record.contactPerson || '—'}</span>
                    {lastResult.record.contactPhone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {lastResult.record.contactPhone}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{getSiteTypeLabel(lastResult.record.siteType, lang)}</span>
                    {lastResult.record.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{lastResult.record.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-b border-slate-200 pb-4 text-xs">
                  <div>
                    <dt className="text-slate-500">{t.fieldWorkflowStage}</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      {getStageLabel(lastResult.record.workflowStage, lang)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t.fieldDealStatus}</dt>
                    <dd className="mt-1 font-semibold text-blue-700">
                      {getStatusLabel(lastResult.record.dealStatus, lang)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t.fieldNextFollowUp}</dt>
                    <dd className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                      {lastResult.record.nextFollowUpDate}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500">
                    {t.fieldScopes}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {lastResult.record.businessScopes
                      .map((s) => getScopeLabel(s, lang))
                      .join(' · ')}
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">
                      {t.fieldPainPoints}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {lastResult.record.painPoints || '—'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">
                      {t.fieldTechReq}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {lastResult.record.technicalRequirements || '—'}
                    </p>
                  </div>
                  {lastResult.record.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500">
                        {lang === 'en' ? 'Action Items' : '下一步行动项'}
                      </h4>
                      <ul className="mt-1.5 space-y-1 text-sm text-slate-700 list-disc pl-4">
                        {lastResult.record.actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {lastResult.quotation.projectTitle}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                      {lastResult.quotation.quoteRef}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {lastResult.quotation.clientName} · {lastResult.quotation.siteLocation}
                  </p>
                </div>

                {/* Section A Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-2">
                    {t.sectionATitle}
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">{t.colItem}</th>
                          <th className="px-3 py-2 font-medium text-right">{t.colQty}</th>
                          <th className="px-3 py-2 font-medium text-right">{t.colTotal}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lastResult.quotation.equipmentItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-900">{item.itemName}</div>
                              <div className="text-[11px] text-slate-500">{item.brandSpec}</div>
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                              {item.qty} {item.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                              {formatRM(item.qty * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section B Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-2">
                    {t.sectionBTitle}
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-md">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {lastResult.quotation.serviceItems.map((svc) => (
                          <tr key={svc.id}>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-slate-800">
                                {getServiceLabel(svc.serviceCategory, lang)}
                              </span>
                              <span className="mx-1.5 text-slate-300">/</span>
                              <span className="text-slate-600">{svc.description}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                              {formatRM(svc.qty * svc.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Totals Strip */}
                {previewTotals && (
                  <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between text-sm">
                    <span className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'Estimated Total (incl. 8% SST, excl. optional maintenance)'
                        : '预估报价总计（含 8% SST，不含选配维护）'}
                    </span>
                    <span className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {formatRM(previewTotals.grandTotal)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Navigation Footer when Result Exists */}
          {lastResult && (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5">
              <button
                type="button"
                onClick={() => onOpenCrmRecord(lastResult.record.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {t.openInCrm}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenQuotation(lastResult.quotation.id)}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {t.openInQuotation}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

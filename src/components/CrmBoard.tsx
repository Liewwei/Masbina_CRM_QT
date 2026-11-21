import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALL_BUSINESS_SCOPES,
  ALL_DEAL_STATUSES,
  ALL_SITE_TYPES,
  ALL_WORKFLOW_STAGES,
  type BusinessScope,
  type CrmRecord,
  type DealStatus,
  type EngineeringQuotation,
  type Language,
  type SiteType,
  type WorkflowStage,
} from '../types/masbina.ts';
import {
  UI_TEXT,
  getScopeLabel,
  getSiteTypeLabel,
  getStageLabel,
  getStatusLabel,
} from '../data/i18n.ts';
import {
  addDaysISO,
  computeQuotationTotals,
  formatRM,
} from '../data/seedData.ts';

interface CrmBoardProps {
  lang: Language;
  records: CrmRecord[];
  quotations: EngineeringQuotation[];
  selectedRecordId: string | null;
  onSelectRecord: (id: string | null) => void;
  onAddRecord: (record: CrmRecord) => void;
  onUpdateRecord: (record: CrmRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenQuotation: (quotationId: string) => void;
  onCreateQuotationForRecord: (record: CrmRecord) => void;
}

function getStatusTextClass(status: DealStatus): string {
  switch (status) {
    case 'Closed Won':
      return 'text-emerald-700 font-semibold';
    case 'Negotiating':
      return 'text-amber-700 font-semibold';
    case 'Quotation Sent':
      return 'text-blue-700 font-semibold';
    case 'Closed Lost':
      return 'text-red-700 font-medium';
    default:
      return 'text-slate-700 font-medium';
  }
}

export function CrmBoard({
  lang,
  records,
  quotations,
  selectedRecordId,
  onSelectRecord,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onOpenQuotation,
  onCreateQuotationForRecord,
}: CrmBoardProps) {
  const t = UI_TEXT[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [stageFilter, setStageFilter] = useState<WorkflowStage | 'ALL'>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const quotationById = useMemo(() => {
    const map = new Map<string, EngineeringQuotation>();
    for (const q of quotations) {
      map.set(q.id, q);
    }
    return map;
  }, [quotations]);

  const getRecordQuoteValue = (record: CrmRecord): number => {
    if (!record.linkedQuotationId) return 0;
    const q = quotationById.get(record.linkedQuotationId);
    if (!q) return 0;
    return computeQuotationTotals(q).grandTotal;
  };

  const kpis = useMemo(() => {
    let activePipeline = 0;
    let closedWon = 0;
    let inQuoteOrNegotiating = 0;

    for (const r of records) {
      const val = getRecordQuoteValue(r);
      if (r.dealStatus === 'Closed Won') {
        closedWon += val;
      } else if (r.dealStatus !== 'Closed Lost') {
        activePipeline += val;
      }
      if (r.dealStatus === 'Quotation Sent' || r.dealStatus === 'Negotiating') {
        inQuoteOrNegotiating += 1;
      }
    }

    return {
      activePipeline,
      totalVisits: records.length,
      inQuoteOrNegotiating,
      closedWon,
    };
  }, [records, quotationById]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      if (statusFilter !== 'ALL' && rec.dealStatus !== statusFilter) return false;
      if (stageFilter !== 'ALL' && rec.workflowStage !== stageFilter) return false;
      if (!q) return true;
      const haystack = [
        rec.clientName,
        rec.contactPerson,
        rec.contactPhone,
        rec.location,
        rec.painPoints,
        rec.technicalRequirements,
        rec.businessScopes.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [records, searchQuery, statusFilter, stageFilter]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  const handleCreateNewRecord = () => {
    const now = new Date().toISOString();
    const fresh: CrmRecord = {
      id: `crm-${Date.now()}`,
      clientName: lang === 'en' ? 'New Client Sdn Bhd' : '新客户有限公司',
      contactPerson: '',
      contactPhone: '',
      siteType: 'Factory',
      location: '',
      businessScopes: ['CCTV Surveillance System'],
      workflowStage: 'Consultation',
      painPoints: '',
      technicalRequirements: '',
      actionItems: [],
      nextFollowUpDate: addDaysISO(3),
      dealStatus: 'New Lead',
      createdAt: now,
      updatedAt: now,
    };
    onAddRecord(fresh);
    onSelectRecord(fresh.id);
  };

  const patchSelected = (patch: Partial<CrmRecord>) => {
    if (!selectedRecord) return;
    onUpdateRecord({
      ...selectedRecord,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleScope = (scope: BusinessScope) => {
    if (!selectedRecord) return;
    const exists = selectedRecord.businessScopes.includes(scope);
    const nextScopes = exists
      ? selectedRecord.businessScopes.filter((s) => s !== scope)
      : [...selectedRecord.businessScopes, scope];
    patchSelected({ businessScopes: nextScopes });
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t.crmTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.crmSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleCreateNewRecord}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t.newRecordBtn}
        </button>
      </div>

      {/* 4-Column Pipeline KPI Strip (Flat Single-Elevation Surface with Hairline Dividers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiPipelineValue}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {formatRM(kpis.activePipeline)}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiTotalVisits}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {kpis.totalVisits}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiQuotationStage}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-blue-700 tabular-nums">
            {kpis.inQuoteOrNegotiating}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiClosedWon}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-emerald-700 tabular-nums">
            {formatRM(kpis.closedWon)}
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as WorkflowStage | 'ALL')}
            aria-label={t.colStage}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">{t.allStages}</option>
            {ALL_WORKFLOW_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {getStageLabel(stage, lang)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Segmented Filter */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-md bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.allStatuses}
          </button>
          {ALL_DEAL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getStatusLabel(status, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Table + Optional Inline Detail Drawer */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        <div
          className={`${
            selectedRecord ? 'xl:col-span-7' : 'xl:col-span-12'
          } rounded-lg border border-slate-200 bg-white overflow-hidden`}
        >
          {filteredRecords.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {t.emptyCrmTitle}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t.emptyCrmDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="px-4 py-3">{t.colClient}</th>
                    <th className="px-4 py-3">{t.colContact}</th>
                    {!selectedRecord && (
                      <th className="px-4 py-3">{t.colScopes}</th>
                    )}
                    <th className="px-4 py-3">{t.colStage}</th>
                    <th className="px-4 py-3">{t.colStatus}</th>
                    <th className="px-4 py-3">{t.colFollowUp}</th>
                    <th className="px-4 py-3 text-right">{t.colEstimate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredRecords.map((rec) => {
                    const isSelected = rec.id === selectedRecordId;
                    const quoteVal = getRecordQuoteValue(rec);
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => {
                          onSelectRecord(rec.id);
                          setConfirmDeleteId(null);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/70'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {rec.clientName}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {getSiteTypeLabel(rec.siteType, lang)}
                            {rec.location ? ` · ${rec.location}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-800">
                            {rec.contactPerson || '—'}
                          </div>
                          {rec.contactPhone && (
                            <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                              {rec.contactPhone}
                            </div>
                          )}
                        </td>
                        {!selectedRecord && (
                          <td className="px-4 py-3 align-top max-w-[240px]">
                            <p className="text-xs leading-relaxed text-slate-600">
                              {rec.businessScopes
                                .map((s) => getScopeLabel(s, lang))
                                .join(' · ')}
                            </p>
                          </td>
                        )}
                        <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-slate-700">
                          {getStageLabel(rec.workflowStage, lang)}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-xs">
                          <span className={getStatusTextClass(rec.dealStatus)}>
                            {getStatusLabel(rec.dealStatus, lang)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap font-mono text-xs text-slate-700 tabular-nums">
                          {rec.nextFollowUpDate || '—'}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-right font-mono text-xs font-medium text-slate-900 tabular-nums">
                          {quoteVal > 0 ? formatRM(quoteVal) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Detail Editor Panel */}
        {selectedRecord && (
          <aside className="xl:col-span-5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.editDrawerTitle}
                </h2>
                <p className="text-[11px] text-slate-500">{t.saveChanges}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectRecord(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t.closePanel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* Client & Contact */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {t.fieldClientName}
                </label>
                <input
                  type="text"
                  value={selectedRecord.clientName}
                  onChange={(e) => patchSelected({ clientName: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldContactPerson}
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.contactPerson}
                    onChange={(e) => patchSelected({ contactPerson: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldContactPhone}
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.contactPhone}
                    onChange={(e) => patchSelected({ contactPhone: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Site Type & Location */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldSiteType}
                  </label>
                  <select
                    value={selectedRecord.siteType}
                    onChange={(e) =>
                      patchSelected({ siteType: e.target.value as SiteType })
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {ALL_SITE_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {getSiteTypeLabel(st, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldLocation}
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.location}
                    onChange={(e) => patchSelected({ location: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Business Scopes Multi-Select Buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t.fieldScopes}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_BUSINESS_SCOPES.map((scope) => {
                    const active = selectedRecord.businessScopes.includes(scope);
                    return (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => toggleScope(scope)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {getScopeLabel(scope, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workflow Stage, Deal Status, Follow-Up Date */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldWorkflowStage}
                  </label>
                  <select
                    value={selectedRecord.workflowStage}
                    onChange={(e) =>
                      patchSelected({
                        workflowStage: e.target.value as WorkflowStage,
                      })
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {ALL_WORKFLOW_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {getStageLabel(stage, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldDealStatus}
                  </label>
                  <select
                    value={selectedRecord.dealStatus}
                    onChange={(e) =>
                      patchSelected({ dealStatus: e.target.value as DealStatus })
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {ALL_DEAL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {getStatusLabel(st, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t.fieldNextFollowUp}
                  </label>
                  <input
                    type="date"
                    value={selectedRecord.nextFollowUpDate}
                    onChange={(e) =>
                      patchSelected({ nextFollowUpDate: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pain Points & Technical Requirements */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {t.fieldPainPoints}
                </label>
                <textarea
                  rows={2}
                  value={selectedRecord.painPoints}
                  onChange={(e) => patchSelected({ painPoints: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {t.fieldTechReq}
                </label>
                <textarea
                  rows={3}
                  value={selectedRecord.technicalRequirements}
                  onChange={(e) =>
                    patchSelected({ technicalRequirements: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {t.fieldActionItems}
                </label>
                <textarea
                  rows={3}
                  value={selectedRecord.actionItems.join('\n')}
                  onChange={(e) =>
                    patchSelected({
                      actionItems: e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Actions: Linked Quotation & Delete */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5">
              {confirmDeleteId === selectedRecord.id ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteRecord(selectedRecord.id);
                      setConfirmDeleteId(null);
                    }}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    {t.confirmDelete}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {t.cancel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(selectedRecord.id)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.deleteRecord}
                </button>
              )}

              {selectedRecord.linkedQuotationId &&
              quotationById.has(selectedRecord.linkedQuotationId) ? (
                <button
                  type="button"
                  onClick={() => onOpenQuotation(selectedRecord.linkedQuotationId!)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                >
                  {t.viewLinkedQuote}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateQuotationForRecord(selectedRecord)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.createLinkedQuote}
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

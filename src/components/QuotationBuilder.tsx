import { useMemo, useState } from 'react';
import {
  Copy,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ALL_BUSINESS_SCOPES,
  ALL_ENGINEERING_SERVICES,
  type BusinessScope,
  type EngineeringQuotation,
  type EngineeringServiceType,
  type EquipmentLineItem,
  type Language,
  type MaintenanceLineItem,
  type ServiceLineItem,
} from '../types/masbina.ts';
import { UI_TEXT, getScopeLabel, getServiceLabel } from '../data/i18n.ts';
import {
  DEFAULT_TERMS_AND_CONDITIONS,
  addDaysISO,
  computeQuotationTotals,
  formatRM,
  generateNextQuoteRef,
  getTodayISO,
} from '../data/seedData.ts';
import { QuotationPreviewModal } from './QuotationPreviewModal.tsx';

interface QuotationBuilderProps {
  lang: Language;
  quotations: EngineeringQuotation[];
  activeQuotationId: string | null;
  onSelectQuotation: (id: string) => void;
  onAddQuotation: (quote: EngineeringQuotation) => void;
  onUpdateQuotation: (quote: EngineeringQuotation) => void;
  onDeleteQuotation: (id: string) => void;
}

export function QuotationBuilder({
  lang,
  quotations,
  activeQuotationId,
  onSelectQuotation,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
}: QuotationBuilderProps) {
  const t = UI_TEXT[lang];
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activeQuote = useMemo(() => {
    if (quotations.length === 0) return null;
    return quotations.find((q) => q.id === activeQuotationId) ?? quotations[0];
  }, [quotations, activeQuotationId]);

  const totals = useMemo(
    () => (activeQuote ? computeQuotationTotals(activeQuote) : null),
    [activeQuote],
  );

  const patchQuote = (patch: Partial<EngineeringQuotation>) => {
    if (!activeQuote) return;
    onUpdateQuotation({
      ...activeQuote,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCreateBlank = () => {
    const now = new Date().toISOString();
    const fresh: EngineeringQuotation = {
      id: `qt-${crypto.randomUUID()}`,
      quoteRef: generateNextQuoteRef(quotations),
      clientName: '',
      contactPerson: '',
      contactPhone: '',
      siteLocation: '',
      projectTitle: 'Integrated Security & Automation System Proposal',
      preparedBy: 'Masbina Engineering Sales Team',
      issueDate: getTodayISO(),
      validityDate: addDaysISO(30),
      equipmentItems: [
        {
          id: `eq-${crypto.randomUUID()}`,
          itemName: '4MP IP CCTV Camera (Outdoor Weatherproof)',
          brandSpec: 'Hikvision / Dahua Industrial Series',
          businessScope: 'CCTV Surveillance System',
          qty: 4,
          unit: 'Units',
          unitPrice: 420,
        },
      ],
      serviceItems: [
        {
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Design',
          description: 'System Layout Design & Technical Site Planning',
          qty: 1,
          unit: 'Lot',
          unitPrice: 600,
        },
        {
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Installation',
          description: 'Structured Cabling, Conduit & Equipment Installation',
          qty: 1,
          unit: 'Lot',
          unitPrice: 1800,
        },
        {
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Testing & Commissioning',
          description: 'System Configuration, Testing, Handover & User Training',
          qty: 1,
          unit: 'Lot',
          unitPrice: 700,
        },
      ],
      maintenanceItems: [
        {
          id: `mt-${crypto.randomUUID()}`,
          planName: 'Annual Preventive Maintenance & Priority Support',
          frequency: 'Annual',
          description:
            'Quarterly preventive inspection, firmware audit, and on-site technical support.',
          qty: 1,
          unitPrice: 1800,
        },
      ],
      includeMaintenanceInTotal: false,
      discountType: 'fixed',
      discountValue: 0,
      sstRate: 8,
      termsAndConditions: [...DEFAULT_TERMS_AND_CONDITIONS],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    onAddQuotation(fresh);
    onSelectQuotation(fresh.id);
    setConfirmDelete(false);
  };

  const handleDuplicate = () => {
    if (!activeQuote) return;
    const now = new Date().toISOString();
    const copy: EngineeringQuotation = {
      ...activeQuote,
      id: `qt-${crypto.randomUUID()}`,
      quoteRef: generateNextQuoteRef(quotations),
      linkedCrmId: undefined,
      issueDate: getTodayISO(),
      validityDate: addDaysISO(30),
      equipmentItems: activeQuote.equipmentItems.map((i) => ({
        ...i,
        id: `eq-${crypto.randomUUID()}`,
      })),
      serviceItems: activeQuote.serviceItems.map((i) => ({
        ...i,
        id: `sv-${crypto.randomUUID()}`,
      })),
      maintenanceItems: activeQuote.maintenanceItems.map((i) => ({
        ...i,
        id: `mt-${crypto.randomUUID()}`,
      })),
      createdAt: now,
      updatedAt: now,
    };
    onAddQuotation(copy);
    onSelectQuotation(copy.id);
  };

  // Equipment CRUD
  const addEquipmentRow = () => {
    if (!activeQuote) return;
    const nextItem: EquipmentLineItem = {
      id: `eq-${crypto.randomUUID()}`,
      itemName: '',
      brandSpec: '',
      businessScope: 'CCTV Surveillance System',
      qty: 1,
      unit: 'Units',
      unitPrice: 0,
    };
    patchQuote({ equipmentItems: [...activeQuote.equipmentItems, nextItem] });
  };

  const updateEquipmentRow = (
    id: string,
    patch: Partial<EquipmentLineItem>,
  ) => {
    if (!activeQuote) return;
    patchQuote({
      equipmentItems: activeQuote.equipmentItems.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    });
  };

  const deleteEquipmentRow = (id: string) => {
    if (!activeQuote) return;
    patchQuote({
      equipmentItems: activeQuote.equipmentItems.filter((row) => row.id !== id),
    });
  };

  // Service CRUD
  const addServiceRow = () => {
    if (!activeQuote) return;
    const nextItem: ServiceLineItem = {
      id: `sv-${crypto.randomUUID()}`,
      serviceCategory: 'Installation',
      description: '',
      qty: 1,
      unit: 'Lot',
      unitPrice: 0,
    };
    patchQuote({ serviceItems: [...activeQuote.serviceItems, nextItem] });
  };

  const updateServiceRow = (id: string, patch: Partial<ServiceLineItem>) => {
    if (!activeQuote) return;
    patchQuote({
      serviceItems: activeQuote.serviceItems.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    });
  };

  const deleteServiceRow = (id: string) => {
    if (!activeQuote) return;
    patchQuote({
      serviceItems: activeQuote.serviceItems.filter((row) => row.id !== id),
    });
  };

  // Maintenance CRUD
  const addMaintenanceRow = () => {
    if (!activeQuote) return;
    const nextItem: MaintenanceLineItem = {
      id: `mt-${crypto.randomUUID()}`,
      planName: 'Quarterly Preventive Maintenance Package',
      frequency: 'Annual',
      description: '4 scheduled preventive inspections per year + priority troubleshooting.',
      qty: 1,
      unitPrice: 1800,
    };
    patchQuote({
      maintenanceItems: [...activeQuote.maintenanceItems, nextItem],
    });
  };

  const updateMaintenanceRow = (
    id: string,
    patch: Partial<MaintenanceLineItem>,
  ) => {
    if (!activeQuote) return;
    patchQuote({
      maintenanceItems: activeQuote.maintenanceItems.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    });
  };

  const deleteMaintenanceRow = (id: string) => {
    if (!activeQuote) return;
    patchQuote({
      maintenanceItems: activeQuote.maintenanceItems.filter(
        (row) => row.id !== id,
      ),
    });
  };

  if (!activeQuote || !totals) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.emptyQuotationTitle}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">{t.emptyQuotationDesc}</p>
        <button
          type="button"
          onClick={handleCreateBlank}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t.newQuotationBtn}
        </button>
      </div>
    );
  }

  return (
    <>
    <div className={`space-y-6 ${showPreview ? 'no-print' : ''}`}>
      {/* Page Title & Action Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t.quoteTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.quoteSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateBlank}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.newQuotationBtn}
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Copy className="h-3.5 w-3.5" />
            {t.duplicateQuotationBtn}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" />
            {t.previewPrintBtn}
          </button>
        </div>
      </div>

      {/* Quotation Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
          <label
            htmlFor="active-quotation-select"
            className="text-xs font-medium text-slate-500 whitespace-nowrap"
          >
            {t.selectQuotation}:
          </label>
          <select
            id="active-quotation-select"
            value={activeQuote.id}
            onChange={(e) => {
              onSelectQuotation(e.target.value);
              setConfirmDelete(false);
            }}
            className="max-w-lg flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
          >
            {quotations.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quoteRef} — {q.clientName || 'Untitled Client'} (
                {formatRM(computeQuotationTotals(q).grandTotal)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onDeleteQuotation(activeQuote.id);
                  setConfirmDelete(false);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                {t.confirmDelete}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {t.cancel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {lang === 'en' ? 'Delete' : '删除'}
            </button>
          )}
        </div>
      </div>

      {/* Quotation Header Metadata */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.quoteRefLabel}
            </label>
            <input
              type="text"
              value={activeQuote.quoteRef}
              onChange={(e) => patchQuote({ quoteRef: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.issueDateLabel}
            </label>
            <input
              type="date"
              value={activeQuote.issueDate}
              onChange={(e) => patchQuote({ issueDate: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.validityDateLabel}
            </label>
            <input
              type="date"
              value={activeQuote.validityDate}
              onChange={(e) => patchQuote({ validityDate: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.preparedByLabel}
            </label>
            <input
              type="text"
              value={activeQuote.preparedBy}
              onChange={(e) => patchQuote({ preparedBy: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fieldClientName}
            </label>
            <input
              type="text"
              value={activeQuote.clientName}
              onChange={(e) => patchQuote({ clientName: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fieldContactPerson}
            </label>
            <input
              type="text"
              value={activeQuote.contactPerson}
              onChange={(e) => patchQuote({ contactPerson: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fieldContactPhone}
            </label>
            <input
              type="text"
              value={activeQuote.contactPhone}
              onChange={(e) => patchQuote({ contactPhone: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.projectTitleLabel}
            </label>
            <input
              type="text"
              value={activeQuote.projectTitle}
              onChange={(e) => patchQuote({ projectTitle: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fieldLocation}
            </label>
            <input
              type="text"
              value={activeQuote.siteLocation}
              onChange={(e) => patchQuote({ siteLocation: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION A: Equipment Supply & Retail */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {t.sectionATitle}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {formatRM(totals.equipmentSubtotal)}
            </span>
            <button
              type="button"
              onClick={addEquipmentRow}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              {t.addEquipment}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5 min-w-[210px]">{t.colItem}</th>
                <th className="px-3 py-2.5 min-w-[180px]">{t.colBrandSpec}</th>
                <th className="px-3 py-2.5 min-w-[170px]">{t.colScope}</th>
                <th className="px-3 py-2.5 w-20 text-right">{t.colQty}</th>
                <th className="px-3 py-2.5 w-24">{t.colUnit}</th>
                <th className="px-3 py-2.5 w-32 text-right">{t.colUnitPrice}</th>
                <th className="px-4 py-2.5 w-32 text-right">{t.colTotal}</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {activeQuote.equipmentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, { itemName: e.target.value })
                      }
                      placeholder="Item description"
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-900 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.brandSpec}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, { brandSpec: e.target.value })
                      }
                      placeholder="Brand / Model"
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs text-slate-700 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.businessScope}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, {
                          businessScope: e.target.value as BusinessScope,
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                    >
                      {ALL_BUSINESS_SCOPES.map((sc) => (
                        <option key={sc} value={sc}>
                          {getScopeLabel(sc, lang)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={item.qty}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, {
                          qty: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, { unit: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateEquipmentRow(item.id, {
                          unitPrice: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-medium tabular-nums text-slate-900 whitespace-nowrap">
                    {formatRM(item.qty * item.unitPrice)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteEquipmentRow(item.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove equipment line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION B: Engineering Services */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-900">
            {t.sectionBTitle}
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {formatRM(totals.serviceSubtotal)}
            </span>
            <button
              type="button"
              onClick={addServiceRow}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              {t.addService}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5 w-52">{t.colCategory}</th>
                <th className="px-3 py-2.5 min-w-[260px]">{t.colItem}</th>
                <th className="px-3 py-2.5 w-20 text-right">{t.colQty}</th>
                <th className="px-3 py-2.5 w-24">{t.colUnit}</th>
                <th className="px-3 py-2.5 w-32 text-right">{t.colUnitPrice}</th>
                <th className="px-4 py-2.5 w-32 text-right">{t.colTotal}</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {activeQuote.serviceItems.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <select
                      value={svc.serviceCategory}
                      onChange={(e) =>
                        updateServiceRow(svc.id, {
                          serviceCategory: e.target.value as EngineeringServiceType,
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                    >
                      {ALL_ENGINEERING_SERVICES.map((cat) => (
                        <option key={cat} value={cat}>
                          {getServiceLabel(cat, lang)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={svc.description}
                      onChange={(e) =>
                        updateServiceRow(svc.id, { description: e.target.value })
                      }
                      placeholder="Engineering service scope"
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-900 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={svc.qty}
                      onChange={(e) =>
                        updateServiceRow(svc.id, {
                          qty: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={svc.unit}
                      onChange={(e) =>
                        updateServiceRow(svc.id, { unit: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={svc.unitPrice}
                      onChange={(e) =>
                        updateServiceRow(svc.id, {
                          unitPrice: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-medium tabular-nums text-slate-900 whitespace-nowrap">
                    {formatRM(svc.qty * svc.unitPrice)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteServiceRow(svc.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove engineering service line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION C: Optional Maintenance Plan */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {t.sectionCTitle}
            </h2>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={activeQuote.includeMaintenanceInTotal}
                onChange={(e) =>
                  patchQuote({ includeMaintenanceInTotal: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>{t.includeMaintenanceLabel}</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {formatRM(totals.maintenanceSubtotal)}
            </span>
            <button
              type="button"
              onClick={addMaintenanceRow}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              {t.addMaintenance}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5 min-w-[200px]">{t.colItem}</th>
                <th className="px-3 py-2.5 min-w-[240px]">
                  {lang === 'en' ? 'Coverage Details' : '维护服务内容'}
                </th>
                <th className="px-3 py-2.5 w-32">{t.colFrequency}</th>
                <th className="px-3 py-2.5 w-20 text-right">{t.colQty}</th>
                <th className="px-3 py-2.5 w-32 text-right">{t.colUnitPrice}</th>
                <th className="px-4 py-2.5 w-32 text-right">{t.colTotal}</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {activeQuote.maintenanceItems.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={m.planName}
                      onChange={(e) =>
                        updateMaintenanceRow(m.id, { planName: e.target.value })
                      }
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-slate-900 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={m.description}
                      onChange={(e) =>
                        updateMaintenanceRow(m.id, { description: e.target.value })
                      }
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs text-slate-700 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={m.frequency}
                      onChange={(e) =>
                        updateMaintenanceRow(m.id, {
                          frequency: e.target.value as MaintenanceLineItem['frequency'],
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Annual">Annual</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Bi-Annual">Bi-Annual</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={m.qty}
                      onChange={(e) =>
                        updateMaintenanceRow(m.id, {
                          qty: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={m.unitPrice}
                      onChange={(e) =>
                        updateMaintenanceRow(m.id, {
                          unitPrice: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-medium tabular-nums text-slate-900 whitespace-nowrap">
                    {formatRM(m.qty * m.unitPrice)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteMaintenanceRow(m.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove maintenance line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom 2-Column Split: Terms & Remarks (Left) + Real-Time Financial Summary (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <section className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={activeQuote.notes}
              onChange={(e) => patchQuote({ notes: e.target.value })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.termsLabel}
            </label>
            <textarea
              rows={6}
              value={activeQuote.termsAndConditions.join('\n')}
              onChange={(e) =>
                patchQuote({
                  termsAndConditions: e.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </section>

        {/* Financial Calculator Card */}
        <section className="lg:col-span-5 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">
              {lang === 'en' ? 'Quotation Financial Summary' : '报价金额汇总 (MYR)'}
            </h2>
          </div>

          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t.subtotalEquipment}</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatRM(totals.equipmentSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t.subtotalServices}</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatRM(totals.serviceSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>
                {t.subtotalMaintenance}
                {!activeQuote.includeMaintenanceInTotal && (
                  <span className="block text-[11px] text-slate-400">
                    {t.optionalExcluded}
                  </span>
                )}
              </span>
              <span
                className={`font-mono tabular-nums font-medium ${
                  activeQuote.includeMaintenanceInTotal
                    ? 'text-slate-900'
                    : 'text-slate-400 line-through'
                }`}
              >
                {formatRM(totals.maintenanceSubtotal)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-medium text-slate-900">
              <span>{t.combinedSubtotal}</span>
              <span className="font-mono tabular-nums">
                {formatRM(totals.combinedSubtotal)}
              </span>
            </div>

            {/* Discount Control */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs font-medium text-slate-600">
                {t.discountLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => patchQuote({ discountType: 'fixed' })}
                    className={`rounded px-2 py-1 font-mono text-[11px] font-medium ${
                      activeQuote.discountType === 'fixed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    RM
                  </button>
                  <button
                    type="button"
                    onClick={() => patchQuote({ discountType: 'percent' })}
                    className={`rounded px-2 py-1 font-mono text-[11px] font-medium ${
                      activeQuote.discountType === 'percent'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    %
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={activeQuote.discountValue}
                  onChange={(e) =>
                    patchQuote({
                      discountValue: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-24 rounded-md border border-slate-200 px-2.5 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700">
                <span>{lang === 'en' ? 'Discount Applied' : '已减免金额'}</span>
                <span className="font-mono tabular-nums font-medium">
                  - {formatRM(totals.discountAmount)}
                </span>
              </div>
            )}

            {/* SST 0% / 8% Toggle */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs font-medium text-slate-600">
                {t.sstLabel}
              </span>
              <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => patchQuote({ sstRate: 0 })}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeQuote.sstRate === 0
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => patchQuote({ sstRate: 8 })}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeQuote.sstRate === 8
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  8% SST
                </button>
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>
                {activeQuote.sstRate === 8 ? t.sstEight : t.sstZero}
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatRM(totals.sstAmount)}
              </span>
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="flex items-baseline justify-between bg-[#0F172A] px-5 py-4 text-white">
            <span className="text-xs font-semibold tracking-wide">
              {t.grandTotalLabel}
            </span>
            <span className="font-mono text-xl font-semibold tabular-nums">
              {formatRM(totals.grandTotal)}
            </span>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {t.previewPrintBtn}
            </button>
          </div>
        </section>
      </div>
    </div>

    {/* Formal Quotation Print/PDF Preview Modal */}
    {showPreview && (
      <QuotationPreviewModal
        quotation={activeQuote}
        lang={lang}
        onClose={() => setShowPreview(false)}
      />
    )}
    </>
  );
}

import { useEffect, useState } from 'react';
import type {
  CrmRecord,
  EngineeringQuotation,
  Language,
  NavSection,
} from './types/masbina.ts';
import { UI_TEXT } from './data/i18n.ts';
import {
  DEFAULT_TERMS_AND_CONDITIONS,
  INITIAL_CRM_RECORDS,
  INITIAL_QUOTATIONS,
  addDaysISO,
  generateNextQuoteRef,
  getTodayISO,
} from './data/seedData.ts';
import { MobileMenuButton, Sidebar } from './components/Sidebar.tsx';
import { AiQuickEntry } from './components/AiQuickEntry.tsx';
import { CrmBoard } from './components/CrmBoard.tsx';
import { QuotationBuilder } from './components/QuotationBuilder.tsx';

const STORAGE_KEYS = {
  crm: 'masbina_crm_records_v1',
  quotations: 'masbina_quotations_v1',
  lang: 'masbina_ui_lang_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEYS.lang);
    return saved === 'zh' ? 'zh' : 'en';
  });

  const [activeSection, setActiveSection] = useState<NavSection>('quick-entry');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [crmRecords, setCrmRecords] = useState<CrmRecord[]>(() =>
    loadFromStorage<CrmRecord[]>(STORAGE_KEYS.crm, INITIAL_CRM_RECORDS),
  );
  const [quotations, setQuotations] = useState<EngineeringQuotation[]>(() =>
    loadFromStorage<EngineeringQuotation[]>(
      STORAGE_KEYS.quotations,
      INITIAL_QUOTATIONS,
    ),
  );

  const [selectedCrmId, setSelectedCrmId] = useState<string | null>(null);
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(
    () => quotations[0]?.id ?? null,
  );

  // Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.crm, JSON.stringify(crmRecords));
    } catch {
      // Ignore storage quota errors
    }
  }, [crmRecords]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.quotations,
        JSON.stringify(quotations),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [quotations]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      // Ignore storage quota errors
    }
  }, [lang]);

  const handleSaveGeneratedBundle = (
    record: CrmRecord,
    quotation: EngineeringQuotation,
  ) => {
    setCrmRecords((prev) => [record, ...prev]);
    setQuotations((prev) => [quotation, ...prev]);
    setSelectedCrmId(record.id);
    setActiveQuotationId(quotation.id);
  };

  const handleAddCrmRecord = (record: CrmRecord) => {
    setCrmRecords((prev) => [record, ...prev]);
  };

  const handleUpdateCrmRecord = (updated: CrmRecord) => {
    setCrmRecords((prev) =>
      prev.map((rec) => (rec.id === updated.id ? updated : rec)),
    );
  };

  const handleDeleteCrmRecord = (id: string) => {
    setCrmRecords((prev) => prev.filter((rec) => rec.id !== id));
    if (selectedCrmId === id) {
      setSelectedCrmId(null);
    }
  };

  const handleAddQuotation = (quote: EngineeringQuotation) => {
    setQuotations((prev) => [quote, ...prev]);
    setActiveQuotationId(quote.id);
  };

  const handleUpdateQuotation = (updated: EngineeringQuotation) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q)),
    );
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotations((prev) => {
      const remaining = prev.filter((q) => q.id !== id);
      if (activeQuotationId === id) {
        setActiveQuotationId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

  const handleOpenCrmRecord = (recordId: string) => {
    setSelectedCrmId(recordId);
    setActiveSection('crm-board');
  };

  const handleOpenQuotation = (quotationId: string) => {
    setActiveQuotationId(quotationId);
    setActiveSection('quotation-builder');
  };

  const handleCreateQuotationForRecord = (record: CrmRecord) => {
    const now = new Date().toISOString();
    const newQuote: EngineeringQuotation = {
      id: `qt-${Date.now()}`,
      quoteRef: generateNextQuoteRef(quotations),
      linkedCrmId: record.id,
      clientName: record.clientName,
      contactPerson: record.contactPerson,
      contactPhone: record.contactPhone,
      siteLocation: record.location,
      projectTitle: `${record.businessScopes.join(' & ')} — ${record.clientName}`,
      preparedBy: 'Masbina Engineering Sales Team',
      issueDate: getTodayISO(),
      validityDate: addDaysISO(30),
      equipmentItems: [
        {
          id: `eq-${Date.now()}-1`,
          itemName: 'Security System Hardware Package',
          brandSpec: record.technicalRequirements || 'As per site requirement',
          businessScope: record.businessScopes[0] || 'CCTV Surveillance System',
          qty: 1,
          unit: 'Set',
          unitPrice: 2500,
        },
      ],
      serviceItems: [
        {
          id: `sv-${Date.now()}-1`,
          serviceCategory: 'Design',
          description: 'Site Survey & System Design Proposal',
          qty: 1,
          unit: 'Lot',
          unitPrice: 600,
        },
        {
          id: `sv-${Date.now()}-2`,
          serviceCategory: 'Installation',
          description: 'On-Site Cabling, Conduit & Hardware Installation',
          qty: 1,
          unit: 'Lot',
          unitPrice: 1800,
        },
        {
          id: `sv-${Date.now()}-3`,
          serviceCategory: 'Testing & Commissioning',
          description: 'System Testing, Commissioning & Client Handover',
          qty: 1,
          unit: 'Lot',
          unitPrice: 650,
        },
      ],
      maintenanceItems: [
        {
          id: `mt-${Date.now()}-1`,
          planName: 'Annual Preventive Maintenance & Technical Support',
          frequency: 'Annual',
          description:
            'Scheduled preventive inspections, health diagnostics, and priority support.',
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

    setQuotations((prev) => [newQuote, ...prev]);
    setCrmRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, linkedQuotationId: newQuote.id, updatedAt: now }
          : r,
      ),
    );
    setActiveQuotationId(newQuote.id);
    setActiveSection('quotation-builder');
  };

  const t = UI_TEXT[lang];
  const currentBreadcrumb =
    activeSection === 'quick-entry'
      ? t.navQuickEntry
      : activeSection === 'crm-board'
        ? t.navCrmBoard
        : t.navQuotationBuilder;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        lang={lang}
        onChangeLang={setLang}
        crmCount={crmRecords.length}
        quotationCount={quotations.length}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Contextual Top Bar (Breadcrumb Left, Quick Switch / Mobile Menu Right) */}
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <MobileMenuButton onClick={() => setMobileNavOpen(true)} />
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-medium text-slate-500 min-w-0"
            >
              <span className="truncate whitespace-nowrap text-slate-600">
                Masbina Smart CRM
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span className="truncate whitespace-nowrap font-semibold text-slate-900">
                {currentBreadcrumb}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
            </button>
          </div>
        </header>

        {/* Active Module Canvas */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1360px]">
            {activeSection === 'quick-entry' && (
              <AiQuickEntry
                lang={lang}
                existingQuotations={quotations}
                onSaveGeneratedBundle={handleSaveGeneratedBundle}
                onOpenCrmRecord={handleOpenCrmRecord}
                onOpenQuotation={handleOpenQuotation}
              />
            )}

            {activeSection === 'crm-board' && (
              <CrmBoard
                lang={lang}
                records={crmRecords}
                quotations={quotations}
                selectedRecordId={selectedCrmId}
                onSelectRecord={setSelectedCrmId}
                onAddRecord={handleAddCrmRecord}
                onUpdateRecord={handleUpdateCrmRecord}
                onDeleteRecord={handleDeleteCrmRecord}
                onOpenQuotation={handleOpenQuotation}
                onCreateQuotationForRecord={handleCreateQuotationForRecord}
              />
            )}

            {activeSection === 'quotation-builder' && (
              <QuotationBuilder
                lang={lang}
                quotations={quotations}
                activeQuotationId={activeQuotationId}
                onSelectQuotation={setActiveQuotationId}
                onAddQuotation={handleAddQuotation}
                onUpdateQuotation={handleUpdateQuotation}
                onDeleteQuotation={handleDeleteQuotation}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

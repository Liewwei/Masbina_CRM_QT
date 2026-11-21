import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LogOut, X } from 'lucide-react';
import type {
  AppUser,
  AuthSession,
  CrmRecord,
  EngineeringQuotation,
  Language,
  NavSection,
  UserRole,
} from './types/masbina.ts';
import { UI_TEXT } from './data/i18n.ts';
import {
  DEFAULT_TERMS_AND_CONDITIONS,
  INITIAL_CRM_RECORDS,
  INITIAL_QUOTATIONS,
  INITIAL_USERS,
  addDaysISO,
  generateNextQuoteRef,
  getTodayISO,
  isValidPassword,
} from './data/seedData.ts';
import { AuthPage } from './components/AuthPage.tsx';
import { MobileMenuButton, Sidebar } from './components/Sidebar.tsx';
import { RoleBadge } from './components/RoleBadge.tsx';
import { AiQuickEntry } from './components/AiQuickEntry.tsx';
import { CrmBoard } from './components/CrmBoard.tsx';
import { QuotationBuilder } from './components/QuotationBuilder.tsx';
import { UserManagement } from './components/UserManagement.tsx';

const STORAGE_KEYS = {
  crm: 'masbina_crm_records_v1',
  quotations: 'masbina_quotations_v1',
  lang: 'masbina_ui_lang_v1',
  users: 'masbina_users_v1',
  session: 'masbina_auth_session_v1',
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

  const [users, setUsers] = useState<AppUser[]>(() => {
    const loaded = loadFromStorage<AppUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    return Array.isArray(loaded)
      ? loaded.filter((u) => !u.id.startsWith('usr-seed-'))
      : INITIAL_USERS;
  });

  const [session, setSession] = useState<AuthSession | null>(() => {
    const loaded = loadFromStorage<AuthSession | null>(STORAGE_KEYS.session, null);
    if (loaded && loaded.userId.startsWith('usr-seed-')) {
      return null;
    }
    return loaded;
  });

  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('quick-entry');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [crmRecords, setCrmRecords] = useState<CrmRecord[]>(() => {
    const loaded = loadFromStorage<CrmRecord[]>(
      STORAGE_KEYS.crm,
      INITIAL_CRM_RECORDS,
    );
    return Array.isArray(loaded)
      ? loaded.filter((r) => !r.id.startsWith('crm-seed-'))
      : INITIAL_CRM_RECORDS;
  });

  const [quotations, setQuotations] = useState<EngineeringQuotation[]>(() => {
    const loaded = loadFromStorage<EngineeringQuotation[]>(
      STORAGE_KEYS.quotations,
      INITIAL_QUOTATIONS,
    );
    return Array.isArray(loaded)
      ? loaded.filter((q) => !q.id.startsWith('qt-seed-'))
      : INITIAL_QUOTATIONS;
  });

  const [selectedCrmId, setSelectedCrmId] = useState<string | null>(null);
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(
    () => quotations[0]?.id ?? null,
  );

  // Resolve live currentUser from users list so role/status changes apply immediately
  const currentUser = useMemo(() => {
    if (!session) return null;
    const found = users.find((u) => u.id === session.userId);
    if (!found || found.status !== 'Active') return null;
    return found;
  }, [session, users]);

  // Clear stale/suspended session automatically
  useEffect(() => {
    if (session && !currentUser) {
      setSession(null);
    }
  }, [session, currentUser]);

  // Guard activeSection so non-Admin users can never stay on user-management
  useEffect(() => {
    if (
      activeSection === 'user-management' &&
      currentUser?.role !== 'Admin'
    ) {
      setActiveSection('quick-entry');
    }
  }, [activeSection, currentUser]);

  // Persist state to localStorage
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
      window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    } catch {
      // Ignore storage quota errors
    }
  }, [users]);

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(
          STORAGE_KEYS.session,
          JSON.stringify(session),
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.session);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [session]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      // Ignore storage quota errors
    }
  }, [lang]);

  // Auth Handlers
  const handleSignInSuccess = (user: AppUser, welcomeMsg?: string) => {
    const now = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, lastLoginAt: now } : u)),
    );
    setSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      signedInAt: now,
    });
    setActiveSection('quick-entry');
    setWelcomeBanner(welcomeMsg ?? null);
  };

  const handleRegisterUser = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleResetPasswordByEmail = (email: string, newPassword: string) => {
    if (!isValidPassword(newPassword)) return;
    const normalized = email.trim().toLowerCase();
    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === normalized ? { ...u, password: newPassword } : u,
      ),
    );
  };

  const handleSignOut = () => {
    setSession(null);
    setWelcomeBanner(null);
    setActiveSection('quick-entry');
    setMobileNavOpen(false);
  };

  // Admin-Only User Management Handlers (with strict RBAC & last-active-Admin guards)
  const countActiveAdmins = (list: AppUser[]) =>
    list.filter((u) => u.role === 'Admin' && u.status === 'Active').length;

  const handleAdminAddUser = (newUser: AppUser) => {
    if (currentUser?.role !== 'Admin') return;
    if (!isValidPassword(newUser.password)) return;
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleAdminUpdateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== 'Admin') return;
    setUsers((prev) => {
      const target = prev.find((u) => u.id === userId);
      if (!target) return prev;
      if (
        target.role === 'Admin' &&
        target.status === 'Active' &&
        newRole !== 'Admin' &&
        countActiveAdmins(prev) <= 1
      ) {
        return prev;
      }
      return prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    });
  };

  const handleAdminResetUserPassword = (userId: string, newPassword: string) => {
    if (currentUser?.role !== 'Admin') return;
    if (!isValidPassword(newPassword)) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)),
    );
  };

  const handleAdminToggleUserStatus = (userId: string) => {
    if (currentUser?.role !== 'Admin') return;
    setUsers((prev) => {
      const target = prev.find((u) => u.id === userId);
      if (!target) return prev;
      if (
        target.role === 'Admin' &&
        target.status === 'Active' &&
        countActiveAdmins(prev) <= 1
      ) {
        return prev;
      }
      return prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u,
      );
    });
  };

  const handleAdminDeleteUser = (userId: string) => {
    if (currentUser?.role !== 'Admin') return;
    setUsers((prev) => {
      const target = prev.find((u) => u.id === userId);
      if (!target) return prev;
      if (
        target.role === 'Admin' &&
        target.status === 'Active' &&
        countActiveAdmins(prev) <= 1
      ) {
        return prev;
      }
      return prev.filter((u) => u.id !== userId);
    });
  };

  // CRM & Quotation Handlers
  const canDeleteRecordsAndQuotes = currentUser?.role !== 'Technical';

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
    if (!canDeleteRecordsAndQuotes) return;
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
    if (!canDeleteRecordsAndQuotes) return;
    const now = new Date().toISOString();
    setQuotations((prev) => {
      const remaining = prev.filter((q) => q.id !== id);
      if (activeQuotationId === id) {
        setActiveQuotationId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
    setCrmRecords((prev) =>
      prev.map((rec) =>
        rec.linkedQuotationId === id
          ? { ...rec, linkedQuotationId: undefined, updatedAt: now }
          : rec,
      ),
    );
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
      id: `qt-${crypto.randomUUID()}`,
      quoteRef: generateNextQuoteRef(quotations),
      linkedCrmId: record.id,
      clientName: record.clientName,
      contactPerson: record.contactPerson,
      contactPhone: record.contactPhone,
      siteLocation: record.location,
      projectTitle: `${record.businessScopes.join(' & ')} — ${record.clientName}`,
      preparedBy: currentUser?.fullName || 'Masbina Engineering Sales Team',
      issueDate: getTodayISO(),
      validityDate: addDaysISO(30),
      equipmentItems: [
        {
          id: `eq-${crypto.randomUUID()}`,
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
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Design',
          description: 'Site Survey & System Design Proposal',
          qty: 1,
          unit: 'Lot',
          unitPrice: 600,
        },
        {
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Installation',
          description: 'On-Site Cabling, Conduit & Hardware Installation',
          qty: 1,
          unit: 'Lot',
          unitPrice: 1800,
        },
        {
          id: `sv-${crypto.randomUUID()}`,
          serviceCategory: 'Testing & Commissioning',
          description: 'System Testing, Commissioning & Client Handover',
          qty: 1,
          unit: 'Lot',
          unitPrice: 650,
        },
      ],
      maintenanceItems: [
        {
          id: `mt-${crypto.randomUUID()}`,
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

  // Unauthenticated View -> Branded AuthPage
  if (!currentUser) {
    return (
      <AuthPage
        lang={lang}
        onChangeLang={setLang}
        users={users}
        onSignInSuccess={handleSignInSuccess}
        onRegisterUser={handleRegisterUser}
        onResetUserPasswordByEmail={handleResetPasswordByEmail}
      />
    );
  }

  const t = UI_TEXT[lang];
  const safeSection: NavSection =
    activeSection === 'user-management' && currentUser.role !== 'Admin'
      ? 'quick-entry'
      : activeSection;

  const currentBreadcrumb =
    safeSection === 'quick-entry'
      ? t.navQuickEntry
      : safeSection === 'crm-board'
        ? t.navCrmBoard
        : safeSection === 'quotation-builder'
          ? t.navQuotationBuilder
          : t.navUserManagement;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={safeSection}
        onSelectSection={(sec) => {
          if (sec === 'user-management' && currentUser.role !== 'Admin') return;
          setActiveSection(sec);
        }}
        lang={lang}
        onChangeLang={setLang}
        crmCount={crmRecords.length}
        quotationCount={quotations.length}
        userCount={users.length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Contextual Top Bar */}
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
            {/* Active User Identity & Role Badge */}
            <div className="hidden md:flex items-center gap-2.5 border-r border-slate-200 pr-3">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {currentUser.fullName}
                </p>
                <p className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {currentUser.email}
                </p>
              </div>
              <RoleBadge role={currentUser.role} lang={lang} />
            </div>

            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.signOut}</span>
            </button>
          </div>
        </header>

        {/* Active Module Canvas */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1360px] space-y-5">
            {welcomeBanner && (
              <div
                role="status"
                className="no-print flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{welcomeBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWelcomeBanner(null)}
                  className="rounded p-1 text-emerald-700 hover:bg-emerald-100"
                  aria-label="Dismiss welcome banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {safeSection === 'quick-entry' && (
              <AiQuickEntry
                lang={lang}
                existingQuotations={quotations}
                onSaveGeneratedBundle={handleSaveGeneratedBundle}
                onOpenCrmRecord={handleOpenCrmRecord}
                onOpenQuotation={handleOpenQuotation}
              />
            )}

            {safeSection === 'crm-board' && (
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
                canDelete={canDeleteRecordsAndQuotes}
              />
            )}

            {safeSection === 'quotation-builder' && (
              <QuotationBuilder
                lang={lang}
                quotations={quotations}
                activeQuotationId={activeQuotationId}
                onSelectQuotation={setActiveQuotationId}
                onAddQuotation={handleAddQuotation}
                onUpdateQuotation={handleUpdateQuotation}
                onDeleteQuotation={handleDeleteQuotation}
                canDelete={canDeleteRecordsAndQuotes}
                preparedBy={currentUser.fullName}
              />
            )}

            {safeSection === 'user-management' && currentUser.role === 'Admin' && (
              <UserManagement
                lang={lang}
                users={users}
                currentUser={currentUser}
                onAddUser={handleAdminAddUser}
                onUpdateUserRole={handleAdminUpdateUserRole}
                onResetUserPassword={handleAdminResetUserPassword}
                onToggleUserStatus={handleAdminToggleUserStatus}
                onDeleteUser={handleAdminDeleteUser}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

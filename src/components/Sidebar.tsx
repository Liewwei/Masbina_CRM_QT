import {
  FileSpreadsheet,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { AppUser, Language, NavSection } from '../types/masbina.ts';
import { UI_TEXT } from '../data/i18n.ts';
import { RoleBadge } from './RoleBadge.tsx';
import { MasbinaLetterheadLogo } from './MasbinaLogo.tsx';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  crmCount: number;
  quotationCount: number;
  userCount: number;
  currentUser: AppUser;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  lang,
  onChangeLang,
  crmCount,
  quotationCount,
  userCount,
  currentUser,
  onSignOut,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const t = UI_TEXT[lang];

  const navItems: Array<{
    id: NavSection;
    index: string;
    label: string;
    icon: typeof Sparkles;
    count?: number;
  }> = [
    {
      id: 'quick-entry',
      index: '01',
      label: t.navQuickEntry,
      icon: Sparkles,
    },
    {
      id: 'crm-board',
      index: '02',
      label: t.navCrmBoard,
      icon: Users,
      count: crmCount,
    },
    {
      id: 'quotation-builder',
      index: '03',
      label: t.navQuotationBuilder,
      icon: FileSpreadsheet,
      count: quotationCount,
    },
    ...(currentUser.role === 'Admin'
      ? [
          {
            id: 'user-management' as NavSection,
            index: '04',
            label: t.navUserManagement,
            icon: Shield,
            count: userCount,
          },
        ]
      : []),
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0F172A] text-slate-200 select-none">
      {/* Brand Lockup */}
      <div className="flex items-start justify-between border-b border-slate-800 px-5 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-white px-2 py-1 shrink-0">
              <MasbinaLetterheadLogo className="h-10 w-auto max-w-[110px] object-contain shrink-0" />
            </div>
            <span className="truncate font-semibold tracking-tight text-white text-[15px] leading-tight">
              {t.brandName}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {t.brandTagline}
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Primary Workspace">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isActive
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate whitespace-nowrap">
                  <span
                    className={`mr-1.5 font-mono text-xs tabular-nums ${
                      isActive ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {item.index}.
                  </span>
                  {item.label}
                </span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`ml-2 font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls: Active User Session, Sign Out & Language Switcher */}
      <div className="border-t border-slate-800 px-4 py-4 space-y-4">
        {/* Logged-in User Profile & Sign Out */}
        <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {currentUser.fullName}
              </p>
              <p className="truncate font-mono text-[11px] text-slate-400">
                {currentUser.email}
              </p>
            </div>
            <RoleBadge role={currentUser.role} lang={lang} surface="dark" />
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t.signOut}
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? 'Interface Language' : '界面语言'}</span>
            <span className="font-mono text-[11px] text-slate-500">MYR · RM</span>
          </div>
          <div
            className="grid grid-cols-2 gap-1 rounded-md bg-slate-900 p-1 border border-slate-800"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                lang === 'en'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('zh')}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                lang === 'zh'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              简体中文
            </button>
          </div>
        </div>

        <div className="text-[11px] leading-relaxed text-slate-400">
          <p className="font-medium text-slate-300">{t.frameworkLabel}</p>
          <p className="mt-1 text-slate-500">
            {lang === 'en'
              ? 'CCTV · Alarm · Access Control · Automation · Retail'
              : '监控 · 报警 · 门禁 · 自动化 · 零售'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

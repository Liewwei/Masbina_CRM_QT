import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import type { AppUser, Language, UserRole } from '../types/masbina.ts';
import { UI_TEXT, getRoleLabel } from '../data/i18n.ts';
import { generateSixDigitCode, isValidPassword } from '../data/seedData.ts';
import { MasbinaLetterheadLogo } from './MasbinaLogo.tsx';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthPageProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  users: AppUser[];
  onSignInSuccess: (user: AppUser, welcomeMessage?: string) => void;
  onRegisterUser: (user: AppUser) => void;
  onResetUserPasswordByEmail: (email: string, newPassword: string) => void;
}

export function AuthPage({
  lang,
  onChangeLang,
  users,
  onSignInSuccess,
  onRegisterUser,
  onResetUserPasswordByEmail,
}: AuthPageProps) {
  const t = UI_TEXT[lang];

  const [mode, setMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPw, setShowSignUpPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Forgot Password fields
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState<number>(0);
  const [enteredCode, setEnteredCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    if (nextMode !== 'signin') {
      setSuccessBanner(null);
    }
    if (nextMode === 'forgot') {
      setForgotStep(1);
      setEnteredCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);

    const normalizedEmail = signInEmail.trim().toLowerCase();
    const matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matched || matched.password !== signInPassword) {
      setError(t.invalidCredentialsError);
      return;
    }

    if (matched.status !== 'Active') {
      setError(t.accountSuspendedError);
      return;
    }

    onSignInSuccess(matched);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);

    const trimmedName = fullName.trim();
    const normalizedEmail = signUpEmail.trim().toLowerCase();

    if (!trimmedName) {
      setError(t.fullNameRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t.emailInvalidError);
      return;
    }

    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      setError(t.duplicateEmailError);
      return;
    }

    if (!isValidPassword(signUpPassword)) {
      setError(t.passwordRuleError);
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setError(t.passwordMatchError);
      return;
    }

    const now = new Date().toISOString();
    const assignedRole: UserRole = users.length === 0 ? 'Admin' : 'Technical';
    const newUser: AppUser = {
      id: `usr-${crypto.randomUUID()}`,
      fullName: trimmedName,
      email: normalizedEmail,
      password: signUpPassword,
      role: assignedRole,
      status: 'Active',
      createdAt: now,
      lastLoginAt: now,
    };

    onRegisterUser(newUser);
    onSignInSuccess(
      newUser,
      assignedRole === 'Admin' ? t.welcomeNewAdminBanner : t.welcomeNewUserBanner,
    );
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = forgotEmail.trim().toLowerCase();
    const matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matched) {
      setError(t.emailNotFoundError);
      return;
    }

    const code = generateSixDigitCode();
    setGeneratedCode(code);
    setCodeExpiresAt(Date.now() + 10 * 60 * 1000);
    setEnteredCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setForgotStep(2);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !generatedCode ||
      Date.now() > codeExpiresAt ||
      enteredCode.trim() !== generatedCode
    ) {
      setError(t.invalidCodeError);
      return;
    }

    if (!isValidPassword(resetNewPassword)) {
      setError(t.passwordRuleError);
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError(t.passwordMatchError);
      return;
    }

    const normalizedEmail = forgotEmail.trim().toLowerCase();
    onResetUserPasswordByEmail(normalizedEmail, resetNewPassword);

    setSignInEmail(normalizedEmail);
    setSignInPassword('');
    setGeneratedCode('');
    setForgotStep(1);
    setMode('signin');
    setSuccessBanner(t.passwordResetSuccess);
  };

  const signUpPwTooShort =
    signUpPassword.length > 0 && !isValidPassword(signUpPassword);
  const resetPwTooShort =
    resetNewPassword.length > 0 && !isValidPassword(resetNewPassword);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Brand Panel (Desktop Slate Navy Industrial Showcase) */}
      <aside className="hidden lg:flex lg:w-[440px] xl:w-[480px] lg:shrink-0 flex-col justify-between bg-[#0F172A] px-10 py-10 text-slate-200 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="rounded-md bg-white px-2.5 py-1.5 shrink-0">
              <MasbinaLetterheadLogo className="h-12 w-auto max-w-[130px] object-contain shrink-0" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold tracking-tight text-white">
                {t.brandName}
              </p>
              <p className="text-xs text-slate-400">{t.brandTagline}</p>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="text-2xl font-semibold tracking-tight text-white leading-snug text-balance">
              {t.authTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {t.authSubtitle}
            </p>
          </div>

          {/* Role Access Matrix Summary */}
          <div className="mt-10 border-t border-slate-800 pt-6 space-y-4 text-xs">
            <p className="font-semibold text-slate-300">
              {lang === 'en' ? 'Role-Based Access Levels' : '系统角色权限说明'}
            </p>
            <div className="space-y-3">
              <div className="border-b border-slate-800/80 pb-3">
                <p className="font-semibold text-blue-300">
                  01. {getRoleLabel('Admin', lang)}
                </p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Full workspace access across AI Entry, CRM, Quotations, and exclusive User Management controls.'
                    : '拥有智能录入、客户跟进、报价单及「用户权限管理」的完整控制权限。'}
                </p>
              </div>
              <div className="border-b border-slate-800/80 pb-3">
                <p className="font-semibold text-amber-300">
                  02. {getRoleLabel('Manager', lang)}
                </p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Manage sales pipeline, approve discounts, edit & delete quotations, and export formal PDFs.'
                    : '管理销售跟进看板、审批报价折扣、增删客户与报价单及导出正式 PDF。'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-emerald-300">
                  03. {getRoleLabel('Technical', lang)}
                </p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Log field survey notes, upload floor plans, update technical requirements & BOMs (deletion protected).'
                    : '录入现场勘察笔记与图纸、更新技术规格与工程清单（防误删保护）。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5 text-[11px] text-slate-500">
          <p>{t.frameworkLabel}</p>
          <p className="mt-1">
            {lang === 'en'
              ? 'CCTV · Alarm · Access Control · Automation · Security Retail'
              : '闭路电视 · 防盗报警 · 门禁出入 · 自动化系统 · 安防零售'}
          </p>
        </div>
      </aside>

      {/* Right Authentication Workspace */}
      <main className="flex flex-1 flex-col">
        {/* Top Bar with Mobile Brand & Bilingual Switcher */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white lg:bg-transparent lg:border-b-0">
          <div className="flex items-center gap-2.5 lg:invisible">
            <MasbinaLetterheadLogo className="h-11 w-auto max-w-[120px] object-contain shrink-0 mix-blend-multiply" />
            <span className="font-semibold text-sm text-slate-900 whitespace-nowrap">
              {t.brandName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeLang(lang === 'en' ? 'zh' : 'en')}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
          </button>
        </header>

        {/* Centered Authentication Card */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[460px] rounded-lg border border-slate-200 bg-white overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 pt-4 pb-3">
              <div
                className="grid grid-cols-3 gap-1 rounded-md bg-slate-200/70 p-1"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  onClick={() => switchMode('signin')}
                  className={`rounded px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tabSignIn}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => switchMode('signup')}
                  className={`rounded px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tabSignUp}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'forgot'}
                  onClick={() => switchMode('forgot')}
                  className={`rounded px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    mode === 'forgot'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.tabForgotPassword}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Success & Error Notices */}
              {successBanner && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successBanner}</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* MODE 1: SIGN IN */}
              {mode === 'signin' && (
                <>
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="signin-email"
                        className="block text-xs font-medium text-slate-700 mb-1.5"
                      >
                        {t.emailLabel}
                      </label>
                      <input
                        id="signin-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="signin-password"
                          className="block text-xs font-medium text-slate-700"
                        >
                          {t.passwordLabel}
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          {t.tabForgotPassword}?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="signin-password"
                          type={showSignInPw ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder={t.passwordPlaceholder}
                          className="w-full rounded-md border border-slate-200 py-2 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPw((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                          aria-label={
                            showSignInPw ? 'Hide password' : 'Show password'
                          }
                        >
                          {showSignInPw ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      {t.signInBtn}
                    </button>
                  </form>
                </>
              )}

              {/* MODE 2: SIGN UP */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.fullNameLabel}
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.emailLabel}
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.passwordLabel}
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showSignUpPw ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className={`w-full rounded-md border py-2 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                          signUpPwTooShort
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPw((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showSignUpPw ? 'Hide password' : 'Show password'
                        }
                      >
                        {showSignUpPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signUpPwTooShort && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {t.passwordRuleError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm"
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPasswordPlaceholder}
                        className="w-full rounded-md border border-slate-200 py-2 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showConfirmPw ? 'Hide confirm password' : 'Show confirm password'
                        }
                      >
                        {showConfirmPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-500">
                    {t.signUpRoleNote}
                  </p>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t.signUpBtn}
                  </button>
                </form>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {mode === 'forgot' && forgotStep === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <p className="text-xs leading-relaxed text-slate-600">
                    {t.forgotStep1Desc}
                  </p>

                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.emailLabel}
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <KeyRound className="h-4 w-4" />
                    {t.sendResetCodeBtn}
                  </button>
                </form>
              )}

              {mode === 'forgot' && forgotStep === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-4">
                  {/* On-Screen Demo Verification Code Box */}
                  <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-800">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>{t.demoCodeNoticeTitle}</span>
                    </div>
                    <p className="mt-1 text-blue-800/90">{t.demoCodeNoticeDesc}</p>
                    <div className="mt-2 flex items-center justify-between rounded border border-blue-200 bg-white px-3 py-2">
                      <span className="font-mono text-lg font-bold tracking-[0.2em] text-slate-900 tabular-nums">
                        {generatedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEnteredCode(generatedCode)}
                        className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                      >
                        {lang === 'en' ? 'Auto-Fill' : '自动填入'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reset-code"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.verificationCodeLabel}
                    </label>
                    <input
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder={t.verificationCodePlaceholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm tracking-widest text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reset-new-pw"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.newPasswordLabel}
                    </label>
                    <div className="relative">
                      <input
                        id="reset-new-pw"
                        type={showResetPw ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className={`w-full rounded-md border py-2 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                          resetPwTooShort
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPw((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showResetPw ? 'Hide password' : 'Show password'
                        }
                      >
                        {showResetPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {resetPwTooShort && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {t.passwordRuleError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reset-confirm-pw"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      {t.confirmNewPasswordLabel}
                    </label>
                    <input
                      id="reset-confirm-pw"
                      type={showResetPw ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <KeyRound className="h-4 w-4" />
                      {t.resetPasswordBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setError(null);
                      }}
                      className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      {t.backToEmailStep}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

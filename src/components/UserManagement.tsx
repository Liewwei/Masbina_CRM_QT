import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import {
  ALL_USER_ROLES,
  type AppUser,
  type Language,
  type UserRole,
} from '../types/masbina.ts';
import { UI_TEXT, getRoleLabel, getUserStatusLabel } from '../data/i18n.ts';
import { isValidPassword } from '../data/seedData.ts';
import { RoleBadge } from './RoleBadge.tsx';

interface UserManagementProps {
  lang: Language;
  users: AppUser[];
  currentUser: AppUser;
  onAddUser: (user: AppUser) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onResetUserPassword: (userId: string, newPassword: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

function formatDateShort(iso?: string, neverLabel = 'Never'): string {
  if (!iso) return neverLabel;
  return iso.slice(0, 10);
}

export function UserManagement({
  lang,
  users,
  currentUser,
  onAddUser,
  onUpdateUserRole,
  onResetUserPassword,
  onToggleUserStatus,
  onDeleteUser,
}: UserManagementProps) {
  const t = UI_TEXT[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('Technical');
  const [addError, setAddError] = useState<string | null>(null);

  // Reset Password Modal state
  const [resetTarget, setResetTarget] = useState<AppUser | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const stats = useMemo(() => {
    let activeAdmins = 0;
    let managers = 0;
    let technical = 0;

    for (const u of users) {
      if (u.role === 'Admin' && u.status === 'Active') activeAdmins += 1;
      if (u.role === 'Manager') managers += 1;
      if (u.role === 'Technical') technical += 1;
    }

    return {
      total: users.length,
      activeAdmins,
      managers,
      technical,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, roleFilter]);

  const isLastActiveAdmin = (user: AppUser): boolean => {
    return (
      user.role === 'Admin' &&
      user.status === 'Active' &&
      stats.activeAdmins <= 1
    );
  };

  const openAddModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('Technical');
    setShowNewPw(false);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const trimmedName = newName.trim();
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!trimmedName) {
      setAddError(t.fullNameRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAddError(t.emailInvalidError);
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      setAddError(t.duplicateEmailError);
      return;
    }

    if (!isValidPassword(newPassword)) {
      setAddError(t.passwordRuleError);
      return;
    }

    const created: AppUser = {
      id: `usr-${crypto.randomUUID()}`,
      fullName: trimmedName,
      email: normalizedEmail,
      password: newPassword,
      role: newRole,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    onAddUser(created);
    setShowAddModal(false);
    setFeedback({ type: 'success', message: t.userCreatedNotice });
  };

  const openResetModal = (user: AppUser) => {
    setResetTarget(user);
    setResetPw('');
    setResetConfirmPw('');
    setShowResetPw(false);
    setResetError(null);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);

    if (!isValidPassword(resetPw)) {
      setResetError(t.passwordRuleError);
      return;
    }

    if (resetPw !== resetConfirmPw) {
      setResetError(t.passwordMatchError);
      return;
    }

    onResetUserPassword(resetTarget.id, resetPw);
    setResetTarget(null);
    setFeedback({ type: 'success', message: t.userPwUpdatedNotice });
  };

  const handleRoleChange = (user: AppUser, nextRole: UserRole) => {
    if (isLastActiveAdmin(user) && nextRole !== 'Admin') {
      setFeedback({ type: 'error', message: t.lastAdminGuardMsg });
      return;
    }
    setFeedback(null);
    onUpdateUserRole(user.id, nextRole);
  };

  const handleStatusToggle = (user: AppUser) => {
    if (isLastActiveAdmin(user) && user.status === 'Active') {
      setFeedback({ type: 'error', message: t.lastAdminGuardMsg });
      return;
    }
    setFeedback(null);
    onToggleUserStatus(user.id);
  };

  const handleDeleteConfirm = (user: AppUser) => {
    if (isLastActiveAdmin(user)) {
      setFeedback({ type: 'error', message: t.lastAdminGuardMsg });
      setConfirmDeleteId(null);
      return;
    }
    setFeedback(null);
    onDeleteUser(user.id);
    setConfirmDeleteId(null);
  };

  const addPwTooShort = newPassword.length > 0 && !isValidPassword(newPassword);
  const resetPwTooShort = resetPw.length > 0 && !isValidPassword(resetPw);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t.userMgmtTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.userMgmtSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t.addUserBtn}
        </button>
      </div>

      {/* Feedback Notice */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-xs ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded p-1 hover:bg-black/5"
            aria-label="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiTotalUsers}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiActiveAdmins}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-blue-700 tabular-nums">
            {stats.activeAdmins}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">{t.kpiManagers}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-amber-700 tabular-nums">
            {stats.managers}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">
            {t.kpiTechnicalStaff}
          </p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-emerald-700 tabular-nums">
            {stats.technical}
          </p>
        </div>
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchUsersPlaceholder}
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-md bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              roleFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.allRoles}
          </button>
          {ALL_USER_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                roleFilter === role
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getRoleLabel(role, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-900">
              {t.emptyUsersTitle}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t.emptyUsersDesc}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">{t.colUserName}</th>
                  <th className="px-4 py-3">{t.colRole}</th>
                  <th className="px-4 py-3">{t.colUserStatus}</th>
                  <th className="px-4 py-3">{t.colCreated}</th>
                  <th className="px-4 py-3">{t.colLastLogin}</th>
                  <th className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  const protectedAdmin = isLastActiveAdmin(user);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {user.fullName}
                          </span>
                          {isSelf && (
                            <span className="text-xs font-medium text-blue-600">
                              {t.youTag}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">
                          {user.email}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} lang={lang} />
                          <select
                            value={user.role}
                            disabled={protectedAdmin}
                            title={protectedAdmin ? t.lastAdminGuardMsg : undefined}
                            aria-label={`Change role for ${user.fullName}`}
                            onChange={(e) =>
                              handleRoleChange(user, e.target.value as UserRole)
                            }
                            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            {ALL_USER_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {getRoleLabel(r, lang)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle whitespace-nowrap text-xs">
                        <span
                          className={
                            user.status === 'Active'
                              ? 'font-semibold text-emerald-700'
                              : 'font-semibold text-red-700'
                          }
                        >
                          {getUserStatusLabel(user.status, lang)}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle whitespace-nowrap font-mono text-xs text-slate-600 tabular-nums">
                        {formatDateShort(user.createdAt)}
                      </td>

                      <td className="px-4 py-3 align-middle whitespace-nowrap font-mono text-xs text-slate-600 tabular-nums">
                        {formatDateShort(user.lastLoginAt, t.neverLoggedIn)}
                      </td>

                      <td className="px-4 py-3 align-middle whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openResetModal(user)}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                            {t.actionResetPw}
                          </button>

                          <button
                            type="button"
                            disabled={protectedAdmin}
                            title={protectedAdmin ? t.lastAdminGuardMsg : undefined}
                            onClick={() => handleStatusToggle(user)}
                            className={`inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                              user.status === 'Active'
                                ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {user.status === 'Active' ? (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                {t.actionSuspend}
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                {t.actionActivate}
                              </>
                            )}
                          </button>

                          {confirmDeleteId === user.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteConfirm(user)}
                                className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                              >
                                {t.confirmDelete}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                {t.cancel}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={protectedAdmin}
                              title={protectedAdmin ? t.lastAdminGuardMsg : undefined}
                              onClick={() => setConfirmDeleteId(user.id)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`${t.actionDelete} ${user.fullName}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t.actionDelete}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.addUserModalTitle}
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">
                {t.addUserModalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                aria-label={t.closePanel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {addError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full rounded-md border py-2 pl-3 pr-10 text-sm text-slate-900 focus:outline-none ${
                      addPwTooShort
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                    aria-label={showNewPw ? 'Hide password' : 'Show password'}
                  >
                    {showNewPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {addPwTooShort && (
                  <p className="mt-1 text-xs text-red-600">{t.passwordRuleError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.initialRoleLabel}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {ALL_USER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {getRoleLabel(r, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                >
                  {t.addUserSubmitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.resetPwModalTitle}
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.resetPwModalTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  {resetTarget.fullName} · {resetTarget.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                aria-label={t.closePanel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
              {resetError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showResetPw ? 'text' : 'password'}
                    required
                    value={resetPw}
                    onChange={(e) => setResetPw(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full rounded-md border py-2 pl-3 pr-10 text-sm text-slate-900 focus:outline-none ${
                      resetPwTooShort
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                    aria-label={showResetPw ? 'Hide password' : 'Show password'}
                  >
                    {showResetPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {resetPwTooShort && (
                  <p className="mt-1 text-xs text-red-600">{t.passwordRuleError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.confirmNewPasswordLabel}
                </label>
                <input
                  type={showResetPw ? 'text' : 'password'}
                  required
                  value={resetConfirmPw}
                  onChange={(e) => setResetConfirmPw(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                >
                  {t.resetPwSubmitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

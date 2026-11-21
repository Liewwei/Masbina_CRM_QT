import type { Language, UserRole } from '../types/masbina.ts';
import { getRoleLabel } from '../data/i18n.ts';

interface RoleBadgeProps {
  role: UserRole;
  lang: Language;
  surface?: 'light' | 'dark';
}

export function RoleBadge({ role, lang, surface = 'light' }: RoleBadgeProps) {
  const styles =
    surface === 'dark'
      ? {
          Admin: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
          Manager: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
          Technical: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
        }
      : {
          Admin: 'bg-blue-50 text-blue-700 border-blue-200',
          Manager: 'bg-amber-50 text-amber-800 border-amber-200',
          Technical: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap shrink-0 ${styles[role]}`}
    >
      {getRoleLabel(role, lang)}
    </span>
  );
}
